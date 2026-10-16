import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";
import { verifyAdminToken } from "@/lib/admin-session";
import {
    createPermalink,
    validateBlogFields,
} from "@/lib/blog-helpers";
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

// GET: Fetch a single blog
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
                { success: false, message: "Invalid blog ID." },
                { status: 400 }
            );
        }

        const blog = await Blog.findById(id).lean();

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, blog });
    } catch (error) {
        console.error("Get blog error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch blog." },
            { status: 500 }
        );
    }
}

// PUT: Update a blog and optionally replace its image
export async function PUT(request, { params }) {
    let uploadedImageKey = "";

    try {
        if (!authorize(request)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

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

        const title = String(
            formData.get("title") ?? blog.title
        ).trim();

        const rawDate = formData.get("date");
        const date = String(
            rawDate ?? blog.date.toISOString()
        ).trim();

        const content = String(
            formData.get("content") ?? blog.content
        ).trim();

        const permalinkInput = String(
            formData.get("permalink") ?? blog.permalink
        ).trim();

        const permalink = createPermalink(permalinkInput);

        const metaTitle = String(
            formData.get("metaTitle") ?? blog.metaTitle ?? ""
        ).trim();

        const metaDescription = String(
            formData.get("metaDescription") ?? blog.metaDescription ?? ""
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

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { success: false, message: "Invalid blog date." },
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

            // Upload replacement image to R2.
            const uploaded = await uploadBlogImage(file);

            // Match the actual return shape from your R2 helper.
            newImage = uploaded?.imageUrl;
            newImageKey = uploaded?.imageKey;

            if (!newImage || !newImageKey) {
                // If upload returned an object key, clean it up if possible.
                if (newImageKey) {
                    try {
                        await deleteR2Image(newImageKey);
                    } catch (cleanupError) {
                        console.error(
                            "Incomplete upload cleanup error:",
                            cleanupError
                        );
                    }
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: "Image upload did not return a valid image URL and key.",
                    },
                    { status: 500 }
                );
            }

            // Track the new upload in case the database update fails.
            uploadedImageKey = newImageKey;
        }

        blog.title = title;
        blog.date = parsedDate;
        blog.permalink = permalink;
        blog.content = content;
        blog.metaTitle = metaTitle;
        blog.metaDescription = metaDescription;
        blog.image = newImage;
        blog.imageFileId = newImageKey;

        await blog.save();

        // Database update succeeded. Now delete the old R2 image.
        if (
            uploadedImageKey &&
            oldImageKey &&
            oldImageKey !== newImageKey
        ) {
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
        // If saving fails after uploading a replacement, remove the new image.
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

// DELETE: Delete a blog and its associated R2 image
export async function DELETE(request, { params }) {
    try {
        if (!authorize(request)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

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

        const imageKey = blog.imageFileId;

        // Delete the database record first.
        await blog.deleteOne();

        if (imageKey) {
            try {
                await deleteR2Image(imageKey);
            } catch (error) {
                console.error("Deleted blog image cleanup error:", error);

                return NextResponse.json({
                    success: true,
                    message:
                        "Blog deleted, but its image could not be removed from R2.",
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Blog and associated image deleted successfully.",
        });
    } catch (error) {
        console.error("Delete blog error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete blog." },
            { status: 500 }
        );
    }
}