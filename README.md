---

## 🏷️ Finding Issues to Contribute

### Labels Guide

Look for these GitHub issue labels to find work:

**Difficulty Levels:**
- 🟢 `good-first-issue` — Perfect for junior devs and first-time contributors
- 🟡 `help-wanted` — Needs core team input
- 🔴 `p0-critical` — High priority, urgent fixes

**By Category:**
- `backend` — API routes, MongoDB schemas, Server Actions
- `frontend` — Next.js UI, Tailwind, Calendar logic
- `feature` — New facilities (e.g., Golden Tower)

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React, [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Lucide React](https://lucide.dev/), [react-day-picker](https://react-day-picker.js.org/)
- **State & Validation:** [Zod](https://zod.dev/), [react-hook-form](https://react-hook-form.com/)
- **Backend/API:** Next.js Route Handlers (POST/GET architecture)
- **Database:** [MongoDB](https://www.mongodb.com/) (with in-memory fallback)

---

## 🏗️ Architecture Highlights

### Real-Time Availability Engine
The `booking-calendar.tsx` dynamically calculates available states by fetching confirmed bookings. It utilizes a `date-fns` integration to block out slots based on the `booking-logic.ts` ruleset (e.g., a First Half booking instantly turns the day 'Yellow' and disables the 'Full Day' selection).

### Request Architecture
To maintain high performance and prevent UI frame/state clearing issues, client-server communication strictly utilizes standard asynchronous POST and GET requests instead of persistent WebSocket connections. 

### Admin Rules Pipeline
The system hardcodes operational policies into the `api/bookings/[id]` route. Specifically, the `canApproveByDate` utility enforces the 7-day minimum buffer, actively preventing admins from approving last-minute requests.

---

## 🤝 Contributing

We welcome contributions from the TCP team and the wider campus developer community! 

### How to Contribute

1. **Fork & Clone**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ArchHira.git](https://github.com/YOUR_USERNAME/ArchHira.git)
   cd ArchHira
Create a Feature Branch

Bash
git checkout -b feature/golden-tower-integration
Make Your Changes

Reuse existing schemas where possible.

Maintain the Tailwind design language.

Commit & Push

Bash
git commit -m "feat: add golden tower facility to booking options"
git push origin feature/golden-tower-integration
Create a Pull Request via the GitHub UI.

🎯 Roadmap
Phase 1 & 2: Core Engine ✅
[x] Initial Next.js structure

[x] Calendar and conflict logic

[x] Guest house and Hira Hall forms

[x] API Routes (POST/GET)

Phase 3: Admin Automation ✅
[x] Super admin seeding

[x] Dashboard with date filters

[x] 7-day approval rule engine

[x] Automated Nodemailer responses

Phase 4: Facility Expansion 🟡
[ ] Add "Golden Tower" database schema

[ ] Implement UI toggle for facility selection

[ ] Extend real-time calendar logic for Golden Tower

[ ] E2E testing for multi-facility booking flows

The modern booking engine for Hira Hall and Campus Guest Houses — A unified platform with real-time conflict validation and automated admin workflows.

📖 About
ArchHira is a streamlined campus management platform built to handle the complex booking logic of institutional facilities.

Instead of relying on manual ledgers and fragmented communication, ArchHira provides a centralized booking infrastructure, handling real-time availability, strict booking rules (half-day vs. full-day conflicts), and an automated administrative approval pipeline.

Key Problems Solved
Booking Conflicts — Automated slot validation prevents double-booking of Hira Hall and Guest Houses.

Manual Approvals — System enforces a strict 7-day minimum lead time for admin approvals and automates acceptance/rejection emails.

Availability Tracking — Real-time, color-coded calendar interface replacing static spreadsheets.

Data Standardization — Enforced collection of vital data, including mandatory visitor postal details.

Who Is This For?
Campus Staff & Faculty — Streamlined interface for requesting facility access.

Institute Administrators — Dedicated dashboard for reviewing, filtering, and managing requests.

TCP Developers — Clean, modular Next.js architecture tailored for easy contributions and scaling.

✨ Features
Phase 1: Foundation ✅
✅ Next.js App Router — Modern, server-rendered React architecture.

✅ Global Storage — MongoDB integration with a seamless in-memory fallback.

✅ Schema Validation — Strict request parsing using Zod and react-hook-form.

Phase 2: Booking Engine ✅
✅ Real-Time Calendar — Dynamic availability UI (Green: Available, Yellow: Partially Booked, Red: Full).

✅ Advanced Conflict Logic — Hira Hall (First Half / Second Half / Full Day) slot collision prevention.

✅ Guest House Flow — Full-day booking logic with mandatory visitor postal details integration.

✅ Optimized Networking — Standard POST/GET API request architecture for high-performance state syncing.

Phase 3: Admin & Operations ✅
✅ RBAC (Role-Based Access Control) — Super-admin seeding and standard admin provisioning.

✅ Dashboard Filters — Separate, filterable data tables for Hira Hall and Guest House requests.

✅ Rule Engine — Admins restricted to approving requests only if the date is ≥ 7 days from today.

✅ Automated Comms — Nodemailer integration for automated acceptance and rejection emails.

Phase 4: Facility Expansion (Current) 🟡
🟡 Golden Tower Integration — Extending the guest house schema to support the new Golden Tower facility.

📋 Multi-Facility Analytics — Usage stats across all venues.

🚀 Quick Start
Prerequisites
Node.js v18.0.0 or higher

npm

Git

Installation
Bash
# Clone the repository
git clone [https://github.com/NITRR-Official/ArchHira](https://github.com/NITRR-Official/ArchHira)
cd ArchHira

# Install dependencies
npm install
Configuration
ArchHira can run with in-memory storage for rapid UI development, but requires MongoDB for full admin features and data persistence.

Create a .env.local in the project root:

Code snippet
# MongoDB (global storage)
MONGODB_URI=mongodb://localhost:27017
# Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=hira-hall

# Super Admin Seeding
ADMIN_EMAIL=admin2@gmail.com
ADMIN_PASSWORD=admin123

# SMTP Email Configuration (for acceptance/rejection notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
Running the Project
Bash
npm run dev
Public Booking Interface: http://localhost:3000

Admin Dashboard: http://localhost:3000/admin

📚 Project Structure
ArchHira follows a structured App Router pattern:

Plaintext
app/
  page.tsx              # Landing (Glassmorphism facility selection)
  book/hall/            # Hira Hall booking flow
  book/guest-house/     # Guest House booking flow
  admin/                # Admin login
  admin/dashboard/      # Pending requests tables & management
  api/bookings/         # GET all, POST new
  api/bookings/[id]/    # PATCH approve/reject
  api/admin/login/      # POST login (email + password)
  api/admin/add/        # POST add admin (super admin only)
components/
  booking-calendar.tsx  # Calendar with availability states
  booking-form.tsx      # Request form (Zod + RHF)
lib/
  booking-logic.ts      # Slots, conflicts, canApproveByDate
  validations.ts        # Zod schemas (incl. visitor postal details)
  mongodb.ts            # MongoDB connection (cached)
  store-server.ts       # Bookings store (MongoDB or in-memory)
  admins.ts             # Admin CRUD, super-admin seed
  email.ts              # Notifications (Nodemailer)
types/
  index.ts              # Booking, Slot, Status enums
🏷️ Finding Issues to Contribute
Labels Guide
Look for these GitHub issue labels to find work:

Difficulty Levels:

🟢 good-first-issue — Perfect for junior devs and first-time contributors

🟡 help-wanted — Needs core team input

🔴 p0-critical — High priority, urgent fixes

By Category:

backend — API routes, MongoDB schemas, Server Actions

frontend — Next.js UI, Tailwind, Calendar logic

feature — New facilities (e.g., Golden Tower)

🛠️ Tech Stack
Frontend: Next.js 15 (App Router), React, Tailwind CSS

UI Components: Lucide React, react-day-picker

State & Validation: Zod, react-hook-form

Backend/API: Next.js Route Handlers (POST/GET architecture)

Database: MongoDB (with in-memory fallback)

🏗️ Architecture Highlights
Real-Time Availability Engine
The booking-calendar.tsx dynamically calculates available states by fetching confirmed bookings. It utilizes a date-fns integration to block out slots based on the booking-logic.ts ruleset (e.g., a First Half booking instantly turns the day 'Yellow' and disables the 'Full Day' selection).

Request Architecture
To maintain high performance and prevent UI frame/state clearing issues, client-server communication strictly utilizes standard asynchronous POST and GET requests instead of persistent WebSocket connections.

Admin Rules Pipeline
The system hardcodes operational policies into the api/bookings/[id] route. Specifically, the canApproveByDate utility enforces the 7-day minimum buffer, actively preventing admins from approving last-minute requests.

🤝 Contributing
We welcome contributions from the TCP team and the wider campus developer community!

How to Contribute
Fork & Clone

Bash
git clone [https://github.com/YOUR_USERNAME/ArchHira.git](https://github.com/YOUR_USERNAME/ArchHira.git)
cd ArchHira
Create a Feature Branch

Bash
git checkout -b feature/golden-tower-integration
Make Your Changes

Reuse existing schemas where possible.

Maintain the Tailwind design language.

Commit & Push

Bash
git commit -m "feat: add golden tower facility to booking options"
git push origin feature/golden-tower-integration
Create a Pull Request via the GitHub UI.

🎯 Roadmap
Phase 1 & 2: Core Engine ✅
[x] Initial Next.js structure

[x] Calendar and conflict logic

[x] Guest house and Hira Hall forms

[x] API Routes (POST/GET)

Phase 3: Admin Automation ✅
[x] Super admin seeding

[x] Dashboard with date filters

[x] 7-day approval rule engine

[x] Automated Nodemailer responses

Phase 4: Facility Expansion 🟡
[ ] Add "Golden Tower" database schema

[ ] Implement UI toggle for facility selection

[ ] Extend real-time calendar logic for Golden Tower

[ ] E2E testing for multi-facility booking flows
