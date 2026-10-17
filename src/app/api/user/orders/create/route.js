
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart.model";
import Product from "@/models/product.model";
import Order from "@/models/order.model";
import Payment from "@/models/payment.model";
import razorpay from "@/lib/razorpay";
import User from "@/models/user.model";

export const runtime = "nodejs";

const SHIPPING_FEE = 99;

export async function POST(request) {
    let order;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("solvestic_user_token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please log in to continue." },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_USER_SECRET
        );

        if (
            decoded.type !== "customer" ||
            !mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            return NextResponse.json(
                { message: "Invalid customer session." },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        const body = await request.json();
        const { addressId } = body;

        if (
            !addressId ||
            !mongoose.Types.ObjectId.isValid(addressId)
        ) {
            return NextResponse.json(
                { message: "Please select a valid delivery address." },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findById(userId);

        if (!user || user.status === "inactive") {
            return NextResponse.json(
                { message: "Your account is unavailable." },
                { status: 403 }
            );
        }

        const address = user.addresses?.find(
            (item) => String(item._id) === String(addressId)
        );

        if (!address) {
            return NextResponse.json(
                { message: "The selected address was not found." },
                { status: 400 }
            );
        }

        const requiredAddressFields = [
            "fullName",
            "mobile",
            "addressLine1",
            "city",
            "state",
            "pincode",
        ];

        for (const field of requiredAddressFields) {
            if (!String(address[field] || "").trim()) {
                return NextResponse.json(
                    {
                        message: `Please complete the delivery address: ${field}.`,
                    },
                    { status: 400 }
                );
            }
        }

        const cart = await Cart.findOne({ userId }).lean();

        if (!cart?.items?.length) {
            return NextResponse.json(
                { message: "Your cart is empty." },
                { status: 400 }
            );
        }

        const productIds = [
            ...new Set(
                cart.items.map((item) => String(item.productId))
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
        let subtotal = 0;

        for (const item of cart.items) {
            const product = productMap.get(
                String(item.productId)
            );

            if (!product) {
                return NextResponse.json(
                    {
                        message:
                            "A product in your cart is unavailable. Please update your cart.",
                    },
                    { status: 400 }
                );
            }

            const variant = product.variants?.find(
                (v) => v.size === item.variant
            );

            if (!variant) {
                return NextResponse.json(
                    {
                        message: `The selected variant for ${product.name} is unavailable. Please update your cart.`,
                    },
                    { status: 400 }
                );
            }

            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 99
            ) {
                return NextResponse.json(
                    { message: "Invalid product quantity." },
                    { status: 400 }
                );
            }

            const unitPrice = Number(variant.price);
            const lineTotal = unitPrice * quantity;

            if (
                !Number.isFinite(unitPrice) ||
                unitPrice < 0 ||
                !Number.isSafeInteger(Math.round(lineTotal * 100))
            ) {
                return NextResponse.json(
                    { message: "Invalid product price." },
                    { status: 400 }
                );
            }

            subtotal += lineTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0]?.url || "",
                variant: variant.size,
                quantity,
                unitPrice,
                lineTotal,
            });
        }

        subtotal = Number(subtotal.toFixed(2));

        // Temporary flat shipping fee. Replace this when Shiprocket
        // shipping rates are integrated.
        const shippingFee = SHIPPING_FEE;
        const totalAmount = Number(
            (subtotal + shippingFee).toFixed(2)
        );

        if (
            !Number.isFinite(totalAmount) ||
            totalAmount <= 0 ||
            !Number.isSafeInteger(Math.round(totalAmount * 100))
        ) {
            return NextResponse.json(
                { message: "Unable to calculate the order total." },
                { status: 400 }
            );
        }

        const orderNumber = `SOL-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;

        order = await Order.create({
            orderNumber,
            userId,
            customerEmail: user.email || "",
            items: orderItems,
            shippingAddress: {
                fullName: address.fullName,
                mobile: address.mobile,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                country: address.country || "India",
                pincode: address.pincode,
            },
            currency: "INR",
            subtotal,
            shippingFee,
            discount: 0,
            totalAmount,
            paymentMethod: "razorpay",
            paymentStatus: "pending",
            orderStatus: "pending",
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: orderNumber,
            notes: {
                orderId: String(order._id),
                orderNumber,
                userId: String(userId),
            },
        });

        await Payment.create({
            orderId: order._id,
            userId,
            provider: "razorpay",
            amount: totalAmount,
            currency: "INR",
            status: "created",
            razorpayOrderId: razorpayOrder.id,
        });

        return NextResponse.json({
            message: "Order created. Continue to payment.",
            orderId: String(order._id),
            orderNumber,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            razorpayOrderId: razorpayOrder.id,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error(
            "Create order error:",
            error?.message || error
        );

        // If Razorpay creation fails after the pending order is saved,
        // retain the pending order for investigation/retry.
        return NextResponse.json(
            { message: "Unable to start payment. Please try again." },
            { status: 500 }
        );
    }
}
