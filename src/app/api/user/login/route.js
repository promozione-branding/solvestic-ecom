
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
        await connectDB();

        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required.",
                },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        if (user.status !== "active") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your account is inactive. Please contact support.",
                },
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = createUserToken(user);

        const response = NextResponse.json({
            success: true,
            message: "Login successful.",
            user: getPublicUser(user),
        });

        setUserCookie(response, token);

        return response;
    } catch (error) {
        console.error("Customer login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to log in. Please try again.",
            },
            { status: 500 }
        );
    }
}
