import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, saveOTP } from "@/lib/auth";  // ✅ Added saveOTP
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 RESEND OTP:", otp); // DEBUG
    
    await saveOTP(email, otp);  // ✅ CRITICAL FIX
    await sendOTPEmail(email, otp, user.name);
    
    return NextResponse.json({ message: "New OTP sent!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
