import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-session";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (
            !email ||
            !password ||
            email.trim().toLowerCase() !==
            process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return NextResponse.json(
                { message: "Invalid email address or password." },
                { status: 401 }
            );
        }

        const token = createAdminToken(
            process.env.ADMIN_EMAIL.trim().toLowerCase()
        );

        const response = NextResponse.json({
            success: true,
            message: "Login successful.",
        });

        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60,
        });

        return response;
    } catch {
        return NextResponse.json(
            { message: "Unable to sign in. Please try again." },
            { status: 500 }
        );
    }
}