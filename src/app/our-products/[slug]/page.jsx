import ProductPage from "./ProductPage";
import { headers } from "next/headers";
import { notFound } from "next/navigation";


async function getProduct(slug, baseUrl) {
    try {
        const response = await fetch(
            `${baseUrl}/api/user/product?slug=${encodeURIComponent(slug)}`,
            { cache: "no-store" }
        );

        if (!response.ok) return null;

        const result = await response.json();

        return result?.products || null;
    } catch (error) {
        console.error("Product fetch failed:", error);
        return null;
    }
}


async function getBaseUrl() {
    const requestHeaders = await headers();

    const host =
        requestHeaders.get("x-forwarded-host") ||
        requestHeaders.get("host");

    const protocol =
        requestHeaders.get("x-forwarded-proto") ||
        (host?.includes("localhost") ? "http" : "https");

    return (
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        (host ? `${protocol}://${host}` : "https://solvestic.com")
    );
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const baseUrl = await getBaseUrl();
    const product = await getProduct(slug, baseUrl);

    if (!product) {
        return {
            title: "Product Not Found | Solvestic",
            description: "Explore skincare products at Solvestic.",
            robots: { index: false, follow: false },
        };
    }

    const title =
        product.metaTitle?.trim() ||
        `${product.name} | Solvestic`;

    const description =
        product.metaDescription?.trim() ||
        product.shortDescription?.trim() ||
        `Discover ${product.name} at Solvestic. Explore product details, available sizes and pricing.`;

    const canonical = `${baseUrl}/our-products/${product.slug}`;

    const firstImage = product.images?.[0];

    const image =
        (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
        product.imageUrl ||
        "/placeholder.png";

    const imageUrl = image.startsWith("http")
        ? image
        : `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            type: "website",
            url: canonical,
            siteName: "Solvestic",
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const baseUrl = await getBaseUrl();
    const product = await getProduct(slug, baseUrl);

    if (!product) notFound();

    return <ProductPage slug={slug} initialProduct={product} />;
}