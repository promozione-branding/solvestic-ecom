
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";

export const runtime = "nodejs";

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        await connectDB();

        const blog = await Blog.findOne({
            permalink: slug.toLowerCase(),
        }).lean();

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            blog,
        });
    } catch (error) {
        console.error("Get blog by slug error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch blog." },
            { status: 500 }
        );
    }
}
