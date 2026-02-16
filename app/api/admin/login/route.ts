import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations";
import { verifyAdmin } from "@/lib/admins";
import { isMongoConfigured } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Admin login requires MongoDB. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }
  const body = await request.json();
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;
  const result = await verifyAdmin(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    email: email.trim().toLowerCase(),
    isSuperAdmin: result.isSuperAdmin,
  });
}
