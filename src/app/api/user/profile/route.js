
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import {
    USER_COOKIE_NAME,
    verifyUserToken,
} from "@/lib/user-session";

async function getAuthenticatedUser(request) {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;

    if (!token) {
        return { error: "Please log in to continue.", status: 401 };
    }

    let payload;

    try {
        payload = await verifyUserToken(token);
    } catch {
        return { error: "Your session has expired. Please log in again.", status: 401 };
    }

    const userId = payload?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { error: "Invalid session. Please log in again.", status: 401 };
    }

    const user = await User.findById(userId).select("+password");

    if (!user || user.status !== "active") {
        return { error: "Your account is unavailable.", status: 401 };
    }

    return { user };
}

function getPublicUser(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export async function PATCH(request) {
    try {
        await connectDB();

        const auth = await getAuthenticatedUser(request);

        if (auth.error) {
            return NextResponse.json(
                { success: false, message: auth.error },
                { status: auth.status }
            );
        }

        const { user } = auth;
        const body = await request.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        let mobile = String(body.mobile || "").trim().replace(/[\s()-]/g, "");

        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Name must be between 2 and 100 characters." },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        // Accept a 10-digit Indian number or an E.164 number.
        if (/^[6-9]\d{9}$/.test(mobile)) {
            mobile = `+91${mobile}`;
        }

        if (!/^\+[1-9]\d{7,14}$/.test(mobile)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid mobile number, including the country code.",
                },
                { status: 400 }
            );
        }

        const duplicate = await User.findOne({
            _id: { $ne: user._id },
            $or: [{ email }, { mobile }],
        }).select("_id email mobile");

        if (duplicate) {
            const message =
                duplicate.email === email
                    ? "This email address is already registered."
                    : "This mobile number is already registered.";

            return NextResponse.json(
                { success: false, message },
                { status: 409 }
            );
        }

        user.name = name;
        user.email = email;
        user.mobile = mobile;

        // Changing contact details does not automatically verify them.
        if (email !== user.email) user.emailVerified = false;

        const newPassword = String(body.newPassword || "");
        const currentPassword = String(body.currentPassword || "");

        if (newPassword) {
            if (newPassword.length < 8) {
                return NextResponse.json(
                    { success: false, message: "Your new password must be at least 8 characters." },
                    { status: 400 }
                );
            }

            if (!user.password) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Password changes are unavailable for this account. Please use your sign-in method.",
                    },
                    { status: 400 }
                );
            }

            if (!currentPassword) {
                return NextResponse.json(
                    { success: false, message: "Enter your current password to change it." },
                    { status: 400 }
                );
            }

            const passwordMatches = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!passwordMatches) {
                return NextResponse.json(
                    { success: false, message: "Your current password is incorrect." },
                    { status: 400 }
                );
            }

            user.password = await bcrypt.hash(newPassword, 12);
        }

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Your account details have been updated.",
            user: getPublicUser(user),
        });
    } catch (error) {
        console.error("Update customer profile error:", error);

        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "That email or mobile number is already registered." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Unable to update your account right now." },
            { status: 500 }
        );
    }
}
