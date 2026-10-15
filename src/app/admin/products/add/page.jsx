
"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
    X,
    Image as ImageIcon,
    RefreshCw,
    Package,
    CheckCircle2,
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

const emptyVariant = {
    enabled: false,
    oldPrice: "",
    price: "",
};

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
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

export default function AddProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [status, setStatus] = useState("active");
    const [variants, setVariants] = useState([
        {
            id: crypto.randomUUID(),
            size: "",
            oldPrice: "",
            price: "",
        },
    ]);

    const addVariant = () => {
        setVariants((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
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

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [specifications, setSpecifications] = useState([
        { key: "", value: "" },
    ]);
    const [shortDescription, setShortDescription] = useState("");
    const [longDescription, setLongDescription] = useState("");

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

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                const { data } = await axios.get("/api/admin/categories");

                if (!cancelled) {
                    setCategories(data.categories || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load categories."
                    );
                }
            } finally {
                if (!cancelled) setLoadingCategories(false);
            }
        }

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const updateName = (value) => {
        setName(value);

        if (!slugEdited) {
            setSlug(makeSlug(value));
        }

        if (!metaTitle) {
            setMetaTitle(value);
        }
    };

    const handleSlugChange = (value) => {
        setSlugEdited(true);
        setSlug(makeSlug(value));
    };

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

        const currentImages = [...images];
        const currentPreviews = [...imagePreviews];

        for (const file of selectedFiles) {
            if (!validTypes.includes(file.type)) {
                setError(
                    `${file.name}: only JPG, PNG, WEBP and AVIF images are allowed.`
                );
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name}: image size must not exceed 5 MB.`);
                continue;
            }

            if (currentImages.length >= 8) {
                setError("You can upload a maximum of 8 product images.");
                break;
            }

            currentImages.push(file);
            currentPreviews.push(URL.createObjectURL(file));
        }

        setImages(currentImages);
        setImagePreviews(currentPreviews);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);

        setImages((current) => current.filter((_, i) => i !== index));
        setImagePreviews((current) =>
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

    const addSpecification = () => {
        setSpecifications((current) => [
            ...current,
            { key: "", value: "" },
        ]);
    };

    const removeSpecification = (index) => {
        setSpecifications((current) =>
            current.filter((_, i) => i !== index)
        );
    };

    const validateForm = () => {
        if (!name.trim()) return "Please enter a product name.";
        if (!categoryId) return "Please select a category.";
        if (!slug.trim()) return "Please enter a product slug.";
        if (!images.length) return "Please upload at least one image.";

        if (!variants.length) {
            return "Add at least one bottle size.";
        }

        const sizes = variants.map((variant) =>
            variant.size.trim().toLowerCase()
        );

        if (sizes.some((size) => !size)) {
            return "Please enter every bottle size.";
        }

        if (new Set(sizes).size !== sizes.length) {
            return "Bottle sizes must be unique.";
        }

        for (const variant of variants) {
            if (
                variant.oldPrice === "" ||
                variant.price === "" ||
                !Number.isFinite(Number(variant.oldPrice)) ||
                !Number.isFinite(Number(variant.price)) ||
                Number(variant.oldPrice) < 0 ||
                Number(variant.price) < 0
            ) {
                return `Enter valid old and selling prices for the ${variant.size} bottle.`;
            }
        }

        for (const item of specifications) {
            if (
                (item.key.trim() && !item.value.trim()) ||
                (!item.key.trim() && item.value.trim())
            ) {
                return "Complete both the name and value of each specification.";
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

        formData.append("specifications", JSON.stringify(cleanSpecifications));

        images.forEach((file) => formData.append("images", file));

        setSaving(true);

        try {
            await axios.post("/api/admin/products", formData);

            setSuccess("Product created successfully.");

            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create product. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

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
                                Add Product
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
                        <Section
                            title="Basic information"
                            description="Enter the product name and select its category."
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Product name *
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) =>
                                            updateName(e.target.value)
                                        }
                                        placeholder="e.g. Premium Oud Perfume"
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
                                        disabled={loadingCategories}
                                    >
                                        <option value="">
                                            {loadingCategories
                                                ? "Loading categories..."
                                                : "Select a category"}
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

                                    {!loadingCategories &&
                                        categories.length === 0 && (
                                            <p className="mt-2 text-xs text-amber-700">
                                                Create a category before adding a product.
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Product status
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
                                            handleSlugChange(e.target.value)
                                        }
                                        placeholder="premium-oud-perfume"
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
                            description="Manually add any bottle size and set its old and selling prices in INR."
                        >
                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <div
                                        key={variant.id}
                                        className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-800">
                                                Bottle Variant {index + 1}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() => removeVariant(variant.id)}
                                                disabled={variants.length === 1}
                                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                aria-label="Remove bottle variant"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <label className={labelClass}>
                                                    Bottle size *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.size}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "size",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 50ml, 100ml"
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
                                                    placeholder="1500"
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
                                                    placeholder="999"
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
                            description="Upload JPG, PNG, WEBP or AVIF images. Maximum 8 images, 5 MB each."
                        >
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 px-5 py-10 text-center transition hover:border-[#7D45C2] hover:bg-purple-50">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#7D45C2] shadow-sm">
                                    <Upload size={23} />
                                </div>
                                <span className="mt-3 text-sm font-semibold">
                                    Click to upload product images
                                </span>
                                <span className="mt-1 text-xs text-gray-500">
                                    {images.length}/8 images selected
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    onChange={handleImages}
                                    className="hidden"
                                />
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div
                                            key={preview}
                                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Product preview ${index + 1}`}
                                                className="h-36 w-full object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                                                    Main image
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                aria-label={`Remove image ${index + 1}`}
                                                className="absolute right-2 top-2 rounded-lg bg-white p-2 text-red-500 shadow transition hover:bg-red-50"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length === 0 && (
                                <p className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                    <ImageIcon size={15} />
                                    At least one image is required.
                                </p>
                            )}
                        </Section>

                        <Section
                            title="Product video"
                            description="Optionally link to a product demonstration video."
                        >
                            <label className={labelClass}>
                                Video URL
                            </label>
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

                        <Section
                            title="SEO settings"
                            description="Set the search engine title and meta description."
                        >
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
                                        placeholder="Product SEO title"
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
                                        placeholder="Describe the product for search results..."
                                        className={`${inputClass} resize-y`}
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {metaDescription.length}/170
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section
                            title="Specifications"
                            description="Add product details such as brand, fragrance, ingredients or country of origin."
                        >
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
                                                removeSpecification(index)
                                            }
                                            disabled={specifications.length === 1}
                                            aria-label="Remove specification"
                                            className="flex shrink-0 items-center justify-center rounded-xl border border-red-100 px-4 py-3 text-red-500 transition hover:bg-red-50 disabled:opacity-30"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-purple-50"
                                >
                                    <Plus size={16} />
                                    Add specification
                                </button>
                            </div>
                        </Section>

                        <Section
                            title="Descriptions"
                            description="Add a short summary and a detailed formatted product description."
                        >
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
                                        placeholder="A brief product summary..."
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
                                            // config={editorConfig}
                                            onBlur={(newContent) =>
                                                setLongDescription(newContent)
                                            }
                                            onChange={() => { }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    loadingCategories ||
                                    categories.length === 0
                                }
                                className={buttonClass}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Saving product...
                                    </>
                                ) : (
                                    <>
                                        <Package size={17} />
                                        Create Product
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
