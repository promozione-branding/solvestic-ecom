
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import User from "@/models/user.model";

import {
    USER_COOKIE_NAME,
    verifyUserToken,
} from "@/lib/user-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COUPON_CODE = "WELCOME10";
const DISCOUNT_PERCENTAGE = 10;

function jsonResponse(data, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
    });
}

export async function GET() {
    try {
        // 1. Authenticate user
        const cookieStore = await cookies();

        const token = cookieStore.get(
            USER_COOKIE_NAME
        )?.value;

        if (!token) {
            return jsonResponse(
                {
                    success: false,
                    eligible: false,
                    autoApply: false,
                    message: "Please log in.",
                },
                401
            );
        }

        let payload;

        try {
            payload = verifyUserToken(token);
        } catch {
            return jsonResponse(
                {
                    success: false,
                    eligible: false,
                    autoApply: false,
                    message: "Invalid or expired session.",
                },
                401
            );
        }

        if (
            !payload?.userId ||
            !mongoose.isValidObjectId(payload.userId)
        ) {
            return jsonResponse(
                {
                    success: false,
                    eligible: false,
                    autoApply: false,
                    message: "Invalid customer session.",
                },
                401
            );
        }

        // 2. Connect MongoDB
        await connectDB();

        // 3. Validate user
        const user = await User.findById(
            payload.userId
        )
            .select("_id status")
            .lean();

        if (
            !user ||
            user.status !== "active"
        ) {
            return jsonResponse(
                {
                    success: false,
                    eligible: false,
                    autoApply: false,
                    message: "User account is not active.",
                },
                403
            );
        }

        // 4. Check previous successful purchase
        // Razorpay: paid orders
        // COD: confirmed/processing/shipped/delivered
        const previousPurchase = await Order.exists({
            userId: user._id,
            $or: [
                {
                    paymentMethod: "razorpay",
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

        const eligible = !previousPurchase;

        return jsonResponse({
            success: true,
            eligible,
            autoApply: eligible,

            couponCode: eligible
                ? COUPON_CODE
                : null,

            discountPercentage: eligible
                ? DISCOUNT_PERCENTAGE
                : 0,

            message: eligible
                ? "WELCOME10 automatically applied. Enjoy 10% off!"
                : "WELCOME10 is available only on your first purchase.",
        });
    } catch (error) {
        console.error(
            "WELCOME10 coupon API error:",
            error
        );

        return jsonResponse(
            {
                success: false,
                eligible: false,
                autoApply: false,
                couponCode: null,
                discountPercentage: 0,
                message: "Unable to validate coupon.",
            },
            500
        );
    }
}
