
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Product from "@/models/product.model";
import ProductReview from "@/models/product-review.model";
import User from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
    try {
        const { productId } = await params;

        if (!mongoose.isValidObjectId(productId)) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID." },
                { status: 400 }
            );
        }

        await connectDB();
        const product = await Product.findById(productId).select("_id").lean();

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found." },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10) || 10));

        const filter = {
            productId: new mongoose.Types.ObjectId(productId),
        };

        const [reviews, total, ratingStats] = await Promise.all([
            ProductReview.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate({
                    path: "userId",
                    select: "name",
                    model: User,
                })
                .lean(),

            ProductReview.countDocuments(filter),

            ProductReview.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: "$rating",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const ratingBreakdown = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        for (const item of ratingStats) {
            ratingBreakdown[item._id] = item.count;
        }

        const totalReviews = Object.values(ratingBreakdown).reduce(
            (sum, count) => sum + count,
            0
        );

        const ratingTotal = Object.entries(ratingBreakdown).reduce(
            (sum, [rating, count]) => sum + Number(rating) * count,
            0
        );

        const averageRating = totalReviews
            ? Number((ratingTotal / totalReviews).toFixed(1))
            : 0;

        const formattedReviews = reviews.map((item) => ({
            _id: item._id,
            rating: item.rating,
            title: item.title,
            review: item.review,
            media: item.media || [],
            isVerifiedPurchase: item.isVerifiedPurchase,
            helpfulCount: item.helpfulCount,
            customerName: item.userId?.name || "Customer",
            createdAt: item.createdAt,
        }));

        // console.log(averageRating, totalReviews, ratingBreakdown, formattedReviews)

        return NextResponse.json({
            success: true,
            reviews: formattedReviews,
            summary: {
                averageRating,
                totalReviews,
                ratingBreakdown,
            },
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalReviews / limit),
                hasMore: page * limit < totalReviews,
            },
        });
    } catch (error) {
        console.error("Fetch product reviews error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch product reviews.",
            },
            { status: 500 }
        );
    }
}