import { getDb } from "./mongodb";
import { cookies } from "next/headers"; // ✅ Correct import
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    
    // ✅ DEBUG: Log ALL cookies
    console.log("🔍 ALL COOKIES:", cookieStore.getAll().map(c => ({ name: c.name, value: c.value ? '***' : 'empty' })));
    
    const userEmail = cookieStore.get("userEmail")?.value;
    console.log("🔍 userEmail cookie:", userEmail ? 'FOUND' : 'MISSING');
    
    if (!userEmail) {
      console.log("❌ NO userEmail cookie → redirect");
      return null;
    }
    
    // Check user in DB
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: userEmail });
    console.log("🔍 DB user found:", !!user);
    
    return user ? { email: user.email } : null;
  } catch (error) {
    console.error("💥 Auth error:", error);
    return null;
  }
}

