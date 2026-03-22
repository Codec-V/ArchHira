import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, saveOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create unverified user
    await createUser({ email, password, name: name || email.split('@')[0] });

    // Generate & send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp, name);

    return NextResponse.json({ message: "Registration successful! Check your email for OTP" });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
