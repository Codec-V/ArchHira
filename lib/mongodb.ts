/**
 * MongoDB connection for Next.js. Uses cached client for serverless (Vercel).
 */

import { MongoClient, Db, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "hira-hall";
const collectionName = "bookings";

const clientOptions: MongoClientOptions = {
  // Fail fast instead of hanging until Vercel's ~30s gateway timeout
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
};

if (!uri) {
  console.warn(
    "MONGODB_URI is not set. Add it to .env.local (or Vercel env vars) to use MongoDB."
  );
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in environment variables."
    );
  }
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, clientOptions).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export function getCollectionName(): string {
  return collectionName;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}
