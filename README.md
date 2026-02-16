# Hira Hall & Guest House Booking System

A Next.js (App Router) booking system for **Hira Hall** (first/second half or full day) and **Guest House** (full day only), with conflict validation and an admin approval workflow.

## Tech Stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **Lucide React** (icons), **Zod** (validation), **react-hook-form** + **@hookform/resolvers**
- **react-day-picker** + **date-fns** (calendar and dates)
- **MongoDB** for global, persistent storage (optional; in-memory fallback if not configured)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### MongoDB (global storage)

To persist bookings in **MongoDB** (shared across restarts and instances), add to `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017
# Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=hira-hall   # optional; default is hira-hall
```

- If `MONGODB_URI` is set, all bookings are stored in the `bookings` collection (global).
- If not set, the app uses in-memory storage (data is lost on restart).

## Features

- **Landing**: Two glassmorphism cards — “Book Hira Hall” and “Book Guest House”.
- **Calendar**: Color-coded dates — Green (available), Yellow (partially booked – Hall only), Red (booked).
- **Booking form**: Name, Designation, Email, Purpose; for Hall, slot selection (First Half / Second Half / Full Day) with conflict rules.
- **Admin** (requires MongoDB): Login with **email + password**. Dashboard with **date filter** and **separate tables for Hira Hall and Guest House**. Only the **super admin** (first admin, from env) can **add other admins**. **Approve** only when request date is **at least 7 days from today**; **Reject** anytime. On **approve**: acceptance email sent to applicant; on **reject**: rejection email sent.

## Admin

- **URL**: `/admin` (login), `/admin/dashboard` (after login).
- **First admin**: Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`. The first admin is created automatically and is the **super admin** (only they can add more admins).
- **Emails**: Set SMTP vars in `.env.local` (see `.env.example`) to send acceptance/rejection emails to applicants.

## Project Structure

```
app/
  page.tsx              # Landing
  book/hall/            # Hira Hall booking
  book/guest-house/     # Guest House booking
  admin/                # Admin login
  admin/dashboard/      # Pending requests table
  api/bookings/         # GET all, POST new
  api/bookings/[id]/    # PATCH approve/reject
  api/admin/login/      # POST login (email + password)
  api/admin/add/        # POST add admin (super admin only)
  lib/admins.ts         # Admin CRUD, super-admin seed
  lib/email.ts          # Acceptance/rejection emails (Nodemailer)
components/
  booking-calendar.tsx  # Calendar with availability
  booking-form.tsx       # Request form (Zod + RHF)
lib/
  booking-logic.ts      # Slots, conflicts, canApproveByDate
  validations.ts        # Zod schemas
  mongodb.ts            # MongoDB connection (cached)
  store-server.ts       # Bookings store (MongoDB or in-memory)
types/
  index.ts              # Booking, Slot, Status enums
```

## Rules (summary)

- **Hira Hall**: First Half, Second Half, or Full Day. Full Day blocks both halves; one half blocks the other and Full Day for that date.
- **Guest House**: Full Day only.
- **Admin**: Approve only when request date is at least 7 days from today.
