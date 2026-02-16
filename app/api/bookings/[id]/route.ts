import { NextRequest, NextResponse } from "next/server";
import { RequestStatus } from "@/types";
import { canApproveByDate } from "@/lib/booking-logic";
import { getBookings, updateBookingById } from "@/lib/store-server";
import { sendAcceptanceEmail, sendRejectionEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: RequestStatus };
  if (status !== RequestStatus.APPROVED && status !== RequestStatus.REJECTED) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const bookings = await getBookings();
  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== RequestStatus.PENDING) {
    return NextResponse.json(
      { error: "Booking is already processed" },
      { status: 400 }
    );
  }

  if (status === RequestStatus.APPROVED && !canApproveByDate(booking.date)) {
    return NextResponse.json(
      {
        error: `Approval only allowed for dates at least 7 days from today. Requested: ${booking.date}`,
      },
      { status: 400 }
    );
  }

  const updated = await updateBookingById(id, status, body.reviewedBy);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (status === RequestStatus.APPROVED) {
    await sendAcceptanceEmail(updated);
  } else {
    await sendRejectionEmail(updated);
  }

  return NextResponse.json(updated);
}
