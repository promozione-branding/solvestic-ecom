
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/product.model.js";
import Category from "@/models/category.model.js";
import {
    uploadCategoryImage,
    deleteR2Image,
} from "@/lib/r2";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

function generateSlug(value = "") {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseJSON(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function validVariants(variants) {
    if (!Array.isArray(variants) || variants.length === 0) {
        return false;
    }

    const sizes = new Set();

    for (const variant of variants) {
        if (!variant || typeof variant.size !== "string") {
            return false;
        }

        const size = variant.size.trim().toLowerCase();

        if (
            !size ||
            sizes.has(size) ||
            variant.oldPrice === "" ||
            variant.price === "" ||
            !Number.isFinite(Number(variant.oldPrice)) ||
            !Number.isFinite(Number(variant.price)) ||
            Number(variant.oldPrice) < 0 ||
            Number(variant.price) < 0
        ) {
            return false;
        }

        sizes.add(size);
    }

    return true;
}

function validSpecifications(specifications) {
    return (
        Array.isArray(specifications) &&
        specifications.every(
            (spec) =>
                spec &&
                typeof spec.key === "string" &&
                typeof spec.value === "string" &&
                spec.key.trim() &&
                spec.value.trim()
        )
    );
}

function validVideoUrl(value) {
    if (!value) return true;

    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}

async function cleanupImages(images) {
    await Promise.allSettled(
        images
            .map((image) => image?.key)
            .filter(Boolean)
            .map((key) => deleteR2Image(key))
    );
}

export async function GET(request, { params }) {
    // const authError = requireAdmin(request);
    // if (authError) return authError;

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.findById(id)
            .populate("categoryId", "name slug")
            .lean();

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error("Fetch product error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch product." },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const newlyUploadedImages = [];

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found." },
                { status: 404 }
            );
        }

        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const categoryId = String(formData.get("categoryId") || "").trim();
        const slug = generateSlug(
            String(formData.get("slug") || "").trim() || name
        );

        const metaTitle = String(formData.get("metaTitle") || "").trim();
        const metaDescription = String(
            formData.get("metaDescription") || ""
        ).trim();
        const shortDescription = String(
            formData.get("shortDescription") || ""
        ).trim();
        const longDescription = String(
            formData.get("longDescription") || ""
        );
        const videoUrl = String(formData.get("videoUrl") || "").trim();
        const status = String(formData.get("status") || "active");

        const variants = parseJSON(formData.get("variants"));
        const specifications = parseJSON(
            formData.get("specifications")
        );
        const retainedImages = parseJSON(
            formData.get("retainedImages"),
            []
        );

        const newFiles = formData
            .getAll("images")
            .filter((file) => file instanceof File && file.size > 0);

        if (!name || !slug || !categoryId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product name, slug and category are required.",
                },
                { status: 400 }
            );
        }

        if (!mongoose.isValidObjectId(categoryId)) {
            return NextResponse.json(
                { success: false, message: "Invalid category ID." },
                { status: 400 }
            );
        }

        if (!validVariants(variants)) {
            return NextResponse.json(
                { success: false, message: "Invalid bottle variants or prices." },
                { status: 400 }
            );
        }

        if (!validSpecifications(specifications)) {
            return NextResponse.json(
                { success: false, message: "Invalid product specifications." },
                { status: 400 }
            );
        }

        if (
            !Array.isArray(retainedImages) ||
            retainedImages.some(
                (item) => !item || typeof item.key !== "string"
            )
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid retained images." },
                { status: 400 }
            );
        }

        if (
            !["active", "inactive"].includes(status) ||
            !validVideoUrl(videoUrl)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid status or video URL." },
                { status: 400 }
            );
        }

        if (
            newFiles.some(
                (file) =>
                    file.size > MAX_IMAGE_SIZE ||
                    !ALLOWED_TYPES.includes(file.type)
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Images must be JPG, PNG, WEBP or AVIF, up to 5MB each.",
                },
                { status: 400 }
            );
        }

        const category = await Category.findById(categoryId).lean();

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Selected category was not found." },
                { status: 400 }
            );
        }

        const duplicate = await Product.findOne({
            _id: { $ne: id },
            slug,
        }).lean();

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "This product slug already exists." },
                { status: 409 }
            );
        }

        // Only retain images belonging to this product.
        const oldImages = product.images || [];
        const retainedKeys = new Set(retainedImages.map((image) => image.key));

        const validRetainedImages = oldImages.filter(
            (image) => retainedKeys.has(image.key)
        );

        if (retainedImages.some(
            (image) => !oldImages.some((old) => old.key === image.key)
        )) {
            return NextResponse.json(
                { success: false, message: "An image does not belong to this product." },
                { status: 400 }
            );
        }

        if (
            validRetainedImages.length + newFiles.length === 0 ||
            validRetainedImages.length + newFiles.length > MAX_IMAGES
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Keep or upload between 1 and ${MAX_IMAGES} images.`,
                },
                { status: 400 }
            );
        }

        const uploadedImages = [];

        for (const file of newFiles) {
            const uploaded = await uploadCategoryImage(file);

            newlyUploadedImages.push({
                url: uploaded.imageUrl,
                key: uploaded.imageKey,
            });

            uploadedImages.push({
                url: uploaded.imageUrl,
                key: uploaded.imageKey,
            });
        }

        product.name = name;
        product.categoryId = categoryId;
        product.slug = slug;
        product.metaTitle = metaTitle;
        product.metaDescription = metaDescription;
        product.variants = variants.map((variant) => ({
            size: variant.size.trim(),
            oldPrice: Number(variant.oldPrice),
            price: Number(variant.price),
        }));
        product.specifications = specifications.map((spec) => ({
            key: spec.key.trim(),
            value: spec.value.trim(),
        }));
        product.shortDescription = shortDescription;
        product.longDescription = longDescription;
        product.videoUrl = videoUrl;
        product.status = status;
        product.images = [...validRetainedImages, ...uploadedImages];

        await product.save();

        const removedImages = oldImages.filter(
            (image) => !retainedKeys.has(image.key)
        );

        await cleanupImages(removedImages);

        return NextResponse.json({
            success: true,
            message: "Product updated successfully.",
            product,
        });
    } catch (error) {
        console.error("Update product error:", error);

        await cleanupImages(newlyUploadedImages);

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This product slug already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update product." },
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
                { success: false, message: "Invalid product ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found." },
                { status: 404 }
            );
        }

        await product.deleteOne();

        await cleanupImages(product.images || []);

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully.",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete product." },
            { status: 500 }
        );
    }
}
