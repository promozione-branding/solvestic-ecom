import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Category from "@/models/category.model.js";
import { deleteR2Image, uploadCategoryImage } from "@/lib/r2";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

function generateSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid category ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const category = await Category.findById(id).lean();

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Fetch category error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch category." },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    let newImageKey = "";

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid category ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found." },
                { status: 404 }
            );
        }

        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const submittedSlug = String(formData.get("slug") || "").trim();
        const slug = generateSlug(submittedSlug || name);
        const metaTitle = String(formData.get("metaTitle") || "").trim();
        const metaDescription = String(
            formData.get("metaDescription") || ""
        ).trim();
        const description = String(
            formData.get("description") || ""
        ).trim();

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Category name is required." },
                { status: 400 }
            );
        }

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
        }).lean();

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "This category already exists." },
                { status: 409 }
            );
        }

        const image = formData.get("image");
        const hasNewImage = image instanceof File && image.size > 0;

        let uploaded = null;

        if (hasNewImage) {
            uploaded = await uploadCategoryImage(image);
            newImageKey = uploaded.imageKey;
        }

        const oldImageKey = category.imageKey;

        category.name = name;
        category.slug = slug;
        category.metaTitle = metaTitle;
        category.metaDescription = metaDescription;
        category.description = description;

        if (uploaded) {
            category.imageUrl = uploaded.imageUrl;
            category.imageKey = uploaded.imageKey;
        }

        await category.save();

        // Delete the old image only after the updated document is saved.
        if (uploaded && oldImageKey) {
            try {
                await deleteR2Image(oldImageKey);
            } catch (cleanupError) {
                console.error("Old R2 image cleanup failed:", cleanupError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Category updated successfully.",
            category,
        });
    } catch (error) {
        console.error("Update category error:", error);

        if (newImageKey) {
            try {
                await deleteR2Image(newImageKey);
            } catch (cleanupError) {
                console.error("New R2 image cleanup failed:", cleanupError);
            }
        }

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This category already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update category." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid category ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found." },
                { status: 404 }
            );
        }

        // Remove the database record first.
        await category.deleteOne();

        // Attempt R2 cleanup separately.
        if (category.imageKey) {
            try {
                await deleteR2Image(category.imageKey);
            } catch (cleanupError) {
                console.error("R2 image deletion failed:", cleanupError);

                return NextResponse.json({
                    success: true,
                    message:
                        "Category deleted, but its image could not be removed from R2. Check server logs for cleanup.",
                    imageCleanupFailed: true,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Category and its image deleted successfully.",
        });
    } catch (error) {
        console.error("Delete category error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete category." },
            { status: 500 }
        );
    }
}