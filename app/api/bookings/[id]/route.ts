import { NextRequest, NextResponse } from "next/server";
import { RequestStatus } from "@/types";
import { canApproveByDate } from "@/lib/booking-logic";
import { 
  getBookings, 
  updateBookingById, 
  createBooking, 
  deleteBookingById,
  getBookingById 
} from "@/lib/store-server";
import { sendAcceptanceEmail, sendRejectionEmail } from "@/lib/email";
import { findUserByEmail } from "@/lib/auth";

// ✅ SHARED AUTH HELPER
async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(token);
  if (!user || !user.isVerified) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return { user, ok: true };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    // ✅ AUTH CHECK
    const auth = await requireAuth(request);
    if (!auth.ok) return auth;

    const { id } = await params;
    
    if (id) {
      const bookings = await getBookings();
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json(booking);
    }
    
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[API/bookings/[id]/GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTH CHECK
    const auth = await requireAuth(request);
    if (!auth.ok) return auth;

    const body = await request.json();
    
    const { 
      visitorName, 
      visitorAddress, 
      expectedArrival, 
      expectedDeparture, 
      category, 
      roomsRequested, 
      purpose,
      requesterName,
      requesterEmail,
      type = "GUEST_HOUSE"
    } = body;

    if (!visitorName || !visitorAddress || !expectedArrival || !expectedDeparture) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBooking = await createBooking(body);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("[API/bookings/[id]/POST] Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AUTH CHECK
    const auth = await requireAuth(request);
    if (!auth.ok) return auth;

    const { id } = await params;
    const body = await request.json();
    
    const updateData = {
      ...body,
      ...(body.status && {
        status: body.status === RequestStatus.APPROVED || 
                body.status === RequestStatus.REJECTED 
          ? body.status 
          : RequestStatus.PENDING
      })
    };

    const bookings = await getBookings();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (updateData.status === RequestStatus.APPROVED && !canApproveByDate(booking.date)) {
      return NextResponse.json(
        { error: `Approval only allowed for dates at least 7 days from today` },
        { status: 400 }
      );
    }

    const updated = await updateBookingById(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Send emails for status changes
    if (updateData.status === RequestStatus.APPROVED) {
      await sendAcceptanceEmail(updated);
    } else if (updateData.status === RequestStatus.REJECTED) {
      await sendRejectionEmail(updated);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API/bookings/[id]/PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AUTH CHECK
    const auth = await requireAuth(request);
    if (!auth.ok) return auth;

    const { id } = await params;
    const body = await request.json();
    
    const bookings = await getBookings();
    const existingBooking = bookings.find((b) => b.id === id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await updateBookingById(id, body, true);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API/bookings/[id]/PUT] Error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AUTH CHECK
    const auth = await requireAuth(request);
    if (!auth.ok) return auth;

    const { id } = await params;
    
    const bookings = await getBookings();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === RequestStatus.APPROVED) {
      return NextResponse.json(
        { error: "Cannot delete approved bookings" },
        { status: 400 }
      );
    }

    const deleted = await deleteBookingById(id);
    if (!deleted) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("[API/bookings/[id]/DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
