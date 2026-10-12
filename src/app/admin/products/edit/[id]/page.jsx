
"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    ArrowLeft,
    CheckCircle2,
    Image as ImageIcon,
    Package,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
    X,
} from "lucide-react";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-40 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400">
            Loading editor...
        </div>
    ),
});

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-2 focus:ring-purple-100";

const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937A8] disabled:cursor-not-allowed disabled:opacity-60";

function makeSlug(value = "") {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function Section({ title, description, children }) {
    return (
        <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const previewsRef = useRef([]);
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [slug, setSlug] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [status, setStatus] = useState("active");
    const [shortDescription, setShortDescription] = useState("");
    const [longDescription, setLongDescription] = useState("");
    const [variants, setVariants] = useState([
        {
            id: "variant-initial",
            size: "",
            oldPrice: "",
            price: "",
        },
    ]);

    const addVariant = () => {
        setVariants((current) => [
            ...current,
            {
                id: `variant-${Date.now()}-${Math.random()}`,
                size: "",
                oldPrice: "",
                price: "",
            },
        ]);
    };

    const updateVariant = (id, field, value) => {
        setVariants((current) =>
            current.map((variant) =>
                variant.id === id
                    ? { ...variant, [field]: value }
                    : variant
            )
        );
    };

    const removeVariant = (id) => {
        setVariants((current) =>
            current.filter((variant) => variant.id !== id)
        );
    };

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [specifications, setSpecifications] = useState([
        { key: "", value: "" },
    ]);

    const editorConfig = useMemo(
        () => ({
            readonly: false,
            height: 300,
            toolbarAdaptive: false,
            spellcheck: true,
            buttons: [
                "bold",
                "italic",
                "underline",
                "|",
                "ul",
                "ol",
                "|",
                "font",
                "fontsize",
                "|",
                "brush",
                "paragraph",
                "|",
                "link",
                "image",
                "table",
                "|",
                "align",
                "|",
                "undo",
                "redo",
                "|",
                "hr",
                "eraser",
                "source",
            ],
            uploader: {
                insertImageAsBase64URI: true,
            },
            placeholder: "Write the complete product description...",
        }),
        []
    );

    const loadProduct = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        setError("");

        try {
            const [productResponse, categoryResponse] = await Promise.all([
                axios.get(`/api/admin/products/${productId}`),
                axios.get("/api/admin/categories"),
            ]);

            const product = productResponse.data.product;
            const categoryList = categoryResponse.data.categories || [];

            if (!product) {
                throw new Error("Product not found.");
            }

            setCategories(categoryList);
            setName(product.name || "");
            setSlug(product.slug || "");
            setMetaTitle(product.metaTitle || "");
            setMetaDescription(product.metaDescription || "");
            setVideoUrl(product.videoUrl || "");
            setStatus(product.status || "active");
            setShortDescription(product.shortDescription || "");
            setLongDescription(product.longDescription || "");

            const populatedCategoryId =
                typeof product.categoryId === "object"
                    ? product.categoryId?._id
                    : product.categoryId;

            setCategoryId(populatedCategoryId || "");

            const variantMap = {
                "50ml": { enabled: false, oldPrice: "", price: "" },
                "75ml": { enabled: false, oldPrice: "", price: "" },
            };

            (product.variants || []).forEach((variant) => {
                if (variantMap[variant.size]) {
                    variantMap[variant.size] = {
                        enabled: true,
                        oldPrice: String(variant.oldPrice ?? ""),
                        price: String(variant.price ?? ""),
                    };
                }
            });

            setVariants(
                (product.variants || []).map((variant, index) => ({
                    id: `variant-${index}-${variant.size}`,
                    size: variant.size || "",
                    oldPrice: String(variant.oldPrice ?? ""),
                    price: String(variant.price ?? ""),
                }))
            );
            setExistingImages(product.images || []);

            setSpecifications(
                product.specifications?.length
                    ? product.specifications.map((item) => ({
                        key: item.key || "",
                        value: item.value || "",
                    }))
                    : [{ key: "", value: "" }]
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load product."
            );
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadProduct();
    }, [loadProduct]);

    useEffect(() => {
        previewsRef.current = newImagePreviews;
    }, [newImagePreviews]);

    useEffect(() => {
        return () => {
            previewsRef.current.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleImages = (event) => {
        setError("");

        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";

        if (!selectedFiles.length) return;

        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
        ];

        const keptFiles = [...newImages];
        const keptPreviews = [...newImagePreviews];
        let message = "";

        for (const file of selectedFiles) {
            if (!validTypes.includes(file.type)) {
                message = `${file.name}: use JPG, PNG, WEBP or AVIF.`;
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                message = `${file.name}: image size must not exceed 5 MB.`;
                continue;
            }

            if (existingImages.length + keptFiles.length >= 8) {
                message = "You can keep a maximum of 8 product images.";
                break;
            }

            keptFiles.push(file);
            keptPreviews.push(URL.createObjectURL(file));
        }

        setNewImages(keptFiles);
        setNewImagePreviews(keptPreviews);

        if (message) setError(message);
    };

    const removeExistingImage = (index) => {
        setExistingImages((current) =>
            current.filter((_, i) => i !== index)
        );
    };

    const removeNewImage = (index) => {
        const preview = newImagePreviews[index];

        if (preview) URL.revokeObjectURL(preview);

        setNewImages((current) => current.filter((_, i) => i !== index));
        setNewImagePreviews((current) =>
            current.filter((_, i) => i !== index)
        );
    };

    const updateSpecification = (index, field, value) => {
        setSpecifications((current) =>
            current.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const validateForm = () => {
        if (!name.trim()) return "Please enter a product name.";
        if (!categoryId) return "Please select a category.";
        if (!slug.trim()) return "Please enter a product slug.";

        if (existingImages.length + newImages.length === 0) {
            return "Keep or upload at least one product image.";
        }

        if (existingImages.length + newImages.length > 8) {
            return "You can have a maximum of 8 product images.";
        }

        if (!variants.length) {
            return "Add at least one bottle size.";
        }

        const sizes = new Set();

        for (const variant of variants) {
            const size = variant.size.trim().toLowerCase();

            if (!size) return "Please enter every bottle size.";

            if (sizes.has(size)) {
                return `The bottle size "${variant.size.trim()}" is duplicated.`;
            }

            sizes.add(size);

            if (
                variant.oldPrice === "" ||
                variant.price === "" ||
                !Number.isFinite(Number(variant.oldPrice)) ||
                !Number.isFinite(Number(variant.price)) ||
                Number(variant.oldPrice) < 0 ||
                Number(variant.price) < 0
            ) {
                return `Enter valid prices for the ${variant.size.trim()} bottle.`;
            }
        }

        for (const item of specifications) {
            if (
                (item.key.trim() && !item.value.trim()) ||
                (!item.key.trim() && item.value.trim())
            ) {
                return "Complete both fields for each specification.";
            }
        }

        if (videoUrl.trim()) {
            try {
                const url = new URL(videoUrl);

                if (!["http:", "https:"].includes(url.protocol)) {
                    return "Video URL must use HTTP or HTTPS.";
                }
            } catch {
                return "Please enter a valid video URL.";
            }
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("categoryId", categoryId);
        formData.append("slug", slug.trim());
        formData.append("metaTitle", metaTitle.trim());
        formData.append("metaDescription", metaDescription.trim());
        formData.append("videoUrl", videoUrl.trim());
        formData.append("status", status);
        formData.append("shortDescription", shortDescription.trim());
        formData.append("longDescription", longDescription);

        const selectedVariants = variants.map((variant) => ({
            size: variant.size.trim(),
            oldPrice: Number(variant.oldPrice),
            price: Number(variant.price),
        }));

        formData.append("variants", JSON.stringify(selectedVariants));

        const cleanSpecifications = specifications
            .filter((item) => item.key.trim() && item.value.trim())
            .map((item) => ({
                key: item.key.trim(),
                value: item.value.trim(),
            }));

        formData.append(
            "specifications",
            JSON.stringify(cleanSpecifications)
        );

        // Tell the API which original R2 images should remain.
        formData.append("retainedImages", JSON.stringify(existingImages));

        // Append any newly selected images.
        newImages.forEach((file) => formData.append("images", file));

        setSaving(true);

        try {
            await axios.put(
                `/api/admin/products/${productId}`,
                formData
            );

            setSuccess("Product updated successfully.");
            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update product. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
                <Sidebar />
                <main className="p-8 lg:ml-72">
                    <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                        <RefreshCw
                            size={18}
                            className="animate-spin text-[#7D45C2]"
                        />
                        Loading product...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/products"
                            aria-label="Back to products"
                            className="rounded-xl border border-purple-100 bg-white p-3 transition hover:bg-purple-50"
                        >
                            <ArrowLeft size={19} />
                        </Link>

                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                CATALOG MANAGEMENT
                            </p>
                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                Edit Product
                            </h1>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <span className="flex-1">{error}</span>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section title="Basic information">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Product name *
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Category *
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) =>
                                            setCategoryId(e.target.value)
                                        }
                                        className={inputClass}
                                        required
                                    >
                                        <option value="">
                                            Select category
                                        </option>
                                        {categories.map((category) => (
                                            <option
                                                key={category._id}
                                                value={category._id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Product slug *
                                    </label>
                                    <input
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(makeSlug(e.target.value))
                                        }
                                        className={inputClass}
                                        required
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        URL preview: /products/{slug || "product-slug"}
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section
                            title="Bottle sizes and pricing"
                            description="Enter any bottle size and set its original and selling prices."
                        >
                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <div
                                        key={variant.id}
                                        className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Variant {index + 1}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() => removeVariant(variant.id)}
                                                disabled={variants.length === 1}
                                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Trash2 size={15} />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <label className={labelClass}>
                                                    Bottle size *
                                                </label>
                                                <input
                                                    value={variant.size}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "size",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 100ml"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    Old price (₹) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variant.oldPrice}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "oldPrice",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Original price"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    Selling price (₹) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variant.price}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Selling price"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-purple-50"
                                >
                                    <Plus size={17} />
                                    Add Bottle Size
                                </button>
                            </div>
                        </Section>

                        <Section
                            title="Product images"
                            description="Keep existing images, remove unwanted ones, or add new images. Maximum 8 images, 5 MB each."
                        >
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {existingImages.map((image, index) => (
                                    <div
                                        key={image.key || image.url}
                                        className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Existing product image ${index + 1}`}
                                            className="h-36 w-full object-cover"
                                        />
                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                                                Existing image
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeExistingImage(index)
                                            }
                                            aria-label="Remove existing image"
                                            className="absolute right-2 top-2 rounded-lg bg-white p-2 text-red-500 shadow hover:bg-red-50"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}

                                {newImagePreviews.map((preview, index) => (
                                    <div
                                        key={preview}
                                        className="relative overflow-hidden rounded-xl border border-purple-200 bg-gray-50"
                                    >
                                        <img
                                            src={preview}
                                            alt={`New product image ${index + 1}`}
                                            className="h-36 w-full object-cover"
                                        />
                                        <span className="absolute bottom-2 left-2 rounded-md bg-[#7D45C2] px-2 py-1 text-xs text-white">
                                            New image
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            aria-label="Remove new image"
                                            className="absolute right-2 top-2 rounded-lg bg-white p-2 text-red-500 shadow hover:bg-red-50"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 px-5 py-8 text-center transition hover:border-[#7D45C2] hover:bg-purple-50">
                                <Upload
                                    size={24}
                                    className="text-[#7D45C2]"
                                />
                                <span className="mt-3 text-sm font-semibold">
                                    Upload additional images
                                </span>
                                <span className="mt-1 text-xs text-gray-500">
                                    {existingImages.length + newImages.length}/8 images
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    onChange={handleImages}
                                    className="hidden"
                                />
                            </label>

                            {existingImages.length + newImages.length === 0 && (
                                <p className="mt-3 flex items-center gap-2 text-xs text-red-500">
                                    <ImageIcon size={15} />
                                    At least one image is required.
                                </p>
                            )}
                        </Section>

                        <Section title="Product video">
                            <label className={labelClass}>Video URL</label>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) =>
                                    setVideoUrl(e.target.value)
                                }
                                placeholder="https://www.youtube.com/watch?v=..."
                                className={inputClass}
                            />
                        </Section>

                        <Section title="SEO settings">
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>
                                        Meta title
                                    </label>
                                    <input
                                        value={metaTitle}
                                        onChange={(e) =>
                                            setMetaTitle(e.target.value)
                                        }
                                        maxLength={70}
                                        className={inputClass}
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {metaTitle.length}/70
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Meta description
                                    </label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) =>
                                            setMetaDescription(e.target.value)
                                        }
                                        maxLength={170}
                                        rows={3}
                                        className={`${inputClass} resize-y`}
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {metaDescription.length}/170
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section title="Specifications">
                            <div className="space-y-3">
                                {specifications.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 sm:flex-row"
                                    >
                                        <input
                                            value={item.key}
                                            onChange={(e) =>
                                                updateSpecification(
                                                    index,
                                                    "key",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Specification name"
                                            className={inputClass}
                                        />
                                        <input
                                            value={item.value}
                                            onChange={(e) =>
                                                updateSpecification(
                                                    index,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Specification value"
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSpecifications((current) =>
                                                    current.filter(
                                                        (_, i) => i !== index
                                                    )
                                                )
                                            }
                                            disabled={specifications.length === 1}
                                            aria-label="Remove specification"
                                            className="flex shrink-0 items-center justify-center rounded-xl border border-red-100 px-4 py-3 text-red-500 hover:bg-red-50 disabled:opacity-30"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSpecifications((current) => [
                                            ...current,
                                            { key: "", value: "" },
                                        ])
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-[#7D45C2] hover:bg-purple-50"
                                >
                                    <Plus size={16} />
                                    Add specification
                                </button>
                            </div>
                        </Section>

                        <Section title="Descriptions">
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClass}>
                                        Short description
                                    </label>
                                    <textarea
                                        value={shortDescription}
                                        onChange={(e) =>
                                            setShortDescription(e.target.value)
                                        }
                                        rows={4}
                                        className={`${inputClass} resize-y`}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Full product description
                                    </label>
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <JoditEditor
                                            value={longDescription}
                                            config={editorConfig}
                                            onBlur={setLongDescription}
                                            onChange={() => { }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving || categories.length === 0}
                                className={buttonClass}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Updating product...
                                    </>
                                ) : (
                                    <>
                                        <Package size={17} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
