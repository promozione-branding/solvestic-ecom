
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import Product from "@/models/product.model";
import ProductReview from "@/models/product-review.model";
import {
    uploadReviewContent,
    deleteR2Image,
} from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGES = 5;
const MAX_VIDEO = 1;
const MAX_FILES = 6;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

async function getCustomer(request) {
    const token = request.cookies.get("solvestic_user_token")?.value;

    if (!token || !process.env.JWT_USER_SECRET) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);

        if (
            typeof decoded === "string" ||
            decoded.type !== "customer" ||
            !mongoose.isValidObjectId(decoded.userId)
        ) {
            return null;
        }

        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(request) {
    const uploadedKeys = [];

    try {
        const userId = await getCustomer(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please log in to submit a review." },
                { status: 401 }
            );
        }

        await connectDB();

        const formData = await request.formData();

        const productId = formData.get("productId");
        const title = formData.get("title");
        const review = formData.get("review");
        const ratingValue = formData.get("rating");

        if (
            typeof productId !== "string" ||
            !mongoose.isValidObjectId(productId)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID." },
                { status: 400 }
            );
        }

        const rating = Number(ratingValue);

        if (
            !Number.isFinite(rating) ||
            rating < 0.5 ||
            rating > 5 ||
            !Number.isInteger(rating * 2)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Rating must be between 0.5 and 5 in half-star increments.",
                },
                { status: 400 }
            );
        }

        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 150
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a title up to 150 characters." },
                { status: 400 }
            );
        }

        if (
            typeof review !== "string" ||
            !review.trim() ||
            review.trim().length > 3000
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a review up to 3000 characters." },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found." },
                { status: 404 }
            );
        }

        const existingReview = await ProductReview.exists({
            productId,
            userId,
        });

        if (existingReview) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already reviewed this product.",
                },
                { status: 409 }
            );
        }

        const files = formData.getAll("media");

        // Ignore empty file inputs sometimes sent by browsers.
        const mediaFiles = files.filter(
            (file) => file instanceof File && file.size > 0
        );

        if (files.some((file) => !(file instanceof File))) {
            return NextResponse.json(
                { success: false, message: "Invalid media upload." },
                { status: 400 }
            );
        }

        if (mediaFiles.length > MAX_FILES) {
            return NextResponse.json(
                { success: false, message: "You can upload up to 6 files." },
                { status: 400 }
            );
        }

        const images = mediaFiles.filter((file) =>
            file.type.startsWith("image/")
        );

        const videos = mediaFiles.filter((file) =>
            file.type.startsWith("video/")
        );

        if (
            images.length !== mediaFiles.filter(
                (file) => file.type.startsWith("image/")
            ).length ||
            mediaFiles.some(
                (file) =>
                    !file.type.startsWith("image/") &&
                    !file.type.startsWith("video/")
            )
        ) {
            return NextResponse.json(
                { success: false, message: "Unsupported media type." },
                { status: 400 }
            );
        }

        if (images.length > MAX_IMAGES || videos.length > MAX_VIDEO) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Upload up to 5 images and 1 video.",
                },
                { status: 400 }
            );
        }

        const totalSize = mediaFiles.reduce(
            (total, file) => total + file.size,
            0
        );

        if (totalSize > MAX_TOTAL_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Total review media size cannot exceed 50 MB.",
                },
                { status: 400 }
            );
        }

        const media = [];

        for (const file of mediaFiles) {
            const uploaded = await uploadReviewContent(file);

            uploadedKeys.push(uploaded.key);
            media.push(uploaded);
        }

        const newReview = await ProductReview.create({
            productId,
            userId,
            rating,
            title: title.trim(),
            review: review.trim(),
            media,
            status: "pending",
            isVerifiedPurchase: false,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Review submitted successfully and is awaiting approval.",
                review: {
                    _id: newReview._id,
                    productId: newReview.productId,
                    rating: newReview.rating,
                    title: newReview.title,
                    review: newReview.review,
                    media: newReview.media,
                    status: newReview.status,
                    createdAt: newReview.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        // Remove uploaded R2 files if saving the review fails.
        await Promise.allSettled(
            uploadedKeys.map((key) => deleteR2Image(key))
        );

        if (error?.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already reviewed this product.",
                },
                { status: 409 }
            );
        }

        console.error("Create product review error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to submit your review. Please try again.",
            },
            { status: 500 }
        );
    }
}
