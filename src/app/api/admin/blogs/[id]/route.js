
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";
import { verifyAdminToken } from "@/lib/admin-session";
import {
    createPermalink,
    validateBlogFields,
} from "@/lib/blog-helpers";

// Replace with your existing R2 helper exports/signature.
import { uploadBlogImage, deleteR2Image } from "@/lib/r2";

export const runtime = "nodejs";

function authorize(request) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) return false;

    try {
        return Boolean(verifyAdminToken(token));
    } catch {
        return false;
    }
}

export async function GET(request, { params }) {
    try {
        if (!authorize(request)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        await connectDB();

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { message: "Invalid blog ID" },
                { status: 400 }
            );
        }

        const blog = await Blog.findById(id).lean();

        if (!blog) {
            return NextResponse.json(
                { message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ blog }, { status: 200 });
    } catch (error) {
        console.error("Get blog by ID error:", error);

        return NextResponse.json(
            { message: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    if (!authorize(request)) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    let uploadedImageKey = "";

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid blog ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found." },
                { status: 404 }
            );
        }

        const formData = await request.formData();

        const title = String(formData.get("title") ?? blog.title).trim();
        const date = String(
            formData.get("date") ?? blog.date.toISOString()
        ).trim();
        const content = String(
            formData.get("content") ?? blog.content
        ).trim();

        const permalinkInput = String(
            formData.get("permalink") ?? blog.permalink
        ).trim();

        const permalink = createPermalink(permalinkInput);

        const metaTitle = String(
            formData.get("metaTitle") ?? blog.metaTitle
        ).trim();

        const metaDescription = String(
            formData.get("metaDescription") ?? blog.metaDescription
        ).trim();

        const validationError = validateBlogFields({
            title,
            date,
            permalink,
            content,
        });

        if (validationError) {
            return NextResponse.json(
                { success: false, message: validationError },
                { status: 400 }
            );
        }

        const duplicate = await Blog.findOne({
            permalink,
            _id: { $ne: id },
        }).lean();

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "This permalink already exists." },
                { status: 409 }
            );
        }

        const oldImageKey = blog.imageFileId;
        let newImage = blog.image;
        let newImageKey = blog.imageFileId;

        const file = formData.get("image");

        if (file && typeof file !== "string" && file.size > 0) {
            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { success: false, message: "Please upload an image file." },
                    { status: 400 }
                );
            }

            const uploaded = await uploadBlogImage(file);

            newImage = uploaded.url;
            newImageKey = uploaded.key;
            uploadedImageKey = newImageKey;
        }

        blog.title = title;
        blog.date = new Date(date);
        blog.permalink = permalink;
        blog.content = content;
        blog.metaTitle = metaTitle;
        blog.metaDescription = metaDescription;
        blog.image = newImage;
        blog.imageFileId = newImageKey;

        await blog.save();

        // Only remove the old image after the updated record is saved.
        if (uploadedImageKey && oldImageKey && oldImageKey !== newImageKey) {
            try {
                await deleteR2Image(oldImageKey);
            } catch (cleanupError) {
                console.error("Old blog image cleanup error:", cleanupError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Blog updated successfully.",
            blog,
        });
    } catch (error) {
        if (uploadedImageKey) {
            try {
                await deleteR2Image(uploadedImageKey);
            } catch (cleanupError) {
                console.error("New blog image cleanup error:", cleanupError);
            }
        }

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This permalink already exists." },
                { status: 409 }
            );
        }

        console.error("Update blog error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update blog." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    if (!authorize(request)) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid blog ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found." },
                { status: 404 }
            );
        }

        // Delete the database record first. A failed R2 deletion can be retried.
        await blog.deleteOne();

        if (blog.imageFileId) {
            try {
                await deleteR2Image(blog.imageFileId);
            } catch (error) {
                console.error("Deleted blog image cleanup error:", error);

                return NextResponse.json({
                    success: true,
                    message:
                        "Blog deleted, but its image could not be removed from storage.",
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Blog deleted successfully.",
        });
    } catch (error) {
        console.error("Delete blog error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete blog." },
            { status: 500 }
        );
    }
}
