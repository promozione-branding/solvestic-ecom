
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";
import { verifyAdminToken } from "@/lib/admin-session";
import {
    createPermalink,
    validateBlogFields,
} from "@/lib/blog-helpers";

// Replace these with your existing R2 helper exports/signature.
import { uploadBlogImage } from "@/lib/r2";

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

export async function GET(request) {
    if (!authorize(request)) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(searchParams.get("limit")) || 10)
        );

        const filter = {};

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { title: { $regex: escaped, $options: "i" } },
                { permalink: { $regex: escaped, $options: "i" } },
            ];
        }

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .sort({ date: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Blog.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            blogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        console.error("Get blogs error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch blogs." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    if (!authorize(request)) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    let uploadedImageKey = "";

    try {
        await connectDB();

        const formData = await request.formData();

        const title = String(formData.get("title") || "").trim();
        const date = String(formData.get("date") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const permalinkInput = String(
            formData.get("permalink") || title
        ).trim();
        const permalink = createPermalink(permalinkInput);

        const metaTitle = String(formData.get("metaTitle") || "").trim();
        const metaDescription = String(
            formData.get("metaDescription") || ""
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

        const duplicate = await Blog.findOne({ permalink }).lean();

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "This permalink already exists." },
                { status: 409 }
            );
        }

        let image = "";
        let imageFileId = "";

        const file = formData.get("image");

        if (file && typeof file !== "string" && file.size > 0) {
            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { success: false, message: "Please upload an image file." },
                    { status: 400 }
                );
            }

            // Adapt this call to your existing R2 helper.
            const uploaded = await uploadBlogImage(file);

            image = uploaded.url;
            imageFileId = uploaded.key;
            uploadedImageKey = imageFileId;
        }

        const blog = await Blog.create({
            title,
            date: new Date(date),
            permalink,
            content,
            image,
            imageFileId,
            metaTitle,
            metaDescription,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Blog created successfully.",
                blog,
            },
            { status: 201 }
        );
    } catch (error) {
        // Clean up the new upload if database creation fails.
        if (uploadedImageKey) {
            try {
                const { deleteR2Image } = await import("@/lib/r2");
                await deleteR2Image(uploadedImageKey);
            } catch (cleanupError) {
                console.error("Blog image cleanup error:", cleanupError);
            }
        }

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This permalink already exists." },
                { status: 409 }
            );
        }

        console.error("Create blog error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to create blog." },
            { status: 500 }
        );
    }
}
