/**
 * Bookings store: MongoDB when MONGODB_URI is set, otherwise in-memory (dev fallback).
 * All functions are async so API routes use await.
 */

import { Booking, RequestStatus, BookingType } from "@/types";
import { getDb, getCollectionName, isMongoConfigured } from "@/lib/mongodb";
// Add this to your store-server.ts imports:
import { formatDate } from "@/lib/booking-logic";

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

export async function saveBookings(bookings: Booking[]): Promise<boolean> {
  if (isMongoConfigured()) {
    // MongoDB: Replace entire collection (admin bulk update)
    const db = await getDb();
    const coll = db.collection<Booking>(getCollectionName());
    
    // Clear existing and insert new (for admin bulk operations)
    await coll.deleteMany({});
    if (bookings.length > 0) {
      await coll.insertMany(bookings);
    }
    return true;
  }
  
  // In-memory: Direct assignment
  memoryBookings.splice(0, memoryBookings.length, ...bookings);
  return true;
}

export async function createBooking(bookingData: Partial<Booking>): Promise<Booking> {
  // ✅ Type assertion - safe because we provide required fields
  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: (bookingData.type ?? "GUEST_HOUSE") as BookingType,
    status: RequestStatus.PENDING as RequestStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...bookingData,
  } as Booking;

  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection(getCollectionName());
    await coll.insertOne(newBooking);
  } else {
    memoryBookings.push(newBooking);
  }
  
  return newBooking;
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
  updateData: Partial<Booking>,
  fullReplace = false
): Promise<Booking | null> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection<Booking>(getCollectionName());
    
    const updateObj = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const result = await coll.findOneAndUpdate(
      { id },
      fullReplace 
        ? { $set: updateObj } 
        : { $set: updateObj },
      { returnDocument: "after" }
    );
    
    if (!result) return null;
    const { _id, ...rest } = result as Booking & { _id?: unknown };
    return rest as Booking;
  }

  const idx = memoryBookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  
  if (fullReplace) {
    memoryBookings[idx] = { ...updateData, id, updatedAt: new Date().toISOString() } as Booking;
  } else {
    Object.assign(memoryBookings[idx], updateData, { updatedAt: new Date().toISOString() });
  }
  
  return memoryBookings[idx];
}

export async function deleteBookingById(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection(getCollectionName());
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }
  
  const idx = memoryBookings.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  
  memoryBookings.splice(idx, 1);
  return true;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (isMongoConfigured()) {
    const db = await getDb();
    const coll = db.collection<Booking>(getCollectionName());
    const result = await coll.findOne({ id });
    if (!result) return null;
    const { _id, ...rest } = result as Booking & { _id?: unknown };
    return rest as Booking;
  }
  
  return memoryBookings.find((b) => b.id === id) || null;
}
