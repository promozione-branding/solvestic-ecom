
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { verifyAdminToken } from "@/lib/admin-session";

export const runtime = "nodejs";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
    try {
        const token = request.cookies.get("admin_token")?.value;

        if (!token || !verifyAdminToken(token)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access." },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "";
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(searchParams.get("limit")) || 10)
        );

        const filter = {};

        if (search) {
            const regex = new RegExp(escapeRegex(search), "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex },
            ];
        }

        if (["active", "blocked"].includes(status)) {
            filter.status = status;
        }

        const [users, total, active, blocked, verified] =
            await Promise.all([
                User.find(filter)
                    .select("-password")
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),

                User.countDocuments(filter),
                User.countDocuments({ status: "active" }),
                User.countDocuments({ status: "blocked" }),
                User.countDocuments({
                    status: "active",
                    mobileVerified: true,
                }),
            ]);

        return NextResponse.json({
            success: true,
            users: users.map((user) => ({
                ...user,
                _id: user._id.toString(),
            })),
            stats: {
                total: await User.countDocuments(),
                active,
                blocked,
                verified,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        console.error("Admin fetch users error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch customers.",
            },
            { status: 500 }
        );
    }
}
