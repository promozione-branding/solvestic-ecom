import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pincode = (searchParams.get("pincode") || "").trim();

        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please enter a valid 6-digit PIN code.",
                },
                { status: 400 }
            );
        }

        const pickupPincode = process.env.SHIPROCKET_PICKUP_POSTCODE;

        if (!pickupPincode || !/^[1-9][0-9]{5}$/.test(pickupPincode)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Shipping pickup PIN code is not configured.",
                },
                { status: 500 }
            );
        }

        const token = await getShiprocketToken();

        const params = new URLSearchParams({
            pickup_postcode: pickupPincode,
            delivery_postcode: pincode,
            weight: "0.5",
            cod: "0",
        });

        const response = await fetch(
            `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Shiprocket serviceability error:", {
                status: response.status,
                message: data?.message,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to check delivery right now. Please try again.",
                },
                { status: 502 }
            );
        }

        const couriers = data?.data?.available_courier_companies || [];

        if (couriers.length === 0) {
            return NextResponse.json({
                success: true,
                serviceable: false,
                pincode,
                message: "Sorry, delivery is not available at this PIN code currently.",
            });
        }

        const firstCourier = couriers[0];

        return NextResponse.json({
            success: true,
            serviceable: true,
            pincode,
            message: "Great! Delivery is available at your PIN code.",
            estimatedDelivery:
                firstCourier?.etd ||
                firstCourier?.estimated_delivery_days ||
                null,
        });
    } catch (error) {
        console.error("PIN code check failed:", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to check delivery right now. Please try again.",
            },
            { status: 500 }
        );
    }
}