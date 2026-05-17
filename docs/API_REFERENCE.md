# ArchHira API Reference

## Purpose

Provide endpoint-level documentation for ArchHira APIs used by booking, authentication, and admin workflows.

## Audience

Backend and frontend developers integrating with ArchHira services.

## Status

Reference documentation for the current API surface implemented under `app/api/**`.

## Base Path

All routes are Next.js App Router endpoints and are served under:

`/api/...`

## Overview

ArchHira currently exposes three API groups:

- **Auth**: registration, login OTP, verification, session, and password reset
- **Bookings**: hall/guest-house booking creation and lifecycle management
- **Admin**: admin login and super-admin-driven admin creation

---

## Auth Module

### Register

**POST** `/api/auth/register`
- Body: `{ email, password, name? }`
- Behavior:
  - Creates user with `isVerified=false`
  - Generates OTP and sends it by email
- Returns: `{ message }`

### Login (password step)

**POST** `/api/auth/login`
- Body: `{ email, password }`
- Behavior:
  - Verifies credentials
  - Sends OTP for login verification
- Returns: `{ message }`

### Verify OTP (session creation)

**POST** `/api/auth/verify-otp`
- Body: `{ email, otp }`
- Behavior:
  - Verifies OTP
  - Sets `authToken` HTTP-only cookie
- Returns: `{ message }`

### Resend OTP

**POST** `/api/auth/resend-otp`
- Body: `{ email }`
- Behavior:
  - Creates and sends a new login OTP
- Returns: `{ message }`

### Forgot Password (send reset OTP)

**POST** `/api/auth/forgot-password`
- Body: `{ email }`
- Behavior:
  - Generates password-reset OTP (`purpose: "password-reset"`)
  - Sends OTP email
- Returns: `{ message }`

### Reset Password

**POST** `/api/auth/reset-password`
- Body: `{ email, otp, newPassword, confirmPassword }`
- Validation:
  - `newPassword === confirmPassword`
  - password length >= 6
- Behavior:
  - Verifies reset OTP
  - Updates user password
- Returns: `{ message }`

### Current Session User

**GET** `/api/auth/me`
- Requires: `authToken` cookie
- Returns: `{ user: { email, name } }`

### Logout

**POST** `/api/auth/logout`
- Behavior: clears `authToken` cookie
- Returns: `{ message }`

---

## Booking Module

## Booking Types

- `HIRA_HALL`
- `ARCHITECTURE_HALL`
- `GUEST_HOUSE`

## Slots

- `FIRST_HALF`
- `SECOND_HALF`
- `FULL_DAY`

## Request Status

- `PENDING`
- `APPROVED`
- `REJECTED`

### List Bookings

**GET** `/api/bookings`
- Requires: authenticated verified user (`authToken` cookie)
- Returns: `Booking[]`

### Create Booking

**POST** `/api/bookings`
- Requires: authenticated verified user (`authToken` cookie)
- Body: one of:
  - Hall/Architecture booking payload (name, designation, email, subject, purpose, type, department, date, slot, requestingBodyId)
  - Guest-house booking payload (visitor/requester details, stay dates, category, rooms, payment details, requestingBodyId)
- Behavior:
  - Validates payload via Zod
  - Runs conflict/availability checks
  - Creates booking with `PENDING` status
- Returns: created `Booking`

### Get Booking by ID

**GET** `/api/bookings/:id`
- Requires: authenticated verified user (`authToken` cookie)
- Returns: `Booking`

### Create Booking via ID Route (legacy path)

**POST** `/api/bookings/:id`
- Requires: authenticated verified user (`authToken` cookie)
- Behavior: creates booking from request body using shared store helper
- Returns: created `Booking`

### Patch Booking

**PATCH** `/api/bookings/:id`
- Requires: authenticated verified user (`authToken` cookie)
- Body: partial booking fields, typically status updates
- Behavior:
  - Validates booking existence
  - Enforces 7-day approval rule for `APPROVED`
  - Sends acceptance/rejection email when status changes
- Returns: updated `Booking`

### Replace Booking

**PUT** `/api/bookings/:id`
- Requires: authenticated verified user (`authToken` cookie)
- Body: replacement booking fields
- Returns: updated `Booking`

### Delete Booking

**DELETE** `/api/bookings/:id`
- Requires: authenticated verified user (`authToken` cookie)
- Rules:
  - Rejects deleting `APPROVED` bookings
- Returns: `{ message }`

---

## Admin Module

### Admin Login

**POST** `/api/admin/login`
- Requires: MongoDB configured
- Body: `{ email, password }`
- Returns: `{ success, email, isSuperAdmin }`

### Add Admin (Super Admin Only)

**POST** `/api/admin/add`
- Requires: MongoDB configured
- Body: `{ currentAdminEmail, newEmail, newPassword }`
- Rules:
  - Caller email must belong to a super admin
  - New admin email must be unique
- Returns: `{ success: true }`

---

## Authentication and Access Rules

### Public Access

- Auth flow initiation endpoints:
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/auth/verify-otp`
  - `/api/auth/resend-otp`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`

### Authenticated User Required

- Booking endpoints (`/api/bookings`, `/api/bookings/:id`)
- Session endpoint (`/api/auth/me`)
- Logout endpoint (`/api/auth/logout`)

### MongoDB Required

- Admin endpoints (`/api/admin/login`, `/api/admin/add`)

---

## Example Workflows

### User Login with OTP

```bash
# 1) Password check + OTP send
POST /api/auth/login
{ "email": "user@example.com", "password": "secret123" }

# 2) OTP verification + cookie session
POST /api/auth/verify-otp
{ "email": "user@example.com", "otp": "123456" }

# 3) Read current session user
GET /api/auth/me
```

### Hall Booking

```bash
# 1) Create booking
POST /api/bookings
{
  "name": "A User",
  "designation": "Student",
  "email": "user@example.com",
  "subject": "Workshop",
  "purpose": "Department workshop",
  "type": "HIRA_HALL",
  "department": "Architecture",
  "date": "2026-06-15",
  "slot": "FIRST_HALF",
  "requestingBodyId": "body-1"
}

# 2) Fetch booking
GET /api/bookings/<booking-id>

# 3) Update status
PATCH /api/bookings/<booking-id>
{ "status": "APPROVED" }
```

### Guest House Booking

```bash
POST /api/bookings
{
  "type": "GUEST_HOUSE",
  "requestingBodyId": "body-2",
  "visitorName": "Guest One",
  "visitorAddress": "Raipur, Chhattisgarh",
  "expectedArrival": "2026-06-20T10:00",
  "expectedDeparture": "2026-06-21T10:00",
  "category": "B",
  "purpose": "Academic visit",
  "roomsRequested": 1,
  "advancedPaymentDetails": "Paid via UPI",
  "paymentDriveLink": "https://drive.google.com/...",
  "requesterName": "Faculty Name",
  "requesterDesignation": "Professor",
  "requesterDepartment": "Architecture",
  "requesterPhone": "9876543210",
  "requesterEmail": "faculty@example.com"
}
```

---

## Related Docs

- `docs/MONGODB_SETUP.md`
- `docs/MONGODB_MIGRATION.md`
