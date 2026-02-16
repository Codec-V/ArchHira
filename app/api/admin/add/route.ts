import { NextRequest, NextResponse } from "next/server";
import { addAdminSchema } from "@/lib/validations";
import { addAdminBySuperAdmin } from "@/lib/admins";
import { isMongoConfigured } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Adding admins requires MongoDB." },
      { status: 503 }
    );
  }
  const body = await request.json();
  const parsed = addAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { currentAdminEmail, newEmail, newPassword } = parsed.data;
  const result = await addAdminBySuperAdmin(
    currentAdminEmail,
    newEmail,
    newPassword
  );
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
