"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookingCalendar, DateAvailabilityMap } from "@/components/booking-calendar";
import { BookingForm } from "@/components/booking-form";
import { BookingType, RequestStatus } from "@/types";
import {
  getApprovedBookings,
  getHallDayState,
  getHiraHallDateAvailability,
} from "@/lib/booking-logic";
import type { Booking } from "@/types";
import type { BookingRequestInput } from "@/lib/validations";
import { format } from "date-fns";

export default function BookHallPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/bookings");
    if (res.ok) {
      const data = await res.json();
      setBookings(data);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const approved = useMemo(
    () => getApprovedBookings(bookings, BookingType.HIRA_HALL),
    [bookings]
  );

  const availability: DateAvailabilityMap = useMemo(() => {
    const map: DateAvailabilityMap = {};
    const start = new Date();
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const key = format(d, "yyyy-MM-dd");
      const state = getHallDayState(approved, key);
      map[key] = getHiraHallDateAvailability(state);
    }
    return map;
  }, [approved]);

  const handleSubmit = async (data: BookingRequestInput) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Failed to submit request.");
      return;
    }
    setSubmitted(true);
    setSelectedDate(null);
    fetchBookings();
  };

  if (submitted) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-lg mx-auto rounded-xl bg-white border border-slate-200 p-8 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-royal">Request Submitted</h2>
          <p className="mt-2 text-slate-600">
            Your Hira Hall booking request has been submitted. You will be notified after admin approval.
          </p>
          <Link href="/book/hall" className="btn-primary inline-block mt-6">
            Book Another
          </Link>
          <Link href="/" className="block mt-3 text-royal underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-royal font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-royal mb-2">Book Hira Hall</h1>
      <p className="text-slate-600 mb-2">
        Select a date. Green = available, Yellow = partially booked, Red = fully booked.
      </p>
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-amber-100" /> Partially booked
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-100" /> Fully booked
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          <BookingCalendar
            availability={availability}
            selected={selectedDate ?? undefined}
            onSelect={setSelectedDate}
          />
        </div>
        <div className="flex-1 w-full max-w-md">
          {selectedDate ? (
            <BookingForm
              type={BookingType.HIRA_HALL}
              date={format(selectedDate, "yyyy-MM-dd")}
              approvedBookings={bookings.filter((b) => b.status === RequestStatus.APPROVED)}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedDate(null)}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-600">
              Select a date on the calendar to open the booking form.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
