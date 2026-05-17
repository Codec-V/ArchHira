# ArchHira Testing Suite Documentation

## Overview

This document captures the testing strategy for ArchHira, including current coverage status, target test suites, execution commands, and next steps to reach production-grade confidence.

## Current Status

- **Automated unit/integration test files:** Not yet present in the repository
- **Current validation scripts available:**
  - `npm run lint`
  - `npm run build`
- **Baseline note:** Existing lint/build failures are currently unrelated to this documentation.

---

## Application Areas Requiring Test Coverage

## 1) Authentication Module

**Source areas**

- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/verify-otp/route.ts`
- `app/api/auth/resend-otp/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/logout/route.ts`
- `lib/auth.ts`

**Core behaviors to test**

- Registration validation and user creation
- OTP generation, resend, verify, expiry, and invalid OTP rejection
- Login flow and session cookie behavior
- Password reset OTP flow and password update constraints
- Session lookup and logout correctness

## 2) Booking Module

**Source areas**

- `app/api/bookings/route.ts`
- `app/api/bookings/[id]/route.ts`
- `lib/booking-logic.ts`
- `lib/store-server.ts`
- `lib/validations.ts`

**Core behaviors to test**

- Hall slot conflict rules (`FIRST_HALF`, `SECOND_HALF`, `FULL_DAY`)
- Guest house room availability across date ranges
- Booking CRUD lifecycle and status transitions
- Approval rule enforcement (minimum 7-day rule)
- Protected route access behavior for authenticated/unauthenticated users

## 3) Admin Module

**Source areas**

- `app/api/admin/login/route.ts`
- `app/api/admin/add/route.ts`
- `lib/admins.ts`

**Core behaviors to test**

- Admin login success/failure
- Super-admin-only add-admin path
- Duplicate admin prevention
- First-super-admin seed logic from env configuration

## 4) UI and Form Layer

**Source areas**

- `components/booking-calendar.tsx`
- `components/booking-form.tsx`
- `components/guest-house-booking-form.tsx`
- `app/book/hall/page.tsx`
- `app/book/architecture-hall/page.tsx`
- `app/book/guest-house/page.tsx`
- `app/admin/dashboard/page.tsx`

**Core behaviors to test**

- Date/slot selection and disabled-state behavior
- Form validation and error rendering
- Auth-guard redirects and loading states
- Submission success/error handling
- Admin action flows (approve/reject/delete/add-admin)

---

## Recommended Test Suite Layout

```text
ArchHira/
├── app/api/auth/__tests__/
│   ├── register.route.test.ts
│   ├── login.route.test.ts
│   ├── verify-otp.route.test.ts
│   └── reset-password.route.test.ts
├── app/api/bookings/__tests__/
│   ├── bookings.route.test.ts
│   └── booking-by-id.route.test.ts
├── app/api/admin/__tests__/
│   ├── login.route.test.ts
│   └── add.route.test.ts
├── lib/__tests__/
│   ├── booking-logic.test.ts
│   ├── auth.test.ts
│   ├── admins.test.ts
│   └── validations.test.ts
└── components/__tests__/
    ├── booking-form.test.tsx
    ├── guest-house-booking-form.test.tsx
    └── booking-calendar.test.tsx
```

---

## Running Validation and Tests

## Current Commands (Implemented)

```bash
npm run lint
npm run build
```

## Suggested Future Commands (After Test Setup)

```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## Testing Patterns and Best Practices

1. **Service/logic isolation**
   - Unit-test `lib/booking-logic.ts`, `lib/auth.ts`, and `lib/admins.ts` independently from UI.

2. **Route contract coverage**
   - For each API route, test success and failure paths, status codes, and response payload shape.

3. **Validation-first testing**
   - Cover both valid payloads and schema failures from `lib/validations.ts`.

4. **State integrity checks**
   - Verify booking status changes, room availability updates, and approval constraints after each mutation.

5. **Boundary and abuse cases**
   - Invalid dates, over-capacity room requests, repeated OTP attempts, and unauthorized access.

---

## Coverage Goals

- **Unit coverage:** business logic and validation helpers
- **Route coverage:** all handlers under `app/api/**`
- **UI coverage:** critical booking and admin flows
- **Regression coverage:** key edge cases around conflicts, approval rules, and OTP lifecycle

---

## Next Steps

## Immediate

1. Add a test runner stack (Vitest + Testing Library + route test harness)
2. Add `test`, `test:watch`, and `test:coverage` scripts in `package.json`
3. Create first-pass unit tests for `lib/booking-logic.ts` and `lib/validations.ts`

## Near Term

1. Add route integration tests for Auth, Bookings, and Admin handlers
2. Add component tests for booking forms and calendar interaction
3. Integrate tests in CI (GitHub Actions)

## Medium Term

1. Introduce end-to-end smoke tests for complete booking and admin flows
2. Add test data factories and reusable fixtures
3. Track coverage thresholds and enforce quality gates

---

## Troubleshooting Notes

## Environment/Dependency Issues

- If `next` is missing during scripts, install dependencies first:

```bash
npm ci
```

## Lint/Build Baseline Failures

- Existing known baseline issues may fail lint/build until fixed:
  - `app/page.tsx`: unescaped apostrophe rule
  - `lib/mongodb.ts`: unused eslint-disable directive warning

---

## Validation Checklist (Current vs Target)

- [x] Scope mapping completed for Auth, Booking, Admin, and UI layers
- [x] Testing strategy documented for all critical modules
- [ ] Automated unit tests implemented
- [ ] Route integration tests implemented
- [ ] Component tests implemented
- [ ] CI test execution enabled
- [ ] Coverage reports generated

---

Created: May 17, 2026  
Status: 📋 DOCUMENTED (Implementation Pending)  
Next Milestone: Introduce automated test suites and CI coverage gates
