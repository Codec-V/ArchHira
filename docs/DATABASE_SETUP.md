# MongoDB Setup (ArchHira)

## Purpose

Provide a single, consistent setup and operational guide for MongoDB in ArchHira.

## Audience

Developers running ArchHira locally or in CI who need a working MongoDB connection and baseline operational guidance.

## Status

MongoDB integration is implemented. When MongoDB is configured, data is persistent; when it is not configured, parts of the app fall back to in-memory behavior.

## Prerequisites

```bash
# MongoDB installed locally or running via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
# Connection string: mongodb+srv://username:password@cluster.mongodb.net/
```

## Environment Setup

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hira-hall
NODE_ENV=development

# Admin bootstrap (used when admins collection is empty)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
```

Optional SMTP settings for approval/rejection emails:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## Database Architecture

### Collections

| Collection | Module | Purpose | Source |
|-----------|--------|---------|--------|
| bookings | Booking | Store all hall/guest house booking requests and approval metadata | `lib/store-server.ts` |
| admins | Admin | Store admin credentials and super-admin flag | `lib/admins.ts` |
| users | Auth | Store authenticated users and verification/password metadata | `lib/auth.ts` |
| otps | Auth | Store OTPs for verification and password reset | `lib/auth.ts` |
| requesting_bodies | Requesting Bodies | Store departments/clubs/cells/committees used in booking flow | `lib/requesting-bodies.ts` |

### Relationships

```text
User
└── OTP (1:N, by email, short-lived)

RequestingBody
└── Booking (1:N, via requestingBodyId)

Booking
└── Approval metadata (L1/L2 approvers and timestamps)

Admin
└── Admin creation authority (only super admin can create additional admins)
```

## Schema Details

### Booking Document (`bookings`)
```javascript
{
  id: String,
  type: "HIRA_HALL" | "ARCHITECTURE_HALL" | "GUEST_HOUSE",
  date: "YYYY-MM-DD",
  slot: "FIRST_HALF" | "SECOND_HALF" | "FULL_DAY",
  name: String,
  designation: String,
  email: String,
  subject: String,
  purpose: String,
  status: "PENDING" | "APPROVED" | "REJECTED",
  requestingBodyId: String,
  l1ApprovedByEmail: String,
  l1ApprovedAt: String,
  l2ApprovedByEmail: String,
  l2ApprovedAt: String,
  createdAt: String,
  updatedAt: String,
  // Guest house fields are optional on other types:
  visitorName: String,
  visitorAddress: String,
  expectedArrival: String,
  expectedDeparture: String,
  category: "A" | "B" | "C" | "HALL",
  roomsRequested: Number,
  advancedPaymentDetails: String,
  paymentDriveLink: String,
  requesterDepartment: String,
  requesterPhone: String
}
```

### Admin Document (`admins`)
```javascript
{
  id: String,
  email: String,          // lowercase
  passwordHash: String,   // bcrypt hash
  isSuperAdmin: Boolean,
  createdAt: String
}
```

### User Document (`users`)
```javascript
{
  email: String,
  password: String,       // bcrypt hash
  name: String,
  role: "STUDENT" | "FACULTY_INCHARGE" | "SUPER_ADMIN",
  isVerified: Boolean,
  createdAt: Date,
  resetToken: String,
  resetTokenExpiry: Date
}
```

### OTP Document (`otps`)
```javascript
{
  email: String,
  otp: String,
  purpose: "password-reset",  // optional for non-reset OTPs
  expiresAt: Date,
  createdAt: Date
}
```

### Requesting Body Document (`requesting_bodies`)
```javascript
{
  id: String,
  name: String,
  type: "DEPT" | "CLUB" | "CELL" | "COMMITTEE",
  inChargeEmail: String,
  inChargeName: String,
  active: Boolean,
  createdAt: String,
  updatedAt: String
}
```

## Database Connection Options

### Local Development
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hira-hall
```

### Docker
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  --name mongodb \
  mongo:latest
```

If authentication is enabled:
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/?authSource=admin
MONGODB_DB_NAME=hira-hall
```

### MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=hira-hall
```

## Health Check Endpoint (Optional)

For Next.js App Router, add `app/api/health/db/route.ts`:

```javascript
import { NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb";

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({ status: "unhealthy", database: "mongodb", reason: "not configured" }, { status: 503 });
  }
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "healthy", database: "mongodb" });
  } catch {
    return NextResponse.json({ status: "unhealthy", database: "mongodb" }, { status: 503 });
  }
}
```

## Index Strategy

ArchHira currently does not create MongoDB indexes explicitly in code. Recommended indexes:

| Collection | Recommended Indexes |
|-----------|---------------------|
| bookings | `id` (unique), `date`, `type`, `status`, `requestingBodyId`, `createdAt` |
| admins | `email` (unique), `isSuperAdmin` |
| users | `email` (unique), `isVerified`, `role` |
| otps | `email`, `expiresAt`, `purpose`, TTL index on `expiresAt` |
| requesting_bodies | `id` (unique), `active`, `name`, `type` |

Example:

```javascript
await db.collection("bookings").createIndex({ id: 1 }, { unique: true });
await db.collection("admins").createIndex({ email: 1 }, { unique: true });
await db.collection("users").createIndex({ email: 1 }, { unique: true });
await db.collection("otps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## Data Backup Strategy

```bash
# Backup
mongodump --uri="mongodb://localhost:27017" --db="hira-hall" --out=./backups

# Restore
mongorestore --uri="mongodb://localhost:27017" --db="hira-hall" ./backups/hira-hall
```

## Troubleshooting

### MongoDB Not Configured

`MONGODB_URI is not configured. Set MONGODB_URI in .env.local`

Check:
```env
MONGODB_URI=...
MONGODB_DB_NAME=hira-hall
```

### Verify Connectivity in Code
```javascript
import { getDb, isMongoConfigured } from "@/lib/mongodb";

console.log("mongo configured:", isMongoConfigured());
const db = await getDb();
await db.command({ ping: 1 });
```

### Admin Login Fails

If `admins` is empty, first admin is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Ensure both env vars are set and restart the app.

## Performance Considerations

1. Use projected reads / lightweight responses for read-heavy endpoints.
2. Add indexes for `date`, `status`, `email`, and OTP expiry to prevent collection scans.
3. Keep OTP cleanup strategy in place (TTL index recommended).
4. Reuse MongoDB client in development (already implemented in `lib/mongodb.ts`).

## Next Steps

1. Add explicit index initialization during startup.
2. Add `/api/health/db` route for runtime monitoring.
3. Add CI coverage for MongoDB-backed flows (bookings, admin auth, OTP paths).

## Files Added/Updated

```text
docs/
└── MONGODB_SETUP.md (NEW)
README.md (UPDATED - added documentation link)
```
