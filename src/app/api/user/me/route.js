
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model.js";
import {
    USER_COOKIE_NAME,
    verifyUserToken,
    getPublicUser,
} from "@/lib/user-session";

export const runtime = "nodejs";

export async function GET(request) {
    try {
        const token = request.cookies.get(USER_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not logged in." },
                { status: 401 }
            );
        }

        const payload = verifyUserToken(token);

        await connectDB();

        const user = await User.findById(payload.userId);

        if (!user || user.status !== "active") {
            return NextResponse.json(
                { success: false, message: "Account not found or inactive." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: getPublicUser(user),
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid or expired session." },
            { status: 401 }
        );
    }
}
