# ArchHira

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

The operating platform for **Architecture Department venue booking workflows** — designed to manage authentication, booking, approvals, and admin operations in one system.

## 📖 About

ArchHira is a Next.js-based booking and operations platform for:

- **Hira Hall** bookings
- **Architecture Hall** bookings
- **Guest House** bookings (date-range and room-capacity flow)

It replaces fragmented manual processes with a unified system including OTP-based auth, conflict-aware booking, admin approval workflows, and email notifications.

## Key Problems Solved

- **Scheduling conflicts** — Slot/date conflict checks for halls and guest-house capacity logic
- **Manual approval overhead** — Structured admin dashboard for review and status updates
- **Authentication friction** — OTP-assisted login and password reset flows
- **Data inconsistency** — Centralized booking state with MongoDB persistence option
- **Operational visibility gap** — Dedicated admin views and booking detail workflows

## Who Is This For?

- **Faculty/Staff/Student organizers** requesting halls and guest-house stays
- **Department admins** managing approvals and rejections
- **System maintainers** extending booking, auth, and workflow capabilities

## ✨ Features

### Authentication & Session Layer ✅

- User registration with hashed passwords
- OTP-based login verification
- OTP resend and password-reset via OTP
- Session check (`/api/auth/me`) and logout flow

### Booking Engine ✅

- Multi-venue support: `HIRA_HALL`, `ARCHITECTURE_HALL`, `GUEST_HOUSE`
- Slot system for halls: `FIRST_HALF`, `SECOND_HALF`, `FULL_DAY`
- Guest-house date-range and room availability checks
- Booking lifecycle: `PENDING`, `APPROVED`, `REJECTED`
- Approval date policy enforcement (minimum 7-day lead time)

### Admin Operations ✅

- Admin login endpoint and admin dashboard
- Super-admin-only add-admin capability
- First super admin seeded via environment variables
- Approval/rejection email notifications

### Testing & Quality 🟡

- Validation scripts available (`npm run lint`, `npm run build`)
- Detailed testing strategy and status documentation present
- Automated unit/integration test suites documented but not yet implemented

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Configure Environment

Create `.env.local` from `.env.example`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
# MONGODB_DB_NAME=hira-hall

# First admin (super admin)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# Optional SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@yourdomain.com
```

### Run the Project

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## 🔐 Access Model

- Public auth endpoints: register/login/verify/resend/forgot/reset
- Authenticated user required: booking APIs, `/api/auth/me`, `/api/auth/logout`
- MongoDB required: admin APIs (`/api/admin/login`, `/api/admin/add`)
- Super-admin restriction: only super admin can add additional admins

## 🛠️ Tech Stack

- **Frontend/Server**: Next.js 15 (App Router), React 19, TypeScript
- **Validation & Forms**: Zod, react-hook-form, @hookform/resolvers
- **UI/Date**: Tailwind CSS, Lucide React, react-day-picker, date-fns
- **Data**: MongoDB (with in-memory fallback for bookings where applicable)
- **Email**: Nodemailer

## 🏗️ Architecture Highlights

### Layered Design

- **API Layer**: App Router handlers under `app/api/**`
- **Business Logic Layer**: conflict and rule enforcement in `lib/booking-logic.ts`
- **Validation Layer**: shared Zod schemas in `lib/validations.ts`
- **Persistence Layer**: MongoDB-backed auth/admin; bookings via store abstraction

### Core Modules

- **Auth Module** — OTP lifecycle, password reset, session flows
- **Bookings Module** — create/list/update/delete + conflict checks
- **Admin Module** — login + super-admin-controlled admin provisioning

## 📁 Project Structure

```text
app/
  api/auth/*                  # Register/login/OTP/password reset/session/logout
  api/bookings/route.ts       # List/create bookings
  api/bookings/[id]/route.ts  # CRUD and status updates by ID
  api/admin/login/route.ts    # Admin login
  api/admin/add/route.ts      # Add admin (super admin only)
  page.tsx                    # Auth entry
  dashboard/page.tsx          # Main user dashboard
  book/hall/page.tsx
  book/architecture-hall/page.tsx
  book/guest-house/page.tsx
  admin/page.tsx
  admin/dashboard/page.tsx
  admin/booking/[id]/page.tsx

components/
  booking-calendar.tsx
  booking-form.tsx
  guest-house-booking-form.tsx
  LogoutButton.tsx

lib/
  auth.ts
  admins.ts
  booking-logic.ts
  store-server.ts
  mongodb.ts
  validations.ts
  email.ts
```

## ✅ Validation Commands

Run from repository root:

```bash
npm run lint
npm run build
```

## 📚 Documentation

- [MongoDB Setup Guide](docs/MONGODB_SETUP.md)
- [MongoDB Migration Guide](docs/MONGODB_MIGRATION.md)
- [API Reference](docs/API_REFERENCE.md)
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)
- [Testing Suite Documentation](docs/TESTING.md)
- [Testing Status Report](docs/TEST_RESULTS.md)

## 🎯 Roadmap Snapshot

- ✅ Authentication + OTP flows
- ✅ Multi-venue booking APIs and UI
- ✅ Admin dashboard and approval lifecycle
- 🟡 Automated test suite implementation and CI hardening
- 📋 Session hardening, rate-limiting, and operational observability improvements

## 🤝 Contributing

Contributions are welcome. Please keep changes aligned with:

- Existing module boundaries (`auth`, `bookings`, `admin`)
- Shared validation and typing patterns
- Root validation checks (`npm run lint`, `npm run build`)
- Documentation updates for behavior changes
