
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model.js";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import {
    createUserToken,
    setUserCookie,
    getPublicUser,
} from "@/lib/user-session";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        const { idToken } = await request.json();

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Firebase ID token is required.",
                },
                { status: 400 }
            );
        }

        const decodedToken =
            await getFirebaseAdminAuth().verifyIdToken(idToken);

        const mobile = decodedToken.phone_number;
        const firebaseUid = decodedToken.uid;

        if (!mobile || !firebaseUid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to verify your mobile number.",
                },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findOne({ mobile });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No account found for this number. Please contact support.",
                },
                { status: 404 }
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

        // Prevent linking a different Firebase identity to this account.
        if (user.firebaseUid && user.firebaseUid !== firebaseUid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This mobile number is linked to another login identity.",
                },
                { status: 403 }
            );
        }

        // Prevent a Firebase identity from being linked to multiple users.
        const linkedUser = await User.findOne({
            firebaseUid,
            _id: { $ne: user._id },
        }).select("_id");

        if (linkedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This login identity is already linked to another account.",
                },
                { status: 409 }
            );
        }

        user.firebaseUid = firebaseUid;
        user.mobileVerified = true;
        user.lastLoginAt = new Date();

        await user.save();

        const token = createUserToken(user);

        const response = NextResponse.json({
            success: true,
            message: "OTP verified. Login successful.",
            user: getPublicUser(user),
        });

        setUserCookie(response, token);

        return response;
    } catch (error) {
        console.error("Customer OTP verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "OTP verification failed. Please try again.",
            },
            { status: 401 }
        );
    }
}
