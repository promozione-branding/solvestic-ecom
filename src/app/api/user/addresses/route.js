import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";

import {
    USER_COOKIE_NAME,
    verifyUserToken,
} from "@/lib/user-session";

async function getAuthenticatedUser(request) {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const payload = verifyUserToken(token);

        if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
            return null;
        }

        const user = await User.findById(payload.userId);

        if (!user || user.status === "inactive") {
            return null;
        }

        return user;
    } catch {
        return null;
    }
}

function cleanAddress(body) {
    return {
        fullName: String(body.fullName || "").trim(),
        mobile: String(body.mobile || "").trim(),
        addressLine1: String(body.addressLine1 || "").trim(),
        addressLine2: String(body.addressLine2 || "").trim(),
        city: String(body.city || "").trim(),
        state: String(body.state || "").trim(),
        country: String(body.country || "India").trim(),
        pincode: String(body.pincode || "").trim(),
        isDefault: Boolean(body.isDefault),
    };
}

const requiredFields = [
    "fullName",
    "mobile",
    "addressLine1",
    "city",
    "state",
    "country",
    "pincode",
];

// GET: Fetch saved addresses
export async function GET(request) {
    try {
        await connectDB();

        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Please log in to continue." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            addresses: user.addresses || [],
        });
    } catch (error) {
        console.error("GET addresses error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch addresses." },
            { status: 500 }
        );
    }
}

// POST: Add a new address
export async function POST(request) {
    try {
        await connectDB();

        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please log in to continue.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const address = cleanAddress(body);

        // Validate required fields
        const missingFields = requiredFields.filter(
            (field) => !String(address[field] ?? "").trim()
        );

        if (missingFields.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Please fill in: ${missingFields.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Validate mobile number
        address.mobile = String(address.mobile).trim();

        if (!/^[0-9]{10}$/.test(address.mobile)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid 10-digit mobile number.",
                },
                { status: 400 }
            );
        }

        // Validate PIN code
        address.pincode = String(address.pincode).trim();

        if (!/^[0-9]{6}$/.test(address.pincode)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid 6-digit PIN code.",
                },
                { status: 400 }
            );
        }

        // Safely initialize addresses
        if (!user.addresses) {
            user.addresses = [];
        }

        // First address becomes default automatically
        const makeDefault =
            Boolean(address.isDefault) ||
            user.addresses.length === 0;

        if (makeDefault) {
            user.addresses.forEach((item) => {
                item.isDefault = false;
            });
        }

        address.isDefault = makeDefault;

        // Add and save address
        user.addresses.push(address);

        await user.save();

        const savedAddress =
            user.addresses[user.addresses.length - 1];

        return NextResponse.json(
            {
                success: true,
                message: "Address added successfully.",
                address: savedAddress,
                addresses: user.addresses,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST address error:", error);

        // Return useful validation errors instead of hiding them
        if (error.name === "ValidationError") {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Failed to save address.",
            },
            { status: 500 }
        );
    }
}

// PATCH: Set a saved address as default
export async function PATCH(request) {
    try {
        await connectDB();

        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Please log in to continue." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { addressId, action = "edit" } = body;

        if (!mongoose.Types.ObjectId.isValid(String(addressId || ""))) {
            return NextResponse.json(
                { success: false, message: "Invalid address ID." },
                { status: 400 }
            );
        }

        if (!user.addresses) user.addresses = [];

        const address = user.addresses.id(addressId);

        if (!address) {
            return NextResponse.json(
                { success: false, message: "Address not found." },
                { status: 404 }
            );
        }

        if (action === "default") {
            user.addresses.forEach((item) => {
                item.isDefault = String(item._id) === String(addressId);
            });

            await user.save();

            return NextResponse.json({
                success: true,
                message: "Default address updated successfully.",
                address: user.addresses.id(addressId),
                addresses: user.addresses,
            });
        }

        const updated = cleanAddress(body);

        const missingFields = requiredFields.filter(
            (field) => !String(updated[field] ?? "").trim()
        );

        if (missingFields.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Please fill in: ${missingFields.join(", ")}`,
                },
                { status: 400 }
            );
        }

        if (!/^\d{10}$/.test(updated.mobile)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid 10-digit mobile number." },
                { status: 400 }
            );
        }

        if (!/^\d{6}$/.test(updated.pincode)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid 6-digit PIN code." },
                { status: 400 }
            );
        }

        if (updated.isDefault) {
            user.addresses.forEach((item) => {
                item.isDefault = String(item._id) === String(addressId);
            });
        }

        Object.assign(address, updated);

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Address updated successfully.",
            address: user.addresses.id(addressId),
            addresses: user.addresses,
        });
    } catch (error) {
        console.error("PATCH address error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Failed to update address.",
            },
            { status: 500 }
        );
    }
}