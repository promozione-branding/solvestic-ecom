import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/category.model.js";
import { uploadCategoryImage } from "@/lib/r2";
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

export async function GET(request) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        await connectDB();

        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error("Fetch categories error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch categories." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    let uploadedKey = "";

    try {
        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const submittedSlug = String(formData.get("slug") || "").trim();
        const slug = generateSlug(submittedSlug || name);

        const metaTitle = String(formData.get("metaTitle") || "").trim();
        const metaDescription = String(
            formData.get("metaDescription") || ""
        ).trim();
        const description = String(formData.get("description") || "").trim();
        const image = formData.get("image");

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Category name is required." },
                { status: 400 }
            );
        }

        if (!(image instanceof File) || image.size === 0) {
            return NextResponse.json(
                { success: false, message: "Please select a category image." },
                { status: 400 }
            );
        }

        await connectDB();

        const existing = await Category.findOne({
            name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
        }).lean();

        if (existing) {
            return NextResponse.json(
                { success: false, message: "This category already exists." },
                { status: 409 }
            );
        }

        const uploaded = await uploadCategoryImage(image);
        uploadedKey = uploaded.imageKey;

        const category = await Category.create({
            name,
            metaTitle,
            slug,
            metaDescription,
            description,
            imageUrl: uploaded.imageUrl,
            imageKey: uploaded.imageKey,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully.",
                category,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create category error:", error);

        // Avoid leaving an uploaded image behind if saving fails.
        if (uploadedKey) {
            try {
                const { deleteR2Image } = await import("@/lib/r2");
                await deleteR2Image(uploadedKey);
            } catch (cleanupError) {
                console.error("R2 cleanup failed:", cleanupError);
            }
        }

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This category already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create category." },
            { status: 500 }
        );
    }
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}