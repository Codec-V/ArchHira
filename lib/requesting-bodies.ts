import { getDb, isMongoConfigured } from "@/lib/mongodb";

export type RequestingBodyType = "DEPT" | "CLUB" | "CELL" | "COMMITTEE";

export interface RequestingBody {
  id: string;
  name: string;
  type: RequestingBodyType;
  inChargeEmail: string;
  inChargeName: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

const COLLECTION = "requesting_bodies";

async function getColl() {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured for requesting bodies.");
  }
  const db = await getDb();
  return db.collection<RequestingBody & { _id?: unknown }>(COLLECTION);
}

export async function listActiveRequestingBodies(): Promise<RequestingBody[]> {
  const coll = await getColl();
  const docs = await coll.find({ active: true }).sort({ name: 1 }).toArray();
  return docs.map(({ _id, ...rest }) => rest);
}

export async function listAllRequestingBodies(): Promise<RequestingBody[]> {
  const coll = await getColl();
  const docs = await coll.find({}).sort({ name: 1 }).toArray();
  return docs.map(({ _id, ...rest }) => rest);
}

export async function createRequestingBody(
  data: Omit<RequestingBody, "id" | "createdAt">
): Promise<RequestingBody> {
  const coll = await getColl();
  const doc: RequestingBody = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  await coll.insertOne({ ...doc });
  return doc;
}

export async function updateRequestingBody(
  id: string,
  update: Partial<Omit<RequestingBody, "id" | "createdAt">>
): Promise<RequestingBody | null> {
  const coll = await getColl();
  const result = await coll.findOneAndUpdate(
    { id },
    { $set: { ...update, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  const { _id, ...rest } = result as RequestingBody & { _id?: unknown };
  return rest as RequestingBody;
}

export async function deleteRequestingBody(id: string): Promise<void> {
  const coll = await getColl();
  await coll.deleteOne({ id });
}

export async function findRequestingBodyById(
  id: string
): Promise<RequestingBody | null> {
  const coll = await getColl();
  const doc = await coll.findOne({ id });
  if (!doc) return null;
  const { _id, ...rest } = doc as RequestingBody & { _id?: unknown };
  return rest as RequestingBody;
}

