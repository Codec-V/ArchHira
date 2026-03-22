import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await findUserByEmail(authToken);
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
