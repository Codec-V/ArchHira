import { NextRequest, NextResponse } from "next/server";
import { BookingType, RequestStatus, Slot } from "@/types";
import { anyBookingSchema } from "@/lib/validations";
import {
  getApprovedBookings,
  getHallDayState,
  getAvailableHallSlots,
  isGuestHouseRangeAvailable,
} from "@/lib/booking-logic";
import { getBookings, addBookingServer } from "@/lib/store-server";
import { findUserByEmail } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    // ✅ AUTH CHECK
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByEmail(token);
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // ✅ YOUR EXISTING LOGIC
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[API/bookings/GET] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTH CHECK
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByEmail(token);
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // ✅ YOUR EXISTING LOGIC (UNCHANGED)
    const bookings = await getBookings();
    const body = await request.json();
    const parsed = anyBookingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const data = parsed.data;

    if (data.type === BookingType.GUEST_HOUSE) {
      const approvedGuest = getApprovedBookings(bookings, BookingType.GUEST_HOUSE);
      const arrivalDate = (data as any).expectedArrival.slice(0, 10);
      const departureDate = (data as any).expectedDeparture.slice(0, 10);

      if (
        !isGuestHouseRangeAvailable(
          approvedGuest,
          arrivalDate,
          departureDate,
          (data as any).roomsRequested
        )
      ) {
        return NextResponse.json(
          { error: "Not enough rooms available for the selected dates." },
          { status: 409 }
        );
      }

      const newBooking: import("@/types").Booking = {
        id: crypto.randomUUID(),
        type: BookingType.GUEST_HOUSE,
        date: arrivalDate,
        slot: Slot.FULL_DAY,
        name: (data as any).requesterName,
        designation: (data as any).requesterDesignation,
        email: (data as any).requesterEmail,
        subject: `Guest House stay for ${(data as any).visitorName}`,
        purpose: (data as any).purpose,
        visitorName: (data as any).visitorName,
        visitorAddress: (data as any).visitorAddress,
        expectedArrival: (data as any).expectedArrival,
        expectedDeparture: (data as any).expectedDeparture,
        category: (data as any).category,
        roomsRequested: (data as any).roomsRequested,
        advancedPaymentDetails: (data as any).advancedPaymentDetails,
        paymentDriveLink: (data as any).paymentDriveLink,
        requesterDepartment: (data as any).requesterDepartment,
        requesterPhone: (data as any).requesterPhone,
        requestingBodyId: (data as any).requestingBodyId,
        status: RequestStatus.PENDING,
        createdAt: new Date().toISOString(),
      };
      
      await addBookingServer(newBooking);
      return NextResponse.json(newBooking, { status: 201 });
    }

    // Hall booking flow
    const {
      type,
      date,
      slot,
      name,
      designation,
      email,
      subject,
      purpose,
      department,
    } = data as any;

    const approvedForType = getApprovedBookings(bookings, type);
    const state = getHallDayState(approvedForType, date);
    const allowed = getAvailableHallSlots(state);
    
    if (!allowed.includes(slot)) {
      return NextResponse.json(
        { error: "Selected slot is no longer available for this date." },
        { status: 409 }
      );
    }

    const newBooking: import("@/types").Booking = {
      id: crypto.randomUUID(),
      type,
      date,
      slot,
      name,
      designation,
      email,
      subject,
      purpose,
      department,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    
    await addBookingServer(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("[API/bookings/POST] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
