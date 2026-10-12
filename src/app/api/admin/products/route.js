
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/category.model.js";
import Product from "@/models/product.model.js";
import { uploadCategoryImage, deleteR2Image } from "@/lib/r2";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function generateSlug(value = "") {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseJSON(value, fallback) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

export async function GET(request) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const categoryId = searchParams.get("categoryId") || "";
        const status = searchParams.get("status") || "";

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: escapeRegex(search), $options: "i" } },
                { slug: { $regex: escapeRegex(search), $options: "i" } },
            ];
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (["active", "inactive"].includes(status)) {
            filter.status = status;
        }

        const products = await Product.find(filter)
            .populate("categoryId", "name slug")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("Fetch products error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch products." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const uploadedKeys = [];

    try {
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

        const variants = parseJSON(formData.get("variants") || "[]", null);
        const specifications = parseJSON(
            formData.get("specifications") || "[]",
            null
        );

        const images = formData
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


        if (!validVariants(variants)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Add at least one valid bottle size with unique sizes and non-negative prices.",
                },
                { status: 400 }
            );
        }


        if (
            !Array.isArray(specifications) ||
            specifications.some(
                (spec) =>
                    !spec ||
                    typeof spec.key !== "string" ||
                    typeof spec.value !== "string" ||
                    !spec.key.trim() ||
                    !spec.value.trim()
            )
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid product specifications." },
                { status: 400 }
            );
        }

        if (images.length === 0 || images.length > MAX_IMAGES) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Upload between 1 and ${MAX_IMAGES} product images.`,
                },
                { status: 400 }
            );
        }

        if (
            images.some(
                (image) =>
                    image.size > MAX_IMAGE_SIZE ||
                    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
                        image.type
                    )
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Each image must be JPG, PNG, WEBP or AVIF, up to 5MB.",
                },
                { status: 400 }
            );
        }

        if (!["active", "inactive"].includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid product status." },
                { status: 400 }
            );
        }

        if (videoUrl) {
            try {
                const url = new URL(videoUrl);
                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Invalid protocol");
                }
            } catch {
                return NextResponse.json(
                    { success: false, message: "Enter a valid video URL." },
                    { status: 400 }
                );
            }
        }

        await connectDB();

        const category = await Category.findById(categoryId).lean();

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Selected category was not found." },
                { status: 400 }
            );
        }

        const existingSlug = await Product.findOne({ slug }).lean();

        if (existingSlug) {
            return NextResponse.json(
                { success: false, message: "This product slug already exists." },
                { status: 409 }
            );
        }

        const uploadedImages = [];

        for (const image of images) {
            const uploaded = await uploadCategoryImage(image);
            uploadedKeys.push(uploaded.imageKey);

            uploadedImages.push({
                url: uploaded.imageUrl,
                key: uploaded.imageKey,
            });
        }

        const product = await Product.create({
            name,
            categoryId,
            slug,
            metaTitle,
            metaDescription,

            variants: variants.map((variant) => ({
                size: variant.size.trim(),
                oldPrice: Number(variant.oldPrice),
                price: Number(variant.price),
            })),

            images: uploadedImages,
            videoUrl,
            specifications: specifications.map((spec) => ({
                key: spec.key.trim(),
                value: spec.value.trim(),
            })),
            shortDescription,
            longDescription,
            status,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product created successfully.",
                product,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create product error:", error);

        await Promise.allSettled(
            uploadedKeys.map((key) => deleteR2Image(key))
        );

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This product slug already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create product." },
            { status: 500 }
        );
    }
}
