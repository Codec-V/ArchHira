import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword, saveOTP } from "@/lib/auth"; // ← Only import verifyUserPassword!
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log("🔍 LOGIN ATTEMPT:", { email, hasPassword: !!password }); // FIXED DEBUG
    
    // ✅ FIXED: Use verifyUserPassword ONLY - handles user lookup + password check
    const isPasswordValid = await verifyUserPassword(email, password);
    
    if (!isPasswordValid) {
      console.log("❌ INVALID PASSWORD");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("✅ PASSWORD VERIFIED");

    // Generate + SAVE + Send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 LOGIN OTP:", otp);
    
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp); // Fixed: No need for user.name here
    
    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
