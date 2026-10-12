import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-session";

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("admin_token")?.value;
    const isAuthenticated = verifyAdminToken(token);
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage && isAuthenticated) {
        return NextResponse.redirect(
            new URL("/admin", request.url)
        );
    }

    if (pathname.startsWith("/admin") && !isLoginPage) {
        if (!isAuthenticated) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};