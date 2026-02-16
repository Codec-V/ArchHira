import { NextRequest, NextResponse } from "next/server";
import { BookingType, RequestStatus, Slot } from "@/types";
import { bookingRequestSchemaRefined } from "@/lib/validations";
import {
  getApprovedBookings,
  getHallDayState,
  getAvailableHallSlots,
  isGuestHouseDateAvailable,
} from "@/lib/booking-logic";
import { getBookings, addBookingServer } from "@/lib/store-server";

export async function GET() {
  const bookings = await getBookings();
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const bookings = await getBookings();
  const body = await request.json();
  const parsed = bookingRequestSchemaRefined.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, date, slot, name, designation, email, purpose } = parsed.data;

  const approvedHall = getApprovedBookings(bookings, BookingType.HIRA_HALL);
  const approvedGuest = getApprovedBookings(bookings, BookingType.GUEST_HOUSE);

  if (type === BookingType.HIRA_HALL) {
    const state = getHallDayState(approvedHall, date);
    const allowed = getAvailableHallSlots(state);
    if (!allowed.includes(slot)) {
      return NextResponse.json(
        { error: "Selected slot is no longer available for this date." },
        { status: 409 }
      );
    }
  } else {
    if (slot !== Slot.FULL_DAY) {
      return NextResponse.json(
        { error: "Guest House allows Full Day only." },
        { status: 400 }
      );
    }
    if (!isGuestHouseDateAvailable(approvedGuest, date)) {
      return NextResponse.json(
        { error: "This date is already booked for Guest House." },
        { status: 409 }
      );
    }
  }

  const newBooking: import("@/types").Booking = {
    id: crypto.randomUUID(),
    type,
    date,
    slot,
    name,
    designation,
    email,
    purpose,
    status: RequestStatus.PENDING,
    createdAt: new Date().toISOString(),
  };
  await addBookingServer(newBooking);
  return NextResponse.json(newBooking, { status: 201 });
}
