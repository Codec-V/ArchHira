# 🧠 Copilot System Context — ArchHira

## 🎯 Project Overview

ArchHira is a centralized, Next.js-based booking engine designed to manage campus facility reservations, specifically for:
* Hira Hall (Half-day / Full-day slots)
* Campus Guest Houses (Full-day slots)
* Golden Tower (Upcoming integration)

The system is built using:
* Framework: Next.js 15 (App Router)
* UI/Styling: React, Tailwind CSS, Lucide React, react-day-picker
* Validation: Zod, react-hook-form
* Database: MongoDB (with an in-memory fallback for local UI dev)
* Notifications: Nodemailer (SMTP)

---

## 🧩 Architecture Principles

1. **Unified Codebase:** Frontend pages and backend API routes live in the same Next.js App Router structure.
2. **Strict Request Architecture:** Client-server communication strictly utilizes standard asynchronous POST and GET requests. **Do NOT use WebSockets.**
3. **Validation First:** All incoming data (API requests) and outgoing data (forms) must be strictly typed and validated using Zod schemas.
4. **Centralized Logic:** Core business logic (like conflict resolution and date validation) must live in the `lib/` directory, never directly inside UI components.

---

## 📁 Folder Structure Rules

* `/app/` → Next.js pages (UI) and layout files.
* `/app/api/` → Backend Route Handlers (GET/POST/PATCH).
* `/components/` → Reusable UI components (e.g., forms, calendar).
* `/lib/` → Business logic, Zod schemas, DB connections, emailers.
* `/types/` → Shared TypeScript interfaces and enums.

---

## 🔌 API & Booking Rules

When generating code for booking logic, adhere to these hardcoded rules:
* **Hira Hall Conflicts:** Full Day blocks both halves. One half blocks the other and Full Day.
* **Guest Houses/Golden Tower:** Strictly Full Day bookings only. Require visitor postal details.
* **Admin Pipeline:** Admins can only approve requests if the requested date is **≥ 7 days from today** (`canApproveByDate` logic).

---

## 🚫 Constraints

* **Do NOT over-engineer:** Keep API routes and components as simple as possible.
* **Do NOT introduce WebSockets:** Stick to standard HTTP requests to prevent UI frame/state clearing issues.
* **Do NOT bypass Zod:** Every API route must parse the request body with a Zod schema before executing logic.
* **Do NOT use random UI libraries:** Stick to Tailwind CSS and existing project dependencies.

---

## ✅ Coding Guidelines

### Backend (Next.js API Routes)
* Use standard Next.js `NextRequest` and `NextResponse`.
* Ensure database connections utilize the cached `lib/mongodb.ts` connection string to prevent connection pooling limits.
* Keep API controllers thin; defer complex conflict logic to `lib/booking-logic.ts`.

### Package Management
* **Install packages via npm only**:
  * `npm install <package-name>`
* **DO NOT directly edit package.json** for version management.
* All new package decisions must be justified to the core team.

### Frontend (Next.js Pages & Components)
* Strictly use `react-hook-form` paired with `@hookform/resolvers/zod` for all form handling.
* Maintain the glassmorphism design aesthetic using Tailwind utility classes.
* Render interactive components (like calendars) clearly using client boundaries (`"use client"`).

---

## 🔄 Development Workflow

When implementing a feature (e.g., adding Golden Tower):
1. Understand requirement from GitHub Issues / TCP Team.
2. Define/Update Types in `/types/`.
3. Update Zod Schemas in `/lib/validations.ts`.
4. Update Business Logic in `/lib/booking-logic.ts`.
5. Implement Backend Route Handlers (`/app/api/`).
6. Implement Frontend UI (`/components/` and `/app/`).
7. Test end-to-end flow.

---

## 🧾 Output Expectations

When generating code:
* Always write strict TypeScript (`any` is forbidden unless absolutely necessary).
* Use clear, descriptive variable naming conventions.
* Add JSDoc comments for complex business logic in the `lib/` folder.
* Ensure UI components are responsive by default using Tailwind breakpoints.

---

## 🎯 Goal

Build a conflict-free, high-performance, and easily maintainable booking engine for the campus ecosystem, setting a standard for TCP development.
