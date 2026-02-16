/**
 * Hira Hall & Guest House Booking System - Core Types
 */

export enum BookingType {
  HIRA_HALL = "HIRA_HALL",
  GUEST_HOUSE = "GUEST_HOUSE",
}

/** Hira Hall has three slot options; Guest House only Full Day */
export enum Slot {
  FIRST_HALF = "FIRST_HALF",
  SECOND_HALF = "SECOND_HALF",
  FULL_DAY = "FULL_DAY",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Booking {
  id: string;
  type: BookingType;
  date: string; // ISO date YYYY-MM-DD
  slot: Slot;
  name: string;
  designation: string;
  email: string;
  purpose: string;
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
