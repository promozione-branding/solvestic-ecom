
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/product.model.js";

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        // console.log(slug)

        // Build query
        const query = { status: "active" };

        if (slug) {
            query.slug = slug;
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        let productsQuery = Product.find(query)
            .populate("categoryId", "name slug")
            .sort({ createdAt: -1 })
            .lean();

        const products = await productsQuery;

        if (slug && !products.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                count: products.length,
                products: slug ? products[0] : products,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get products error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch products",
            },
            { status: 500 }
        );
    }
}
