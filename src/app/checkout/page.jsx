"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CreditCard,
    MapPin,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    Truck,
    UserRound,
} from "lucide-react";
import AddressManager from "@/components/user/AddressManager";

const initialAddress = {
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
};

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(price) || 0);

export default function Page() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    // console.log(user, isLoading)
    const [newAddress, setNewAddress] = useState(initialAddress);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [editingAddress, setEditingAddress] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        // Wait until authentication has finished loading.
        if (isLoading) return;

        if (!isAuthenticated || !user) {
            router.replace("/login?redirect=/checkout");
        }
    }, [user, isAuthenticated, isLoading, router]);

    useEffect(() => {
        setAddresses(user?.addresses || []);
    }, [user?.addresses]);

    const fetchCart = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/user/cart");

            // Support common API response formats.
            const items =
                Array.isArray(data) ? data :
                    Array.isArray(data.items) ? data.items :
                        Array.isArray(data.cart?.items) ? data.cart.items :
                            Array.isArray(data.data?.items) ? data.data.items :
                                Array.isArray(data.data?.cart?.items) ? data.data.cart.items :
                                    [];

            setCartItems(items);
        } catch (error) {
            console.error(
                "Failed to fetch cart:",
                error.response?.data || error.message
            );
            setCartItems([]);
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            fetchCart();
        }
    }, [isLoading, isAuthenticated, user, fetchCart]);

    useEffect(() => {
        if (!addresses.length) {
            setSelectedAddress("");
            return;
        }

        setSelectedAddress((current) => {
            if (current && addresses.some(
                (address) => String(address._id) === current
            )) {
                return current;
            }

            const defaultAddress = addresses.find(
                (address) => address.isDefault
            );

            return String(
                defaultAddress?._id || addresses[0]._id
            );
        });
    }, [addresses]);

    const activeAddress = addresses.find(
        (address) => String(address._id) === selectedAddress
    );

    const subtotal = useMemo(
        () =>
            cartItems.reduce((total, item) => {
                const product =
                    typeof item.productId === "object" && item.productId !== null
                        ? item.productId
                        : item.product || item;

                const variant = product.variants?.find(
                    (v) => v.size === item.variant
                );

                const price = Number(
                    variant?.price ??
                    item.price ??
                    item.salePrice ??
                    product.price ??
                    0
                );

                const quantity = Number(item.quantity || 1);

                return total + price * quantity;
            }, 0),
        [cartItems]
    );

    // Shipping will be calculated through your shipping rules later.
    const shipping = 99;
    const total = subtotal + shipping;

    const getProduct = (item) =>
        item.productId && typeof item.productId === "object"
            ? item.productId
            : item.product || item;

    const getProductName = (item) => {
        const product = getProduct(item);
        return product.name || product.title || "Product";
    };

    const getProductImage = (item) => {
        const product = getProduct(item);

        return (
            product.images?.[0]?.url ||
            product.images?.[0]?.imageUrl ||
            product.images?.[0] ||
            product.imageUrl ||
            product.image ||
            product.thumbnail ||
            ""
        );
    };

    const getProductPrice = (item) => {
        const product = getProduct(item);

        const variant = product.variants?.find(
            (v) => v.size === item.variant
        );

        return Number(
            variant?.price ??
            item.price ??
            item.salePrice ??
            product.price ??
            0
        );
    };

    const updateAddress = (event) => {
        const { name, value } = event.target;
        setNewAddress((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleContinue = async (event) => {
        event.preventDefault();

        if (paymentLoading || cartLoading) return;

        if (!cartItems.length) {
            alert("Your cart is empty.");
            return;
        }

        if (!activeAddress) {
            alert("Please select or add a delivery address.");
            setEditingAddress(null);
            setShowAddressForm(true);
            return;
        }

        setPaymentLoading(true);

        try {
            // Load Razorpay Checkout when needed.
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = resolve;
                    script.onerror = () =>
                        reject(new Error("Unable to load Razorpay Checkout."));
                    document.body.appendChild(script);
                });
            }

            // Create the order on the server. Prices are calculated from MongoDB.
            const { data: orderData } = await axios.post(
                "/api/user/orders/create",
                { addressId: String(activeAddress._id) }
            );

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Solvestic",
                description: `Order ${orderData.orderNumber}`,
                order_id: orderData.razorpayOrderId,

                prefill: {
                    name: activeAddress.fullName || user.name || "",
                    email: user.email || "",
                    contact: activeAddress.mobile || user.mobile || "",
                },

                theme: {
                    color: "#7D45C2",
                },

                handler: async (response) => {
                    try {
                        const { data: verification } = await axios.post(
                            "/api/user/orders/verify-payment",
                            {
                                orderId: orderData.orderId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        );

                        if (!verification.success) {
                            alert(
                                "Payment verification is pending. Please check your orders before trying again."
                            );
                            return;
                        }

                        router.push(
                            `/orders/${verification.orderId}`
                        );
                    } catch (error) {
                        console.error(
                            "Payment verification error:",
                            error.response?.data || error.message
                        );

                        alert(
                            "We could not confirm payment yet. Please check your orders before attempting another payment."
                        );
                    } finally {
                        setPaymentLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPaymentLoading(false);
                    },
                },
            };

            const checkout = new window.Razorpay(options);

            checkout.on("payment.failed", (response) => {
                console.error("Razorpay payment failed:", response.error);

                alert(
                    response.error?.description ||
                    "Payment failed. Please try again."
                );

                setPaymentLoading(false);
            });

            checkout.open();
        } catch (error) {
            console.error(
                "Checkout error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to start payment. Please try again."
            );

            setPaymentLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F2FC]">
                <p className="text-sm text-[#77717F]">
                    Checking your account...
                </p>
            </main>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    console.log(cartItems)

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-10 text-[#24252A] sm:px-6 lg:py-14">
            <div className="mx-auto max-w-[1200px]">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#77717F] transition hover:text-[#7D45C2]"
                    >
                        <ArrowLeft size={17} />
                        Back to Cart
                    </Link>

                    <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                                Secure Checkout
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Complete Your Order
                            </h1>
                            <p className="mt-2 text-sm text-[#77717F]">
                                Review your items and choose a delivery address.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#77717F]">
                            <ShieldCheck size={18} className="text-[#7D45C2]" />
                            Secure shopping experience
                        </div>
                    </div>
                </div>

                {/* Checkout Layout */}
                <form
                    onSubmit={handleContinue}
                    className="grid items-start gap-7 lg:grid-cols-[1fr_390px]"
                >
                    <div className="space-y-6">
                        {/* Customer */}
                        <section className="rounded-3xl border border-[#7D45C2]/10 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                    <UserRound size={21} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Contact Information
                                    </h2>
                                    <p className="mt-1 text-xs text-[#88818F]">
                                        Your account details
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-[#88818F]">
                                        Full Name
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium">
                                        {user.name || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#88818F]">
                                        Email Address
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium">
                                        {user.email || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#88818F]">
                                        Mobile Number
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {user.mobile || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Address */}
                        <section className="rounded-3xl border border-[#7D45C2]/10 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                        <MapPin size={21} />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">
                                            Delivery Address
                                        </h2>
                                        <p className="mt-1 text-xs text-[#88818F]">
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>

                                {addresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                                        className="shrink-0 rounded-xl bg-[#F7F2FC] px-4 py-2.5 text-xs font-semibold text-[#7D45C2] transition hover:bg-[#EEE3FA]"
                                    >
                                        + New Address
                                    </button>
                                )}
                            </div>

                            {!showAddressForm && addresses.length > 0 && (
                                <div className="space-y-3">
                                    {addresses.map((address) => {
                                        const isSelected =
                                            String(address._id) === selectedAddress;

                                        return (
                                            <div
                                                key={address._id}
                                                className={`rounded-2xl border p-4 transition ${isSelected
                                                    ? "border-[#7D45C2] bg-[#F7F2FC]/70"
                                                    : "border-[#EAE5EF] hover:border-[#7D45C2]/40"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        type="button"
                                                        aria-label={`Select address for ${address.fullName}`}
                                                        onClick={() =>
                                                            setSelectedAddress(String(address._id))
                                                        }
                                                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D5CEDD] bg-white"
                                                    >
                                                        {isSelected && (
                                                            <span className="h-2.5 w-2.5 rounded-full bg-[#7D45C2]" />
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAddress(String(address._id))
                                                        }
                                                        className="min-w-0 flex-1 text-left"
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm tracking-wider font-semibold">
                                                                {address.fullName}
                                                            </h3>

                                                            {address.isDefault && (
                                                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#7D45C2]">
                                                                    DEFAULT
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-sm leading-6 text-[#77717F]">
                                                            {address.addressLine1}
                                                            {address.addressLine2 &&
                                                                `, ${address.addressLine2}`}
                                                            {`, ${address.city}, ${address.state} - ${address.pincode}`}
                                                            {address.country && `, ${address.country}`}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#77717F]">
                                                            Mobile: {address.mobile}
                                                        </p>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingAddress(address);
                                                            setShowAddressForm(true);
                                                        }}
                                                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[#7D45C2] hover:bg-[#EEE3FA]"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {showAddressForm && (
                                <AddressManager
                                    open={showAddressForm}
                                    user={user}
                                    editingAddress={editingAddress}
                                    onClose={() => {
                                        setShowAddressForm(false);
                                        setEditingAddress(null);
                                    }}
                                    onSelect={(address, updatedAddresses) => {
                                        setAddresses(
                                            updatedAddresses?.length
                                                ? updatedAddresses
                                                : (previous) =>
                                                    previous.map((item) =>
                                                        String(item._id) === String(address._id)
                                                            ? address
                                                            : item
                                                    )
                                        );

                                        setSelectedAddress(String(address._id));
                                        setEditingAddress(null);
                                    }}
                                />
                            )}

                            {!addresses.length && !showAddressForm && (
                                <p className="text-sm text-[#77717F] flex justify-between items-center">
                                    No saved addresses found.

                                    <button
                                        type="button"
                                        onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                                        className="shrink-0 rounded-xl bg-[#F7F2FC] px-4 py-2.5 text-xs font-semibold text-[#7D45C2] transition hover:bg-[#EEE3FA]"
                                    >
                                        + New Address
                                    </button>
                                </p>
                            )}
                        </section>

                        {/* Delivery method */}
                        <section className="rounded-3xl border border-[#7D45C2]/10 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                    <Truck size={21} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Delivery Method
                                    </h2>
                                    <p className="mt-1 text-xs text-[#88818F]">
                                        Shipping options will be calculated later.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[#7D45C2]/20 bg-[#F7F2FC]/60 p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Standard Delivery
                                    </p>
                                    <p className="mt-1 text-xs text-[#77717F]">
                                        Estimated delivery shown after shipping integration
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-[#7D45C2]">
                                    {shipping === 0 ? "—" : formatPrice(shipping)}
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <aside className="lg:sticky lg:top-24">
                        <div className="rounded-3xl border border-[#7D45C2]/10 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Order Summary
                                </h2>
                                <span className="rounded-full bg-[#F7F2FC] px-3 py-1 text-xs font-medium text-[#7D45C2]">
                                    {cartItems.reduce(
                                        (sum, item) =>
                                            sum + Number(item.quantity || 1),
                                        0
                                    )}{" "}
                                    items
                                </span>
                            </div>

                            <div className="mt-6 space-y-5">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => {
                                        const product = getProduct(item);
                                        const image = getProductImage(item);
                                        const quantity = Number(
                                            item.quantity || 1
                                        );

                                        return (
                                            <div
                                                key={
                                                    item._id ||
                                                    product._id ||
                                                    product.id ||
                                                    index
                                                }
                                                className="flex gap-3"
                                            >
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F2FC]">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={getProductName(item)}
                                                            className="h-full w-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <Package
                                                            size={25}
                                                            className="text-[#7D45C2]/50"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-2 text-sm font-medium">
                                                        {getProductName(item)}
                                                    </h3>

                                                    {product.variant && (
                                                        <p className="mt-1 text-xs text-[#88818F]">
                                                            {product.variant}
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-xs text-[#88818F]">
                                                        Qty: {quantity}
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold">
                                                        {formatPrice(
                                                            getProductPrice(item) *
                                                            quantity
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package
                                            size={34}
                                            className="mx-auto text-[#7D45C2]/50"
                                        />
                                        <p className="mt-3 text-sm font-medium">
                                            Your cart is empty
                                        </p>
                                        <Link
                                            href="/our-products"
                                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7D45C2]"
                                        >
                                            Explore products
                                            <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {cartItems.length > 0 && (
                                <>
                                    <div className="my-6 border-t border-dashed border-[#E6DFEC]" />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between gap-3 text-[#77717F]">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-[#24252A]">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-3 text-[#77717F]">
                                            <span>Shipping</span>
                                            <span className="font-medium text-[#24252A]">
                                                Calculated later
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-[#EAE5EF]" />

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                Estimated Total
                                            </p>
                                            <p className="mt-1 text-xs text-[#88818F]">
                                                Final shipping may change the total
                                            </p>
                                        </div>
                                        <p className="text-xl font-semibold text-[#7D45C2]">
                                            {formatPrice(total)}
                                        </p>
                                    </div>


                                    <button
                                        type="submit"
                                        disabled={paymentLoading || cartLoading || !cartItems.length}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7D45C2] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#6936AC] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {paymentLoading ? (
                                            "Processing..."
                                        ) : (
                                            <>
                                                Continue to Payment
                                                <ArrowRight size={17} />
                                            </>
                                        )}
                                    </button>


                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#88818F]">
                                        <ShieldCheck
                                            size={15}
                                            className="text-[#7D45C2]"
                                        />
                                        Secure checkout
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="mt-4 text-center text-xs leading-6 text-[#88818F]">
                            By continuing, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="font-medium text-[#7D45C2] hover:underline"
                            >
                                Terms & Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy-policy"
                                className="font-medium text-[#7D45C2] hover:underline"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </aside>
                </form>
            </div>
        </main>
    );
}