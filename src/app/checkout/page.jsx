
"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CreditCard,
    Banknote,
    MapPin,
    Package,
    ShieldCheck,
    Truck,
    Loader2,
    Tag,
} from "lucide-react";
import toast from "react-hot-toast";

import AddressManager from "@/components/user/AddressManager";

const ORIGINAL_SHIPPING = 99;

const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

let razorpayScriptPromise = null;

function loadRazorpay() {
    if (typeof window === "undefined") {
        return Promise.reject(
            new Error("Razorpay requires a browser.")
        );
    }

    if (window.Razorpay) {
        return Promise.resolve();
    }

    if (razorpayScriptPromise) {
        return razorpayScriptPromise;
    }

    razorpayScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => resolve();

        script.onerror = () => {
            razorpayScriptPromise = null;
            script.remove();
            reject(new Error("Unable to load Razorpay."));
        };

        document.body.appendChild(script);
    });

    return razorpayScriptPromise;
}

function getProduct(item) {
    if (
        item?.productId &&
        typeof item.productId === "object"
    ) {
        return item.productId;
    }

    return item?.product || item || {};
}

function getVariant(product, variant) {
    const size = String(
        typeof variant === "object"
            ? variant?.size || ""
            : variant || ""
    )
        .trim()
        .toLowerCase();

    return product?.variants?.find(
        (item) =>
            String(item.size || "")
                .trim()
                .toLowerCase() === size
    );
}

function getItemDetails(item) {
    const product = getProduct(item);
    const variant = getVariant(product, item.variant);

    const quantity = Number(item.quantity) || 1;

    const price = Number(
        variant?.price ??
        item.price ??
        product.price ??
        0
    );

    const oldPrice = Number(
        variant?.oldPrice ??
        item.oldPrice ??
        price
    );

    return {
        id: String(product._id || item.productId || ""),
        name: product.name || "Product",
        image:
            product.images?.[0]?.url ||
            product.imageUrl ||
            product.image ||
            "",
        variant:
            typeof item.variant === "object"
                ? item.variant?.size || ""
                : item.variant || "",
        quantity,
        price,
        oldPrice,
        lineTotal: price * quantity,
    };
}

export default function CheckoutPage() {
    const router = useRouter();

    const {
        user,
        isAuthenticated,
        isLoading,
    } = useSelector((state) => state.auth);

    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState("");

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState("");

    const [showAddressForm, setShowAddressForm] =
        useState(false);

    const [editingAddress, setEditingAddress] =
        useState(null);

    const [paymentMethod, setPaymentMethod] =
        useState("razorpay");

    const [paymentLoading, setPaymentLoading] =
        useState(false);

    const [paymentMessage, setPaymentMessage] =
        useState("");

    const [welcomeCoupon, setWelcomeCoupon] =
        useState(false);

    const [couponLoading, setCouponLoading] =
        useState(true);

    const submittingRef = useRef(false);

    // Authentication
    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !user) {
            router.replace(
                "/login?redirect=/checkout"
            );
        }
    }, [
        isLoading,
        isAuthenticated,
        user,
        router,
    ]);

    // Saved addresses
    useEffect(() => {
        setAddresses(user?.addresses || []);
    }, [user?.addresses]);

    useEffect(() => {
        if (!addresses.length) {
            setSelectedAddress("");
            return;
        }

        setSelectedAddress((current) => {
            const exists = addresses.some(
                (address) =>
                    String(address._id) === current
            );

            if (exists) return current;

            const defaultAddress = addresses.find(
                (address) => address.isDefault
            );

            return String(
                defaultAddress?._id ||
                addresses[0]._id
            );
        });
    }, [addresses]);

    const activeAddress = addresses.find(
        (address) =>
            String(address._id) === selectedAddress
    );

    // Load account cart
    const fetchCart = useCallback(async () => {
        setCartLoading(true);
        setCartError("");

        try {
            const { data } = await axios.get(
                "/api/user/cart",
                { withCredentials: true }
            );

            setCartItems(
                Array.isArray(data.cart?.items)
                    ? data.cart.items
                    : []
            );
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to load your cart."
            );
            setCartItems([]);
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        if (
            !isLoading &&
            isAuthenticated &&
            user
        ) {
            fetchCart();
        }
    }, [
        isLoading,
        isAuthenticated,
        user?._id,
        fetchCart,
    ]);

    // Check WELCOME10 eligibility
    useEffect(() => {
        if (
            isLoading ||
            !isAuthenticated ||
            !user
        ) {
            return;
        }

        let cancelled = false;

        async function checkCoupon() {
            setCouponLoading(true);

            try {
                const { data } = await axios.get(
                    "/api/user/coupon"
                );

                if (!cancelled) {
                    setWelcomeCoupon(
                        data.success === true &&
                        data.eligible === true
                    );
                }
            } catch {
                if (!cancelled) {
                    setWelcomeCoupon(false);
                }
            } finally {
                if (!cancelled) {
                    setCouponLoading(false);
                }
            }
        }

        checkCoupon();

        return () => {
            cancelled = true;
        };
    }, [
        isLoading,
        isAuthenticated,
        user?._id,
    ]);

    // Preload Razorpay for faster checkout
    useEffect(() => {
        loadRazorpay().catch(() => { });
    }, []);

    const items = useMemo(
        () => cartItems.map(getItemDetails),
        [cartItems]
    );

    const subtotalPaise = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum +
                    Math.round(item.price * 100) *
                    item.quantity,
                0
            ),
        [items]
    );

    const subtotal = subtotalPaise / 100;

    // const couponDiscount = welcomeCoupon
    //     ? Math.round(subtotalPaise * 0.1) / 100
    //     : 0;

    const hasComboPack = items.some(
        (item) =>
            String(item.name || "")
                .trim()
                .toLowerCase() === "combo pack"
    );

    const canApplyCoupon =
        welcomeCoupon &&
        paymentMethod === "razorpay" &&
        !hasComboPack;

    const couponDiscount = canApplyCoupon
        ? Math.round(subtotalPaise * 0.1) / 100
        : 0;

    const shipping = 0;

    const total = Math.max(
        0,
        subtotal - couponDiscount
    );

    const totalQuantity = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const openNewAddress = () => {
        setEditingAddress(null);
        setShowAddressForm(true);
    };

    const editAddress = (address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleAddressSelect = (
        address,
        updatedAddresses
    ) => {
        if (Array.isArray(updatedAddresses)) {
            setAddresses(updatedAddresses);
        } else {
            setAddresses((previous) => {
                const exists = previous.some(
                    (item) =>
                        String(item._id) ===
                        String(address._id)
                );

                return exists
                    ? previous.map((item) =>
                        String(item._id) ===
                            String(address._id)
                            ? address
                            : item
                    )
                    : [...previous, address];
            });
        }

        setSelectedAddress(
            String(address._id)
        );

        setEditingAddress(null);
        setShowAddressForm(false);
    };

    const handleContinue = async (event) => {
        event.preventDefault();

        if (submittingRef.current) return;

        if (
            paymentLoading ||
            cartLoading ||
            couponLoading
        ) {
            return;
        }

        if (!items.length) {
            setPaymentMessage(
                "Your cart is empty."
            );
            return;
        }

        if (!activeAddress) {
            setPaymentMessage(
                "Please select or add a delivery address."
            );
            openNewAddress();
            return;
        }

        submittingRef.current = true;
        setPaymentLoading(true);
        setPaymentMessage("");

        try {
            // COD does not require Razorpay.
            if (paymentMethod === "cod") {
                const { data } = await axios.post(
                    "/api/user/orders/create",
                    {
                        addressId: String(
                            activeAddress._id
                        ),
                        paymentMethod: "cod",
                    }
                );

                if (
                    !data.success ||
                    !data.orderId
                ) {
                    throw new Error(
                        data.message ||
                        "Unable to place COD order."
                    );
                }

                // COD order is confirmed.
                // Do not mark it as paid here.
                router.replace(
                    `/orders/${data.orderId}`
                );

                return;
            }

            // Razorpay checkout
            const [, { data: orderData }] =
                await Promise.all([
                    loadRazorpay(),
                    axios.post(
                        "/api/user/orders/create",
                        {
                            addressId: String(
                                activeAddress._id
                            ),
                            paymentMethod: "razorpay",
                        }
                    ),
                ]);

            if (
                !orderData.success ||
                !orderData.orderId ||
                !orderData.razorpayOrderId ||
                !orderData.keyId
            ) {
                throw new Error(
                    "Invalid payment response."
                );
            }

            const checkout = new window.Razorpay({
                key: orderData.keyId,
                amount: orderData.amount,
                currency:
                    orderData.currency || "INR",

                name: "Solvestic",

                description:
                    `Order ${orderData.orderNumber}`,

                order_id:
                    orderData.razorpayOrderId,

                prefill: {
                    name:
                        activeAddress.fullName ||
                        user.name ||
                        "",
                    email: user.email || "",
                    contact:
                        activeAddress.mobile ||
                        user.mobile ||
                        "",
                },

                theme: {
                    color: "#7D45C2",
                },

                handler: async (response) => {
                    setPaymentMessage(
                        "Confirming your payment..."
                    );

                    try {
                        const { data } = await axios.post(
                            "/api/user/orders/verify-payment",
                            {
                                orderId:
                                    orderData.orderId,

                                razorpay_order_id:
                                    response.razorpay_order_id,

                                razorpay_payment_id:
                                    response.razorpay_payment_id,

                                razorpay_signature:
                                    response.razorpay_signature,
                            }
                        );

                        if (!data.success) {
                            throw new Error(
                                "Payment confirmation is pending."
                            );
                        }

                        router.replace(
                            `/orders/${data.orderId ||
                            orderData.orderId
                            }`
                        );
                    } catch {
                        setPaymentMessage(
                            "Your payment may have succeeded, but confirmation is pending. Please check My Orders before trying again."
                        );
                    } finally {
                        submittingRef.current = false;
                        setPaymentLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPaymentMessage(
                            "Payment window closed. If money was deducted, check My Orders before paying again."
                        );

                        submittingRef.current = false;
                        setPaymentLoading(false);
                    },
                },
            });

            checkout.on(
                "payment.failed",
                (response) => {
                    setPaymentMessage(
                        response.error?.description ||
                        "Payment failed. Please try again."
                    );

                    submittingRef.current = false;
                    setPaymentLoading(false);
                }
            );

            checkout.open();
        } catch (error) {
            setPaymentMessage(
                error.response?.data?.message ||
                error.message ||
                "Unable to place your order."
            );

            submittingRef.current = false;
            setPaymentLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-[#F7F2FC]">
                <Loader2
                    size={30}
                    className="animate-spin text-[#7D45C2]"
                />
            </main>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 text-[#24252A] sm:px-6 lg:py-12">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#7D45C2]"
                >
                    <ArrowLeft size={17} />
                    Back to Cart
                </Link>

                <div className="mb-8 mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                        Secure Checkout
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        Complete Your Order
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Choose your delivery address and payment method.
                    </p>
                </div>

                <form
                    onSubmit={handleContinue}
                    className="grid items-start gap-7 lg:grid-cols-[1.2fr_0.8fr]"
                >
                    <div className="space-y-6">
                        {/* Contact information */}
                        <section className="rounded-3xl border border-[#E9DDF5] bg-white p-5 sm:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <ShieldCheck className="text-[#7D45C2]" />
                                <h2 className="text-lg font-semibold">
                                    Contact Information
                                </h2>
                            </div>

                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-gray-500">
                                        Name
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {user.name || "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        Email
                                    </p>
                                    <p className="mt-1 break-all font-medium">
                                        {user.email || "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        Mobile
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {user.mobile || "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Delivery address */}
                        <section className="rounded-3xl border border-[#E9DDF5] bg-white p-5 sm:p-7">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-[#7D45C2]" />
                                    <h2 className="text-lg font-semibold">
                                        Delivery Address
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={openNewAddress}
                                    className="rounded-xl bg-[#F7F2FC] px-4 py-2.5 text-xs font-semibold text-[#7D45C2] hover:bg-[#EEE3FA]"
                                >
                                    + New Address
                                </button>
                            </div>

                            {addresses.length ? (
                                <div className="space-y-3">
                                    {addresses.map((address) => {
                                        const selected =
                                            String(address._id) ===
                                            selectedAddress;

                                        return (
                                            <div
                                                key={String(address._id)}
                                                className={`rounded-2xl border p-4 transition ${selected
                                                    ? "border-[#7D45C2] bg-[#F9F5FD]"
                                                    : "border-gray-200 bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="deliveryAddress"
                                                        checked={selected}
                                                        onChange={() =>
                                                            setSelectedAddress(
                                                                String(address._id)
                                                            )
                                                        }
                                                        className="mt-1 accent-[#7D45C2]"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-semibold">
                                                                {address.fullName}
                                                            </p>

                                                            {address.isDefault && (
                                                                <span className="rounded-full bg-[#EDE1F8] px-2 py-1 text-[10px] font-semibold text-[#7D45C2]">
                                                                    DEFAULT
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                                            {address.addressLine1}
                                                            {address.addressLine2
                                                                ? `, ${address.addressLine2}`
                                                                : ""}
                                                            <br />
                                                            {address.city},{" "}
                                                            {address.state} -{" "}
                                                            {address.pincode}
                                                            <br />
                                                            {address.country || "India"}
                                                        </p>

                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {address.mobile}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editAddress(address)
                                                        }
                                                        className="text-xs font-semibold text-[#7D45C2]"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#D8C5EA] p-6 text-center">
                                    <MapPin
                                        className="mx-auto text-[#7D45C2]"
                                        size={28}
                                    />

                                    <p className="mt-3 text-sm text-gray-500">
                                        No saved delivery address.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={openNewAddress}
                                        className="mt-3 text-sm font-semibold text-[#7D45C2]"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Payment method */}
                        <section className="rounded-3xl border border-[#E9DDF5] bg-white p-5 sm:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <CreditCard className="text-[#7D45C2]" />

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Payment Method
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Choose how you want to pay.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label
                                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${paymentMethod === "razorpay"
                                        ? "border-[#7D45C2] bg-[#F9F5FD]"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="razorpay"
                                        checked={
                                            paymentMethod === "razorpay"
                                        }
                                        onChange={() =>
                                            setPaymentMethod("razorpay")
                                        }
                                        className="accent-[#7D45C2]"
                                    />

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7D45C2]">
                                        <CreditCard size={22} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">
                                            Pay Online
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            UPI, Cards, Net Banking and more
                                        </p>
                                    </div>

                                    {paymentMethod === "razorpay" && (
                                        <Check
                                            size={18}
                                            className="text-[#7D45C2]"
                                        />
                                    )}
                                </label>

                                <label
                                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${paymentMethod === "cod"
                                        ? "border-[#7D45C2] bg-[#F9F5FD]"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => {
                                            setPaymentMethod("cod");

                                            if (welcomeCoupon && !hasComboPack) {
                                                toast.error(
                                                    "WELCOME10 is only valid for prepaid orders. Coupon discount removed.",
                                                    {
                                                        duration: 4000,
                                                        position: "top-center",
                                                    }
                                                );
                                            }
                                        }}
                                        className="accent-[#7D45C2]"
                                    />

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7D45C2]">
                                        <Banknote size={22} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">
                                            Cash on Delivery
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Pay when your order is delivered
                                        </p>
                                    </div>

                                    {paymentMethod === "cod" && (
                                        <Check
                                            size={18}
                                            className="text-[#7D45C2]"
                                        />
                                    )}
                                </label>
                            </div>

                            {paymentMethod === "cod" && (
                                <p className="mt-4 rounded-xl bg-[#F7F2FC] p-3 text-xs leading-5 text-[#6E3BA5]">
                                    Your order will be confirmed without an
                                    online payment. Please keep the payable
                                    amount ready at delivery.
                                </p>
                            )}
                        </section>

                        {/* Delivery method */}
                        <section className="rounded-3xl border border-[#E9DDF5] bg-white p-5 sm:p-7">
                            <div className="flex items-center gap-3">
                                <Truck className="text-[#7D45C2]" />

                                <div className="flex-1">
                                    <p className="font-semibold">
                                        Standard Delivery
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Delivery through our shipping partners
                                    </p>
                                </div>

                                <span className="text-sm font-semibold text-green-600">
                                    FREE
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Order summary */}
                    <aside className="lg:sticky lg:top-24">
                        <div className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Order Summary
                                </h2>

                                <span className="rounded-full bg-[#F7F2FC] px-3 py-1 text-xs font-semibold text-[#7D45C2]">
                                    {totalQuantity} Items
                                </span>
                            </div>

                            {cartLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2
                                        className="animate-spin text-[#7D45C2]"
                                        size={25}
                                    />
                                </div>
                            ) : (
                                <div className="mt-6 max-h-[340px] space-y-4 overflow-y-auto">
                                    {items.map((item, index) => (
                                        <div
                                            key={`${item.id}-${item.variant}-${index}`}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F2FC]">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={22}
                                                        className="text-[#7D45C2]"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-semibold">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {item.variant}
                                                    {" · "}
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold">
                                                {formatPrice(item.lineTotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="my-6 border-t border-gray-100" />
                            {canApplyCoupon && (
                                <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#F7F2FC] p-4">
                                    <Tag
                                        size={19}
                                        className="text-[#7D45C2]"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-[#7D45C2]">
                                            WELCOME10 Applied
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            10% off your order
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>

                                    <span>
                                        <span className="mr-2 text-gray-400 line-through">
                                            {formatPrice(ORIGINAL_SHIPPING)}
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            FREE
                                        </span>
                                    </span>
                                </div>

                                {welcomeCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span>
                                            WELCOME10 Discount
                                        </span>

                                        <span className="font-semibold">
                                            -{formatPrice(couponDiscount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="my-5 border-t border-gray-100" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-semibold">
                                        Total Amount
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Inclusive of applicable charges
                                    </p>
                                </div>

                                <p className="text-2xl font-bold text-[#7D45C2]">
                                    {formatPrice(total)}
                                </p>
                            </div>

                            {paymentMethod === "cod" && (
                                <div className="mt-5 rounded-xl bg-[#F7F2FC] p-3 text-sm">
                                    <p className="font-semibold">
                                        Pay on Delivery
                                    </p>

                                    <p className="mt-1 text-gray-600">
                                        Estimated amount:{" "}
                                        {formatPrice(total)}
                                    </p>
                                </div>
                            )}

                            {cartError && (
                                <p
                                    role="alert"
                                    className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
                                >
                                    {cartError}
                                </p>
                            )}

                            {paymentMessage && (
                                <p
                                    role="status"
                                    className="mt-4 rounded-xl bg-[#F7F2FC] p-3 text-sm text-[#6E3BA5]"
                                >
                                    {paymentMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    paymentLoading ||
                                    cartLoading ||
                                    couponLoading ||
                                    !items.length ||
                                    !!cartError
                                }
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7D45C2] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#6936AC] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {paymentLoading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Processing...
                                    </>
                                ) : paymentMethod === "cod" ? (
                                    <>
                                        Place COD Order
                                        <ArrowRight size={18} />
                                    </>
                                ) : (
                                    <>
                                        Pay Securely
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                                <ShieldCheck
                                    size={15}
                                    className="text-[#7D45C2]"
                                />
                                Secure checkout with Solvestic
                            </p>

                            <Link
                                href="/cart"
                                className="mt-5 block text-center text-sm font-medium text-[#7D45C2] hover:underline"
                            >
                                Edit Cart
                            </Link>
                        </div>
                    </aside>
                </form>
            </div>

            <AddressManager
                open={showAddressForm}
                user={user}
                editingAddress={editingAddress}
                onClose={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                }}
                onSelect={handleAddressSelect}
            />
        </main>
    );
}
