import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";

export async function GET() {
    try {
        await connectDB();

        const blogs = await Blog.find({})
            .select("title date permalink image metaTitle metaDescription")
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return NextResponse.json(
            { success: true, blogs },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get public blogs error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}