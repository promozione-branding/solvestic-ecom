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