# MongoDB Migration Guide (ArchHira)

## Purpose

Document the completed migration of ArchHira backend data handling from in-memory-only behavior to MongoDB-backed persistence (with limited fallback support where intentionally retained).

## Audience

Developers and maintainers who need to understand what changed, which files were updated, and how to reproduce or extend the migration.

## Status

Migration is complete for server-side booking, admin, auth, and requesting-body flows.  
MongoDB is the primary datastore; booking APIs include an in-memory fallback when MongoDB is not configured.

## Completed Setup

### Database Infrastructure

- [x] Shared MongoDB connection manager with client caching (`lib/mongodb.ts`)
- [x] Collection-based data access modules for all active backend domains
- [x] API routes converted to async/await for DB I/O
- [x] Env-driven database configuration (`MONGODB_URI`, `MONGODB_DB_NAME`)
- [x] Setup and operations guide (`docs/MONGODB_SETUP.md`)

### Collections in Use

| Domain | File(s) | Collection(s) |
|---|---|---|
| Booking | `lib/store-server.ts` | `bookings` |
| Admin | `lib/admins.ts` | `admins` |
| Auth | `lib/auth.ts` | `users`, `otps` |
| Requesting Bodies | `lib/requesting-bodies.ts` | `requesting_bodies` |

## Migration Summary by Module

### 1) Booking Store Migration

**Primary file**: `lib/store-server.ts`

**What changed**
- Replaced direct in-memory-only CRUD with MongoDB-first async operations.
- Added MongoDB read/write paths:
  - `getBookings()`
  - `addBookingServer()`
  - `createBooking()`
  - `updateBookingById()`
  - `deleteBookingById()`
  - `getBookingById()`
  - `saveBookings()` for bulk replacement flows
- Retained controlled in-memory fallback (`memoryBookings`) when MongoDB is not configured.

**API integration**
- Booking routes are now async and await DB-backed store methods:
  - `app/api/bookings/route.ts`
  - `app/api/bookings/[id]/route.ts`

### 2) Admin Access Migration

**Primary file**: `lib/admins.ts`

**What changed**
- Migrated admin verification and management from non-persistent logic to MongoDB documents.
- Added first-admin bootstrap from environment:
  - `seedFirstAdminIfNeeded()`
- Added MongoDB-backed admin operations:
  - `findAdminByEmail()`
  - `verifyAdmin()`
  - `addAdminBySuperAdmin()`
  - `isSuperAdminEmail()`

**API integration**
- Async MongoDB-backed admin routes:
  - `app/api/admin/login/route.ts`
  - `app/api/admin/add/route.ts`

### 3) Auth + OTP Migration

**Primary file**: `lib/auth.ts`

**What changed**
- Persisted users and OTP records in MongoDB (`users`, `otps`).
- Added async operations for:
  - user lookup/creation and password verification
  - OTP save/verify/cleanup
  - password-reset OTP and password reset updates

**Server usage**
- Session/user resolution in server context now reads from MongoDB:
  - `lib/auth-server.ts`

### 4) Requesting Body Migration

**Primary file**: `lib/requesting-bodies.ts`

**What changed**
- Replaced non-persistent handling with MongoDB collection operations.
- Added async CRUD/list methods:
  - `listActiveRequestingBodies()`
  - `listAllRequestingBodies()`
  - `createRequestingBody()`
  - `updateRequestingBody()`
  - `deleteRequestingBody()`
  - `findRequestingBodyById()`

## Controller/Route Pattern Update

All migrated routes and services follow the async DB pattern:

1. Validate request payload and auth/session state.
2. Await MongoDB-backed function calls.
3. Return structured API responses.
4. Handle DB and runtime failures with error responses.

## Environment Setup

Use `docs/MONGODB_SETUP.md` for complete setup and operational guidance.

Minimum env configuration:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hira-hall
```

## Error Handling Notes

Current implementation handles failures at route level using guarded `try/catch` blocks and status responses.

Recommended hardening (incremental):
- Normalize MongoDB driver errors into a shared API error shape.
- Add explicit mapping for invalid identifier/validation failures.
- Reduce debug logging verbosity in production for auth flows.

## Testing and Validation

Current repository validation commands:

```bash
npm run lint
npm run build
```

No dedicated automated MongoDB test suite is currently present in the repository.  
Recommended next step: add integration tests for booking, admin, and auth routes using a test database or MongoDB memory server.

## Performance and Operational Follow-ups

Recommended indexes (if not yet applied in deployment scripts):
- `bookings`: `id` (unique), `date`, `type`, `status`, `requestingBodyId`, `createdAt`
- `admins`: `email` (unique), `isSuperAdmin`
- `users`: `email` (unique), `isVerified`
- `otps`: `email`, `purpose`, TTL index on `expiresAt`
- `requesting_bodies`: `id` (unique), `active`, `name`, `type`

## Rollback Strategy

If runtime issues appear after deployment:

1. Keep MongoDB disabled by environment in affected environments.
2. Use existing booking in-memory fallback for temporary continuity.
3. Restore data from MongoDB backup when needed.
4. Re-enable MongoDB after fix verification.

## Related Docs

- `docs/MONGODB_SETUP.md`
- `README.md` (project overview and MongoDB usage notes)
