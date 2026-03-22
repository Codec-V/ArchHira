/**
 * Core booking logic: conflict validation and slot availability for Hira Hall & Guest House.
 */

import { Booking, BookingType, Slot, RequestStatus } from "@/types";
import {
  addDays,
  eachDayOfInterval,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";

/** Minimum days from today for admin to approve a request */
export const MIN_DAYS_FOR_APPROVAL = 7;

/**
 * Get all APPROVED bookings for a given type (and optionally date).
 * In real app this would query DB; here we accept a list.
 */
export function getApprovedBookings(
  allBookings: Booking[],
  type: BookingType,
  date?: string
): Booking[] {
  return allBookings.filter((b) => {
    if (b.type !== type || b.status !== RequestStatus.APPROVED) return false;
    if (date && b.date !== date) return false;
    return true;
  });
}

// Add to booking-logic.ts
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric'
  });
}

/**
 * For Hira Hall: compute which slots are taken on a given date.
 * - Full Day booking → firstHalf, secondHalf, fullDay all true.
 * - First Half → firstHalf true.
 * - Second Half → secondHalf true.
 */
export function getHallDayState(
  approvedHallBookings: Booking[],
  date: string
): { firstHalf: boolean; secondHalf: boolean; fullDay: boolean } {
  const onDate = approvedHallBookings.filter((b) => b.date === date);
  let firstHalf = false;
  let secondHalf = false;
  let fullDay = false;
  for (const b of onDate) {
    if (b.slot === Slot.FULL_DAY) {
      fullDay = true;
      firstHalf = true;
      secondHalf = true;
    } else if (b.slot === Slot.FIRST_HALF) firstHalf = true;
    else if (b.slot === Slot.SECOND_HALF) secondHalf = true;
  }
  return { firstHalf, secondHalf, fullDay };
}

/**
 * For Hira Hall on a date:
 * - If Full Day is booked → no slot available (all disabled).
 * - If First Half is booked → only Second Half available; Full Day is unavailable.
 * - If Second Half is booked → only First Half available; Full Day is unavailable.
 * - If both halves are booked (or full day) → no slot available.
 */
export function getAvailableHallSlots(
  hallDayState: { firstHalf: boolean; secondHalf: boolean; fullDay: boolean }
): Slot[] {
  if (hallDayState.fullDay) return [];
  const available: Slot[] = [];
  if (!hallDayState.firstHalf) available.push(Slot.FIRST_HALF);
  if (!hallDayState.secondHalf) available.push(Slot.SECOND_HALF);
  // Full Day only if both halves are free
  if (!hallDayState.firstHalf && !hallDayState.secondHalf) {
    available.push(Slot.FULL_DAY);
  }
  return available;
}

/**
 * Guest House room logic
 * ----------------------
 * Guest House has 3 rooms total. Each booking reserves `roomsRequested` rooms
 * for every night between expectedArrival and expectedDeparture (exclusive of
 * the departure day). Legacy bookings without timing/roomsRequested are treated
 * as 1 room for their single `date`.
 */

const GUEST_HOUSE_TOTAL_ROOMS = 3;

function getGuestHouseStayDates(b: Booking): string[] {
  if (b.expectedArrival && b.expectedDeparture) {
    const start = startOfDay(parseISO(b.expectedArrival));
    const endExcl = addDays(startOfDay(parseISO(b.expectedDeparture)), -1);
    if (isBefore(endExcl, start)) return [];
    const days = eachDayOfInterval({ start, end: endExcl });
    return days.map((d) => d.toISOString().slice(0, 10));
  }
  // Legacy: single-day stay on `date`
  return [b.date];
}

export function getGuestHouseRoomsBookedForDate(
  approvedGuestHouseBookings: Booking[],
  date: string
): number {
  let booked = 0;
  for (const b of approvedGuestHouseBookings) {
    const dates = getGuestHouseStayDates(b);
    if (dates.includes(date)) {
      booked += b.roomsRequested ?? 1;
    }
  }
  return booked;
}

export function getGuestHouseRoomsLeftForDate(
  approvedGuestHouseBookings: Booking[],
  date: string
): number {
  const used = getGuestHouseRoomsBookedForDate(approvedGuestHouseBookings, date);
  return Math.max(0, GUEST_HOUSE_TOTAL_ROOMS - used);
}

export function isGuestHouseRangeAvailable(
  approvedGuestHouseBookings: Booking[],
  arrivalDate: string,
  departureDate: string,
  roomsRequested: number
): boolean {
  const start = startOfDay(parseISO(arrivalDate));
  const endExcl = addDays(startOfDay(parseISO(departureDate)), -1);
  if (isBefore(endExcl, start)) return false;
  const intervalDays = eachDayOfInterval({ start, end: endExcl });
  for (const d of intervalDays) {
    const dateStr = d.toISOString().slice(0, 10);
    const left = getGuestHouseRoomsLeftForDate(approvedGuestHouseBookings, dateStr);
    if (left < roomsRequested) return false;
  }
  return true;
}

/**
 * Calendar: get availability state for a date.
 * - Hira Hall: "available" | "partial" | "booked"
 * - Guest House: "available" | "booked"
 */
export function getHiraHallDateAvailability(
  hallDayState: { firstHalf: boolean; secondHalf: boolean; fullDay: boolean }
): "available" | "partial" | "booked" {
  if (hallDayState.fullDay || (hallDayState.firstHalf && hallDayState.secondHalf))
    return "booked";
  if (hallDayState.firstHalf || hallDayState.secondHalf) return "partial";
  return "available";
}

export function getGuestHouseDateAvailability(
  approvedGuestHouseBookings: Booking[],
  date: string
): "available" | "booked" {
  const left = getGuestHouseRoomsLeftForDate(approvedGuestHouseBookings, date);
  return left > 0 ? "available" : "booked";
}

/**
 * Check if the requested date is at least MIN_DAYS_FOR_APPROVAL days after today.
 */
export function canApproveByDate(requestDate: string): boolean {
  const today = startOfDay(new Date());
  const requested = startOfDay(parseISO(requestDate));
  const minDate = addDays(today, MIN_DAYS_FOR_APPROVAL);
  return !isBefore(requested, minDate) || requested.getTime() === minDate.getTime();
}

/**
 * Validate that the chosen slot is allowed for the given booking type and date state.
 */
export function isSlotAllowed(
  type: BookingType,
  slot: Slot,
  hallDayState?: { firstHalf: boolean; secondHalf: boolean; fullDay: boolean }
): boolean {
  if (type === BookingType.GUEST_HOUSE) {
    return slot === Slot.FULL_DAY;
  }
  const isHallType =
    type === BookingType.HIRA_HALL || type === BookingType.ARCHITECTURE_HALL;
  if (isHallType && hallDayState) {
    const available = getAvailableHallSlots(hallDayState);
    return available.includes(slot);
  }
  return isHallType;
}
