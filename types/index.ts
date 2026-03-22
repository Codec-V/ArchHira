/**
 * Hira Hall & Guest House Booking System - Core Types
 */

export enum BookingType {
  HIRA_HALL = "HIRA_HALL",
  ARCHITECTURE_HALL = "ARCHITECTURE_HALL",
  GUEST_HOUSE = "GUEST_HOUSE",
}

/** Hira Hall has three slot options; Guest House only Full Day */
export enum Slot {
  FIRST_HALF = "FIRST_HALF",
  SECOND_HALF = "SECOND_HALF",
  FULL_DAY = "FULL_DAY",
}

export enum RequestStatus {
  /** Waiting for Faculty In‑charge (L1) decision. */
  PENDING = "PENDING",
  /** Fully approved / confirmed by Super Admin (L2). */
  APPROVED = "APPROVED",
  /** Rejected at either L1 or L2. */
  REJECTED = "REJECTED",
}

export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY_INCHARGE = "FACULTY_INCHARGE",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface Booking {
  id: string;
  type: BookingType;
  /**
   * Primary date for the booking (for calendars, filters, etc.).
   * For Guest House this will track the expected arrival date.
   */
  date: string; // ISO date YYYY-MM-DD
  /**
   * Time slot for hall bookings. Guest House always uses FULL_DAY internally.
   */
  slot: Slot;

  /** Legacy/general requester identity (used across all types). */
  name: string;
  designation: string;
  email: string;
  /** Short reason/subject line for the request. */
  subject: string;
  /** Detailed purpose or justification for the request. */
  purpose: string;

  /** Guest House–specific fields (optional for non-guest bookings). */
  // Visitor details
  visitorName?: string;
  visitorAddress?: string;

  // Stay timing (date-time strings, typically from <input type="datetime-local">)
  expectedArrival?: string; // ISO-like datetime
  expectedDeparture?: string; // ISO-like datetime

  // Category and room/payment info
  category?: "A" | "B" | "C" | "HALL";
  roomsRequested?: number; // 1–3
  advancedPaymentDetails?: string;
  paymentDriveLink?: string;

  // Requester details (more granular, in addition to name/designation/email)
  requesterDepartment?: string;
  requesterPhone?: string;
  department?: string; // Added department field

  /** Hierarchical approval: which requesting body owns this booking. */
  requestingBodyId?: string;

  /** L1 (Faculty In‑charge) approval metadata. */
  l1ApprovedByEmail?: string;
  l1ApprovedAt?: string;

  /** L2 (Main Admin) approval metadata. */
  l2ApprovedByEmail?: string;
  l2ApprovedAt?: string;

  status: RequestStatus;
  createdAt: string; // ISO datetime
  updatedAt?: string;
  reviewedBy?: string;
}

/** For display: date availability state */
export type DateAvailability = "available" | "booked" | "partial";

/** Hira Hall only: which halves are taken on a date */
export interface HallDayState {
  date: string;
  firstHalf: boolean;
  secondHalf: boolean;
  fullDay: boolean;
}
// ADD THIS to your existing types/index.ts

/**
 * User authentication interface
 */
export interface User {
  email: string;
  password: string; // hashed
  name?: string;
  role?: UserRole; // STUDENT | FACULTY_INCHARGE | SUPER_ADMIN
  isVerified: boolean;
  createdAt: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

// ✅ FIXED: CreateUserInput type for registration
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

// Keep all your existing types unchanged 👇


// ... rest of your existing types remain EXACTLY same
