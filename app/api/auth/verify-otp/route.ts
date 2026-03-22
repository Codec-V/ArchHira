import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    
    const isValid = await verifyOTP(email, otp);
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Create session cookie
    const response = NextResponse.json({ message: "Login successful!" });
    response.cookies.set("authToken", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
