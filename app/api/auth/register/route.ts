import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, saveOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { isMongoConfigured } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server database is not configured. Set MONGODB_URI in Vercel environment variables and redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    await createUser({
      email,
      password,
      name: name || email.split("@")[0],
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOTP(email, otp);

    const emailSent = await sendOTPEmail(email, otp, name);

    return NextResponse.json({
      message: emailSent
        ? "Registration successful! Check your email for OTP"
        : "Account created. OTP email could not be sent — configure SMTP on the server or contact an admin.",
    });
  } catch (error) {
    console.error("[auth/register]", error);
    const message =
      error instanceof Error ? error.message : "Registration failed";
    const isDbTimeout =
      message.includes("Server selection timed out") ||
      message.includes("MongoServerSelectionError") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND");

    return NextResponse.json(
      {
        error: isDbTimeout
          ? "Cannot reach the database. Check MONGODB_URI on Vercel and MongoDB Atlas network access (allow 0.0.0.0/0)."
          : "Registration failed",
      },
      { status: 500 }
    );
  }
}
