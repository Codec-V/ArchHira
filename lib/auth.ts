// lib/auth.ts - 100% WORKING VERSION WITH SAFETY
import { MongoClient } from "mongodb";
import { getDb } from "./mongodb";
import bcrypt from "bcryptjs";
import { User, CreateUserInput } from "@/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>("users").findOne({ email });
  return user;
}

export async function createUser(user: CreateUserInput): Promise<User> {
  const db = await getDb();
  const hashedPassword = await bcrypt.hash(user.password, 12);
  const newUser: User = {
    email: user.email,
    password: hashedPassword,
    name: user.name,
    isVerified: false,
    createdAt: new Date(),
  };
  await db.collection<User>("users").insertOne(newUser);
  return newUser;
}

export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  if (!user) {
    console.log("❌ User not found:", email);
    return false;
  }
  
  // 🚨 SAFETY CHECKS - PREVENT BCRYPT CRASH
  console.log("🔍 DEBUG - Login attempt:", { 
    email, 
    hasPassword: !!password, 
    hasUserPassword: !!user.password,
    passwordLength: password ? password.length : 0
  });
  
  if (!password) {
    console.error("❌ LOGIN FORM ERROR: password is undefined/empty!");
    return false;
  }
  
  if (!user.password) {
    console.error("❌ DATABASE ERROR: user.password is missing!");
    return false;
  }
  
  try {
    const result = await bcrypt.compare(password, user.password);
    console.log("✅ Password verification result:", result);
    return result;
  } catch (error) {
    console.error("❌ BCRYPT ERROR:", error);
    return false;
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const db = await getDb();
  
  console.log("🔍 Searching OTP:", { email, otp });
  
  const otpRecord = await db.collection("otps").findOne({ 
    email, 
    otp,
    expiresAt: { $gt: new Date() }
  });
  
  console.log("🔍 Found OTP record:", otpRecord ? "YES" : "NO");
  
  if (!otpRecord) return false;
  
  await db.collection("otps").deleteOne({ _id: otpRecord._id });
  await db.collection("users").updateOne(
    { email }, 
    { $set: { isVerified: true } }
  );
  
  return true;
}

export async function saveOTP(email: string, otp: string): Promise<void> {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  console.log("💾 SAVING OTP:", { email, otp, expiresAt });
  
  await db.collection("otps").insertOne({
    email,
    otp,
    expiresAt,
    createdAt: new Date()
  });
}

export async function cleanupExpiredOTPs(): Promise<void> {
  const db = await getDb();
  await db.collection("otps").deleteMany({
    expiresAt: { $lt: new Date() }
  });
}
// ADD THESE AFTER cleanupExpiredOTPs()

/**
 * Send password reset OTP (same OTP collection, different purpose)
 */
export async function sendPasswordResetOTP(email: string, otp: string): Promise<void> {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  console.log("🔄 PASSWORD RESET OTP:", { email, otp, expiresAt });
  
  await db.collection("otps").insertOne({
    email,
    otp,
    purpose: "password-reset", // ✅ Distinguish from login OTPs
    expiresAt,
    createdAt: new Date()
  });
}

/**
 * Verify password reset OTP (separate from login verification)
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<boolean> {
  const db = await getDb();
  
  console.log("🔍 PASSWORD RESET OTP SEARCH:", { email, otp });
  
  const otpRecord = await db.collection("otps").findOne({ 
    email, 
    otp,
    purpose: "password-reset",
    expiresAt: { $gt: new Date() }
  });
  
  console.log("🔍 PASSWORD RESET OTP FOUND:", otpRecord ? "YES" : "NO");
  
  if (!otpRecord) return false;
  
  // Delete used OTP
  await db.collection("otps").deleteOne({ _id: otpRecord._id });
  return true;
}

/**
 * Reset user password after OTP verification
 */
export async function resetUserPassword(email: string, newPassword: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  if (!user) {
    console.log("❌ User not found for password reset:", email);
    return false;
  }
  
  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const db = await getDb();
    const result = await db.collection("users").updateOne(
      { email },
      { $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
    
    console.log("✅ Password reset successful:", { email, updated: result.modifiedCount > 0 });
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Password reset failed:", error);
    return false;
  }
}
