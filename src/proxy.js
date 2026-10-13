
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-session";
import { verifyUserToken } from "@/lib/user-session";

export function proxy(request) {
    const { pathname } = request.nextUrl;

    // Separate admin and customer sessions
    const adminToken = request.cookies.get("admin_token")?.value;
    const userToken = request.cookies.get("solvestic_user_token")?.value;

    let isAdminAuthenticated = false;
    let isUserAuthenticated = false;

    try {
        if (adminToken) {
            isAdminAuthenticated = Boolean(verifyAdminToken(adminToken));
        }
    } catch {
        isAdminAuthenticated = false;
    }

    try {
        if (userToken) {
            verifyUserToken(userToken);
            isUserAuthenticated = true;
        }
    } catch {
        isUserAuthenticated = false;
    }

    const isAdminLogin = pathname === "/admin/login";
    const isAdminRoute = pathname.startsWith("/admin");

    const isUserLogin = pathname === "/login";
    const isAccountRoute =
        pathname === "/account" ||
        pathname.startsWith("/account/");

    // Admin protection
    if (isAdminRoute) {
        if (isAdminLogin && isAdminAuthenticated) {
            return NextResponse.redirect(
                new URL("/admin", request.url)
            );
        }

        if (!isAdminLogin && !isAdminAuthenticated) {
            return NextResponse.redirect(
                new URL("/admin/login", request.url)
            );
        }

        return NextResponse.next();
    }

    // Customer login page
    if (isUserLogin && isUserAuthenticated) {
        return NextResponse.redirect(
            new URL("/account", request.url)
        );
    }

    // Customer account protection
    if (isAccountRoute && !isUserAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);

        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/account/:path*",
        "/login",
    ],
};
