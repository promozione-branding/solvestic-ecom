
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { USER_COOKIE_NAME, verifyUserToken, } from "@/lib/user-session";
import User from "@/models/user.model.js";

export async function getAuthenticatedCartUserId() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;

    if (!token) {
        return { userId: null, error: "Please log in to continue.", status: 401 };
    }

    let payload;

    try {
        payload = await verifyUserToken(token);
    } catch {
        return { userId: null, error: "Your session is invalid or expired.", status: 401 };
    }

    if (
        !payload?.userId ||
        !mongoose.isValidObjectId(payload.userId) ||
        payload.type !== "customer"
    ) {
        return { userId: null, error: "Your session is invalid or expired.", status: 401 };
    }

    const userExists = await User.exists({ _id: payload.userId });

    if (!userExists) {
        return { userId: null, error: "User account not found.", status: 401 };
    }

    return { userId: payload.userId, error: null, status: 200 };
}
