
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const USER_COOKIE_NAME = "solvestic_user_token";

function getSecret() {
    const secret = process.env.JWT_USER_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error(
            "JWT_USER_SECRET must contain at least 32 characters."
        );
    }

    return secret;
}

export function createUserToken(user) {
    const expiresIn = Number(process.env.USER_COOKIE_EXPIRE) || 7;

    return jwt.sign(
        {
            userId: user._id.toString(),
            type: "customer",
        },
        getSecret(),
        {
            expiresIn: `${expiresIn}d`,
        }
    );
}

export function setUserCookie(response, token) {
    const days = Number(process.env.USER_COOKIE_EXPIRE) || 7;

    response.cookies.set(USER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: days * 24 * 60 * 60,
    });

    return response;
}

export function clearUserCookie(response) {
    response.cookies.set(USER_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}

export function verifyUserToken(token) {
    if (!token) {
        throw new Error("Customer session token is missing.");
    }

    const payload = jwt.verify(token, getSecret());

    if (
        typeof payload === "string" ||
        payload.type !== "customer" ||
        !payload.userId
    ) {
        throw new Error("Invalid customer session.");
    }

    return payload;
}

export function getPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        addresses: user.addresses || [],
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
        status: user.status,
        createdAt: user.createdAt,
    };
}

export function errorResponse(message, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}
