import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import User from "@/models/User";
import Organization from "@/models/Organization";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { organizationName, name, email, password } = body;

    // --- Validation ---
    if (!organizationName || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // --- Duplicate check ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // --- Hash password before any DB writes ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create org + user together; delete org if user creation fails ---
    const organization = await Organization.create({ name: organizationName });

    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "owner",
        organizationId: organization._id,
      });
    } catch (userError) {
      await Organization.findByIdAndDelete(organization._id); // rollback
      throw userError;
    }

    // --- Token ---
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: organization._id.toString(),
    });

    // --- Response: never return the raw user document ---
    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id.toString(),
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/register]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
