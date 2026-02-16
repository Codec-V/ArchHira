/**
 * Admin users in MongoDB. First admin (from env) is super admin; only super admin can add other admins.
 */

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { isMongoConfigured } from "@/lib/mongodb";

const ADMINS_COLLECTION = "admins";

export interface AdminDoc {
  id: string;
  email: string;
  passwordHash: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

async function getAdminsColl() {
  const db = await getDb();
  return db.collection<AdminDoc & { _id?: unknown }>(ADMINS_COLLECTION);
}

/** Seed first admin from env if no admins exist. */
export async function seedFirstAdminIfNeeded(): Promise<void> {
  if (!isMongoConfigured()) return;
  const coll = await getAdminsColl();
  const count = await coll.countDocuments();
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("No admins in DB and ADMIN_EMAIL/ADMIN_PASSWORD not set. Set them to create the first super admin.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin: AdminDoc = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    passwordHash,
    isSuperAdmin: true,
    createdAt: new Date().toISOString(),
  };
  await coll.insertOne({ ...admin });
  console.log("First super admin created from env:", admin.email);
}

export async function findAdminByEmail(email: string): Promise<AdminDoc | null> {
  if (!isMongoConfigured()) return null;
  await seedFirstAdminIfNeeded();
  const coll = await getAdminsColl();
  const doc = await coll.findOne({ email: email.trim().toLowerCase() });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as AdminDoc;
}

export async function verifyAdmin(email: string, password: string): Promise<{ ok: true; isSuperAdmin: boolean } | { ok: false }> {
  const admin = await findAdminByEmail(email);
  if (!admin) return { ok: false };
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return { ok: false };
  return { ok: true, isSuperAdmin: admin.isSuperAdmin };
}

export async function addAdminBySuperAdmin(
  currentAdminEmail: string,
  newEmail: string,
  newPassword: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isMongoConfigured()) {
    return { success: false, error: "MongoDB is not configured." };
  }
  const coll = await getAdminsColl();
  const current = await coll.findOne({ email: currentAdminEmail.trim().toLowerCase() });
  if (!current || !(current as AdminDoc).isSuperAdmin) {
    return { success: false, error: "Only the super admin can add new admins." };
  }
  const normalizedNew = newEmail.trim().toLowerCase();
  const existing = await coll.findOne({ email: normalizedNew });
  if (existing) {
    return { success: false, error: "An admin with this email already exists." };
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const admin: AdminDoc = {
    id: crypto.randomUUID(),
    email: normalizedNew,
    passwordHash,
    isSuperAdmin: false,
    createdAt: new Date().toISOString(),
  };
  await coll.insertOne({ ...admin });
  return { success: true };
}
