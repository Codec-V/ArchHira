/**
 * MongoDB connection for Next.js. Uses cached client for serverless.
 */

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "hira-hall";
const collectionName = "bookings";

if (!uri) {
  console.warn(
    "MONGODB_URI is not set. Add it to .env.local to use MongoDB; otherwise the app may fall back to in-memory store."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri).connect();
  }
}

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    throw new Error("MongoDB is not configured. Set MONGODB_URI in .env.local");
  }
  const client = await clientPromise;
  return client.db(dbName);
}

export function getCollectionName(): string {
  return collectionName;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}
