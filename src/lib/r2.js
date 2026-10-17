import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const bucket = process.env.CLOUD_FLARE_R2_BUCKET;
const publicUrl = process.env.CLOUD_FLARE_R2_PUBLIC_URL?.replace(/\/+$/, "");

const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUD_FLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUD_FLARE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUD_FLARE_SECRET_ACCESS_KEY,
    },
});

export async function uploadCategoryImage(file) {
    if (!bucket || !publicUrl) {
        throw new Error("R2 bucket or public URL is not configured.");
    }

    const allowedTypes = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
    };

    if (!allowedTypes[file.type]) {
        throw new Error("Only JPG, PNG, WEBP, and AVIF images are allowed.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size === 0 || file.size > maxSize) {
        throw new Error("Image must be smaller than 5 MB.");
    }

    const extension = allowedTypes[file.type];
    const key = `products/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    return {
        imageKey: key,
        imageUrl: `${publicUrl}/${key}`,
    };
}

export async function uploadBlogImage(file) {
    if (!bucket || !publicUrl) {
        throw new Error("R2 bucket or public URL is not configured.");
    }

    const allowedTypes = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
    };

    if (!allowedTypes[file.type]) {
        throw new Error("Only JPG, PNG, WEBP, and AVIF images are allowed.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size === 0 || file.size > maxSize) {
        throw new Error("Image must be smaller than 5 MB.");
    }

    const extension = allowedTypes[file.type];
    const key = `blogs/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    return {
        imageKey: key,
        imageUrl: `${publicUrl}/${key}`,
    };
}

export async function uploadReviewContent(file) {
    if (!bucket || !publicUrl) {
        throw new Error("R2 bucket or public URL is not configured.");
    }

    const allowedTypes = {
        // Images
        "image/jpeg": { extension: "jpg", type: "image" },
        "image/png": { extension: "png", type: "image" },
        "image/webp": { extension: "webp", type: "image" },
        "image/avif": { extension: "avif", type: "image" },

        // Videos
        "video/mp4": { extension: "mp4", type: "video" },
        "video/webm": { extension: "webm", type: "video" },
        "video/quicktime": { extension: "mov", type: "video" },
    };

    const fileConfig = allowedTypes[file.type];

    if (!fileConfig) {
        throw new Error(
            "Allowed formats: JPG, PNG, WebP, AVIF, MP4, WebM, and MOV."
        );
    }

    const maxSize =
        fileConfig.type === "image"
            ? 5 * 1024 * 1024
            : 25 * 1024 * 1024;

    if (file.size === 0 || file.size > maxSize) {
        throw new Error(
            fileConfig.type === "image"
                ? "Each review image must be smaller than 5 MB."
                : "The review video must be smaller than 25 MB."
        );
    }

    const key = `reviews/${randomUUID()}.${fileConfig.extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    return {
        key,
        url: `${publicUrl}/${key}`,
        type: fileConfig.type,
        mimeType: file.type,
        size: file.size,
    };
}

export async function deleteR2Image(key) {
    if (!key) return;

    if (!bucket) {
        throw new Error("R2 bucket is not configured.");
    }

    await r2.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );
}