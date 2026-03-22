/**
 * In-memory store for bookings and admin auth. Replace with Supabase/API later.
 */

import { Booking, RequestStatus } from "@/types";

const STORAGE_KEY_BOOKINGS = "hira-hall-bookings";
const STORAGE_KEY_ADMIN = "hira-hall-admin-seen";

function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
}

/** Server-side / API route: use a simple in-memory store (no persistence across server restarts). */
const serverBookings: Booking[] = [];

export function getAllBookings(useServer: boolean = false): Booking[] {
  if (useServer || typeof window === "undefined") {
    return [...serverBookings];
  }
  return loadBookings();
}

export function addBooking(booking: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const newBooking: Booking = {
    ...booking,
    id: crypto.randomUUID(),
    status: RequestStatus.PENDING_FACULTY,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    const list = loadBookings();
    list.push(newBooking);
    saveBookings(list);
  } else {
    serverBookings.push(newBooking);
  }
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: RequestStatus.APPROVED | RequestStatus.REJECTED,
  reviewedBy?: string
): Booking | null {
  if (typeof window !== "undefined") {
    const list = loadBookings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    if (reviewedBy) list[idx].reviewedBy = reviewedBy;
    saveBookings(list);
    return list[idx];
  }
  const idx = serverBookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  serverBookings[idx].status = status;
  serverBookings[idx].updatedAt = new Date().toISOString();
  if (reviewedBy) serverBookings[idx].reviewedBy = reviewedBy;
  return serverBookings[idx];
}

export function getBookingById(id: string, useServer: boolean = false): Booking | null {
  const list = getAllBookings(useServer);
  return list.find((b) => b.id === id) ?? null;
}

/** Simple admin "login": store that we've authenticated (no real auth for demo). */
const ADMIN_PASSWORD = "admin123"; // Replace with env in production

export function verifyAdmin(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY_ADMIN, "true");
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY_ADMIN);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY_ADMIN) === "true";
}
