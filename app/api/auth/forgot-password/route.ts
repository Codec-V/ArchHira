import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, sendPasswordResetOTP } from "@/lib/auth"; // ✅ FIXED IMPORTS
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // ✅ FIXED: Use PASSWORD RESET function (sets purpose: "password-reset")
    await sendPasswordResetOTP(email, otp); // ✅ Now matches verifyPasswordResetOTP!
    
    await sendOTPEmail(email, otp, "Password Reset");
    
    console.log("✅ PASSWORD RESET OTP SAVED:", { email, otp });
    
    return NextResponse.json({ message: "Password reset OTP sent!" });
  } catch (error) {
    console.error("❌ FORGOT ERROR:", error);
    return NextResponse.json({ error: "Failed to send reset OTP" }, { status: 500 });
  }
}
