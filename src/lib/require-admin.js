import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-session";

export function requireAdmin(request) {
    const token = request.cookies.get("admin_token")?.value;

    if (!verifyAdminToken(token)) {
        return NextResponse.json(
            { success: false, message: "Unauthorized. Please log in." },
            { status: 401 }
        );
    }

    return null;
}