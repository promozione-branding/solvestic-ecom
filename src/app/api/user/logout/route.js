
import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/user-session";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
    });

    clearUserCookie(response);

    return response;
}
