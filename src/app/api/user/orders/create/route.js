
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart.model";
import Product from "@/models/product.model";
import Order from "@/models/order.model";
import Payment from "@/models/payment.model";
import User from "@/models/user.model";
import razorpay from "@/lib/razorpay";
import { createShiprocketOrder } from "@/lib/create-shiprocket-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHIPPING_FEE = 0;
const WELCOME_COUPON = "WELCOME10";
const WELCOME_DISCOUNT_PERCENT = 10;

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function toPaise(value) {
    return Math.round(Number(value) * 100);
}

function fromPaise(value) {
    return value / 100;
}

async function createShipmentSafely(orderId) {
    try {
        const result = await createShiprocketOrder(orderId);

        if (!result.success) {
            console.error(
                "COD Shiprocket creation needs attention:",
                {
                    orderId: String(orderId),
                    status: result.status,
                    message: result.message,
                }
            );
        }

        return {
            success: result.success,
            status: result.status,
        };
    } catch (error) {
        console.error(
            "COD Shiprocket creation error:",
            error
        );

        return {
            success: false,
            status: "failed",
        };
    }
}

export async function POST(request) {
    try {
        // 1. Authenticate customer
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return errorResponse(
                "Please log in to continue.",
                401
            );
        }

        if (!process.env.JWT_USER_SECRET) {
            throw new Error(
                "JWT_USER_SECRET is missing."
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_USER_SECRET
            );
        } catch {
            return errorResponse(
                "Your session has expired. Please log in again.",
                401
            );
        }

        if (
            decoded.type !== "customer" ||
            !mongoose.isValidObjectId(decoded.userId)
        ) {
            return errorResponse(
                "Invalid customer session.",
                401
            );
        }

        const userId = decoded.userId;

        // 2. Validate checkout request
        const body = await request
            .json()
            .catch(() => ({}));

        const { addressId } = body;

        const paymentMethod = String(
            body.paymentMethod || "razorpay"
        ).toLowerCase();

        if (!mongoose.isValidObjectId(addressId)) {
            return errorResponse(
                "Please select a valid delivery address."
            );
        }

        if (
            !["razorpay", "cod"].includes(
                paymentMethod
            )
        ) {
            return errorResponse(
                "Invalid payment method."
            );
        }

        // 3. Load customer and address
        await connectDB();

        const user = await User.findById(userId);

        if (
            !user ||
            user.status !== "active"
        ) {
            return errorResponse(
                "Your account is unavailable.",
                403
            );
        }

        const address = user.addresses?.find(
            (item) =>
                String(item._id) ===
                String(addressId)
        );

        if (!address) {
            return errorResponse(
                "The selected delivery address was not found."
            );
        }

        const requiredFields = [
            "fullName",
            "mobile",
            "addressLine1",
            "city",
            "state",
            "pincode",
        ];

        for (const field of requiredFields) {
            if (
                !String(
                    address[field] || ""
                ).trim()
            ) {
                return errorResponse(
                    `Please complete the delivery address: ${field}.`
                );
            }
        }

        // 4. Load cart
        const cart = await Cart.findOne({
            userId,
        }).lean();

        if (!cart?.items?.length) {
            return errorResponse(
                "Your cart is empty."
            );
        }

        if (cart.items.length > 100) {
            return errorResponse(
                "Your cart contains too many items."
            );
        }

        // 5. Fetch active products
        const productIds = [
            ...new Set(
                cart.items.map((item) =>
                    String(item.productId)
                )
            ),
        ];

        const products = await Product.find({
            _id: { $in: productIds },
            status: "active",
        }).lean();

        const productMap = new Map(
            products.map((product) => [
                String(product._id),
                product,
            ])
        );

        const orderItems = [];
        let subtotalPaise = 0;

        // 6. Calculate prices from database
        for (const item of cart.items) {
            const product = productMap.get(
                String(item.productId)
            );

            if (!product) {
                return errorResponse(
                    "A product in your cart is unavailable. Please update your cart."
                );
            }

            const selectedSize = String(
                typeof item.variant === "object"
                    ? item.variant?.size || ""
                    : item.variant || ""
            ).trim();

            const variant = product.variants?.find(
                (v) =>
                    String(v.size || "")
                        .trim()
                        .toLowerCase() ===
                    selectedSize.toLowerCase()
            );

            if (!variant) {
                return errorResponse(
                    `The selected variant for ${product.name} is unavailable.`
                );
            }

            const quantity = Number(
                item.quantity
            );

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 99
            ) {
                return errorResponse(
                    "Invalid product quantity."
                );
            }

            const unitPrice = Number(
                variant.price
            );

            if (
                !Number.isFinite(unitPrice) ||
                unitPrice < 0
            ) {
                return errorResponse(
                    `Invalid price for ${product.name}.`
                );
            }

            const unitPricePaise =
                toPaise(unitPrice);

            const lineTotalPaise =
                unitPricePaise * quantity;

            if (
                !Number.isSafeInteger(
                    unitPricePaise
                ) ||
                !Number.isSafeInteger(
                    lineTotalPaise
                )
            ) {
                return errorResponse(
                    "Invalid product price."
                );
            }

            subtotalPaise += lineTotalPaise;

            orderItems.push({
                productId: product._id,
                name: product.name,
                slug: product.slug || "",
                image:
                    product.images?.[0]?.url || "",
                variant: String(
                    variant.size
                ),
                quantity,
                unitPrice: fromPaise(
                    unitPricePaise
                ),
                lineTotal: fromPaise(
                    lineTotalPaise
                ),
            });
        }

        if (
            !Number.isSafeInteger(
                subtotalPaise
            ) ||
            subtotalPaise <= 0
        ) {
            return errorResponse(
                "Unable to calculate the order subtotal."
            );
        }

        // 7. Check first-order WELCOME10 eligibility
        const previousPurchase =
            await Order.exists({
                userId,
                $or: [
                    {
                        paymentMethod:
                            "razorpay",
                        paymentStatus: {
                            $in: [
                                "paid",
                                "refunded",
                                "partially_refunded",
                            ],
                        },
                    },
                    {
                        paymentMethod: "cod",
                        orderStatus: {
                            $in: [
                                "confirmed",
                                "processing",
                                "shipped",
                                "delivered",
                                "returned",
                            ],
                        },
                    },
                ],
            });

        const applyWelcome10 =
            !previousPurchase;

        const couponDiscountPaise =
            applyWelcome10
                ? Math.round(
                    subtotalPaise *
                    WELCOME_DISCOUNT_PERCENT /
                    100
                )
                : 0;

        const shippingFeePaise =
            toPaise(SHIPPING_FEE);

        const totalPaise =
            subtotalPaise +
            shippingFeePaise -
            couponDiscountPaise;

        if (
            !Number.isSafeInteger(
                totalPaise
            ) ||
            totalPaise <= 0
        ) {
            return errorResponse(
                "Unable to calculate the order total."
            );
        }

        const subtotal =
            fromPaise(subtotalPaise);

        const shippingFee =
            fromPaise(shippingFeePaise);

        const couponDiscount =
            fromPaise(
                couponDiscountPaise
            );

        const totalAmount =
            fromPaise(totalPaise);

        // 8. Generate unique order number
        const orderNumber =
            `SOL-${Date.now()}-${crypto
                .randomBytes(3)
                .toString("hex")
                .toUpperCase()}`;

        const isCOD =
            paymentMethod === "cod";

        const now = new Date();

        // 9. Create MongoDB order
        const createdOrder =
            await Order.create({
                orderNumber,
                userId,
                customerEmail:
                    user.email || "",

                items: orderItems,

                shippingAddress: {
                    fullName:
                        address.fullName,
                    mobile:
                        address.mobile,
                    addressLine1:
                        address.addressLine1,
                    addressLine2:
                        address.addressLine2 || "",
                    city:
                        address.city,
                    state:
                        address.state,
                    country:
                        address.country || "India",
                    pincode:
                        address.pincode,
                },

                currency: "INR",
                subtotal,
                shippingFee,
                discount: couponDiscount,

                couponCode: applyWelcome10
                    ? WELCOME_COUPON
                    : null,

                couponDiscount,
                totalAmount,
                paymentMethod,

                paymentStatus: "pending",

                orderStatus: isCOD
                    ? "confirmed"
                    : "pending",

                confirmedAt: isCOD
                    ? now
                    : null,
            });

        // 10. COD checkout
        if (isCOD) {
            // Clear purchased items from cart.
            // Failure here should not invalidate
            // an already-created order.
            try {
                await Cart.updateOne(
                    { userId },
                    {
                        $set: {
                            items: [],
                        },
                    }
                );
            } catch (cartError) {
                console.error(
                    "COD cart cleanup failed:",
                    cartError
                );
            }

            // NEW: Create Shiprocket shipment
            // after COD order confirmation.
            const shipment =
                await createShipmentSafely(
                    createdOrder._id
                );

            return NextResponse.json({
                success: true,

                message:
                    "Cash on Delivery order placed successfully.",

                paymentMethod: "cod",
                paymentStatus: "pending",
                orderStatus: "confirmed",

                orderId: String(
                    createdOrder._id
                ),

                orderNumber,

                subtotal,
                shippingFee,
                discount: couponDiscount,

                couponCode: applyWelcome10
                    ? WELCOME_COUPON
                    : null,

                totalAmount,

                requiresOnlinePayment: false,

                shipmentCreationStatus:
                    shipment.status,

                shipmentCreated:
                    shipment.success,
            });
        }

        // 11. Razorpay checkout
        // Shipment is NOT created yet.
        // Wait until payment is verified.
        const razorpayOrder =
            await razorpay.orders.create({
                amount: totalPaise,
                currency: "INR",
                receipt: orderNumber,
                notes: {
                    orderId: String(
                        createdOrder._id
                    ),
                    orderNumber,
                    userId: String(userId),
                },
            });

        await Payment.create({
            orderId:
                createdOrder._id,
            userId,
            provider: "razorpay",
            amount: totalAmount,
            currency: "INR",
            status: "created",
            razorpayOrderId:
                razorpayOrder.id,
        });

        return NextResponse.json({
            success: true,

            message:
                "Order created. Continue to payment.",

            paymentMethod: "razorpay",
            paymentStatus: "pending",
            orderStatus: "pending",

            orderId: String(
                createdOrder._id
            ),

            orderNumber,

            razorpayOrderId:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            keyId:
                process.env.RAZORPAY_KEY_ID,

            subtotal,
            shippingFee,
            discount: couponDiscount,

            couponCode: applyWelcome10
                ? WELCOME_COUPON
                : null,

            totalAmount,

            requiresOnlinePayment: true,

            shipmentCreationStatus:
                "not_started",

            shipmentCreated: false,
        });
    } catch (error) {
        console.error(
            "Create order error:",
            error
        );

        return errorResponse(
            "Unable to create your order. Please try again.",
            500
        );
    }
}
