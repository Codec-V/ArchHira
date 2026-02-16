/**
 * Bookings store: MongoDB when MONGODB_URI is set, otherwise in-memory (dev fallback).
 * All functions are async so API routes use await.
 */

import { Booking, RequestStatus } from "@/types";
import { getDb, getCollectionName, isMongoConfigured } from "@/lib/mongodb";

const memoryBookings: Booking[] = [];

export async function getBookings(): Promise<Booking[]> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection<Booking>(getCollectionName());
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => {
      const { _id, ...rest } = d as Booking & { _id?: unknown };
      return rest as Booking;
    });
  }
  return [...memoryBookings];
}

export async function addBookingServer(b: Booking): Promise<void> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection(getCollectionName());
    await coll.insertOne({ ...b });
    return;
  }
  memoryBookings.push(b);
}

export async function updateBookingById(
  id: string,
  status: RequestStatus.APPROVED | RequestStatus.REJECTED,
  reviewedBy?: string
): Promise<Booking | null> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection<Booking>(getCollectionName());
    const result = await coll.findOneAndUpdate(
      { id },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString(),
          ...(reviewedBy != null && { reviewedBy }),
        },
      },
      { returnDocument: "after" }
    );
    if (!result) return null;
    const { _id, ...rest } = result as Booking & { _id?: unknown };
    return rest as Booking;
  }
  const idx = memoryBookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  memoryBookings[idx].status = status;
  memoryBookings[idx].updatedAt = new Date().toISOString();
  if (reviewedBy != null) memoryBookings[idx].reviewedBy = reviewedBy;
  return memoryBookings[idx];
}
