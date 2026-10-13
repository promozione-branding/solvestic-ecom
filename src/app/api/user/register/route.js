
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model.js";
import {
    createUserToken,
    setUserCookie,
    getPublicUser,
} from "@/lib/user-session";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        const body = await request.json();

        const name = String(body.name || "").trim();
        const mobile = String(body.mobile || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (!name || !mobile || !email || !password) {
            return NextResponse.json(
                { success: false, message: "All fields are required." },
                { status: 400 }
            );
        }

        if (name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Name cannot exceed 100 characters." },
                { status: 400 }
            );
        }

        if (!/^\+[1-9]\d{7,14}$/.test(mobile)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid mobile number with country code, e.g. +919876543210.",
                },
                { status: 400 }
            );
        }

        if (
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid email address." },
                { status: 400 }
            );
        }

        if (password.length < 8 || password.length > 72) {
            return NextResponse.json(
                { success: false, message: "Password must be between 8 and 72 characters." },
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({
            $or: [{ email }, { mobile }],
        }).select("_id email mobile");

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        existingUser.email === email
                            ? "An account with this email already exists."
                            : "An account with this mobile number already exists.",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            mobile,
            email,
            password: hashedPassword,
            mobileVerified: false,
            emailVerified: false,
            status: "active",
        });

        // Create a login session immediately after registration.
        const token = createUserToken(user);

        const response = NextResponse.json(
            {
                success: true,
                message: "Account created and logged in successfully.",
                user: getPublicUser(user),
            },
            { status: 201 }
        );

        setUserCookie(response, token);

        return response;
    } catch (error) {
        if (error?.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email or mobile number already exists.",
                },
                { status: 409 }
            );
        }

        console.error("Customer registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to create your account. Please try again.",
            },
            { status: 500 }
        );
    }
}
