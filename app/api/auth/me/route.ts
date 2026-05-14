import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import Organization from "@/models/Organization";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1. Get token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Verify and validate token payload
    let decoded: { userId?: string };
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // 3. Guard against missing userId in payload
    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // 4. Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 5. Get organization 
    const organization = await Organization.findById(user.organizationId).select(
      "name plan createdAt" // ← whitelist only what the client needs
    );

    return NextResponse.json({ success: true, user, organization });

  } catch (error) {
    console.error("[GET /api/me] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}