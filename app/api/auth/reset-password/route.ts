import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetOTP, resetUserPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword, confirmPassword } = await request.json();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        error: "Passwords do not match" 
      }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters" 
      }, { status: 400 });
    }
    
    // Verify OTP
    const isValidOTP = await verifyPasswordResetOTP(email, otp);
    if (!isValidOTP) {
      return NextResponse.json({ 
        error: "Invalid or expired OTP" 
      }, { status: 400 });
    }
    
    // Reset password
    const success = await resetUserPassword(email, newPassword);
    if (!success) {
      return NextResponse.json({ 
        error: "Failed to reset password" 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: "Password reset successful!" 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Password reset failed" 
    }, { status: 500 });
  }
}
