
import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export const runtime = "nodejs";

export async function GET() {
    // This is a temporary development-only diagnostic route.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { success: false, message: "Not found." },
            { status: 404 }
        );
    }

    try {
        await getShiprocketToken();

        return NextResponse.json({
            success: true,
            message: "Shiprocket authentication successful.",
        });
    } catch (error) {
        console.error("Shiprocket test failed:", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Shiprocket authentication failed. Check your server credentials and Shiprocket API user.",
            },
            { status: 502 }
        );
    }
}
