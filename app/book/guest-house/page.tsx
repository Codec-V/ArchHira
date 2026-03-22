"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingType, RequestStatus } from "@/types";
import {
  getApprovedBookings,
  getGuestHouseRoomsLeftForDate,
} from "@/lib/booking-logic";
import { format, addDays, isBefore, parseISO } from "date-fns";
import type { Booking } from "@/types";
import { GuestHouseBookingForm } from "@/components/guest-house-booking-form";
import { useRouter } from "next/navigation";
import { useAutoLogout } from "@/app/hooks/useAutoLogout";
import Image from "next/image";
export type DateAvailabilityMap = Record<string, "available" | "partial" | "booked">;

export default function BookGuestHousePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 
  useAutoLogout();

  // ✅ FIXED: Proper auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ✅ FIXED: Authenticated fetchBookings
  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/bookings", {
      credentials: "include" // ✅ Send auth cookie
    });
    if (res.ok) {
      const data = await res.json();
      setBookings(data);
    }
  }, []);

  // ✅ FIXED: Only fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [fetchBookings, isAuthenticated]);

  const approved = useMemo(
    () => getApprovedBookings(bookings, BookingType.GUEST_HOUSE),
    [bookings]
  );

  const today = useMemo(() => new Date(), []);

  const availability: DateAvailabilityMap = useMemo(() => {
    const map: DateAvailabilityMap = {};
    const start = addDays(today, 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = format(d, "yyyy-MM-dd");
      const roomsLeft = getGuestHouseRoomsLeftForDate(approved, key);
      
      if (roomsLeft === 3) map[key] = "available";
      else if (roomsLeft >= 1) map[key] = "partial";
      else map[key] = "booked";
    }
    return map;
  }, [approved, today]);

  const selectedRange = useMemo(() => ({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") + "T09:00" : "",
    endDate: endDate ? format(endDate, "yyyy-MM-dd") + "T12:00" : "",
  }), [startDate, endDate]);

  // ✅ NEW: Range availability check (shows min rooms in range)
  const rangeAvailability = useMemo(() => {
    if (!startDate || !endDate) return null;
    
    let minAvailable = 3;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const roomsLeft = getGuestHouseRoomsLeftForDate(approved, dateStr);
      minAvailable = Math.min(minAvailable, roomsLeft);
    }
    return minAvailable;
  }, [startDate, endDate, approved]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (isBefore(date, addDays(today, 1))) {
      alert("Can only book from tomorrow onwards!");
      return;
    }
    
    const dateStr = format(date, "yyyy-MM-dd");
    const clickedDate = new Date(dateStr + "T00:00:00");
    
    if (!startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && format(startDate, "yyyy-MM-dd") === dateStr) {
      setStartDate(null);
      setEndDate(null);
    } else if (startDate && !endDate) {
      const end = clickedDate;
      if (end < startDate) {
        setStartDate(end);
        setEndDate(startDate);
      } else {
        setEndDate(end);
      }
    } else {
      setStartDate(clickedDate);
      setEndDate(null);
    }
  };

  const calendarProps = useMemo(() => ({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
  }), [startDate, endDate]);

  // ✅ FIXED: Authenticated submit with proper error handling
  const pageHandleSubmit = async (data: any) => {
    console.log("🚀 PAGE HANDLE SUBMIT CALLED:", data);
    
    if (!startDate || !endDate) {
      alert("Please select start and end dates first");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expectedArrival: format(startDate, "yyyy-MM-dd") + "T09:00",
          expectedDeparture: format(endDate, "yyyy-MM-dd") + "T12:00",
        }),
        credentials: "include" // ✅ Send auth cookie
      });

      console.log("API Response:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API Error:", err);
        alert(err?.error || "Failed to submit request.");
        return;
      }
      
      setSubmitted(true);
      setStartDate(null);
      setEndDate(null);
      fetchBookings();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error: " + error);
    }
  };

  // ✅ CRITICAL: RENDER GUARDS (THIS WAS MISSING!)
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-xl font-medium text-slate-600 animate-pulse">
          Checking authentication...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null; // useEffect will redirect to login
  }

  if (submitted) {
    return (
       <>
            <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden">
            <Image
              src="/NIT-Raipur-Aerial-view.png"
              alt="NIT Raipur Campus"
              fill
              sizes="100vw"
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="fixed inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 -z-10"></div>
            <main className="min-h-screen w-full relative z-10 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-2xl bg-white border border-slate-200/80 p-10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted Successfully!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your Guest House booking request has been submitted. You will receive an email notification after admin approval.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book/guest-house" className="btn-primary inline-flex items-center justify-center">
              Book Another Date
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50 hover:border-indigo-500/30 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden">
         <Image
           src="/NIT-Raipur-Aerial-view.png"
           alt="NIT Raipur Campus"
           fill
           sizes="100vw"
           className="object-cover brightness-75"
           priority
         />
       </div>
         
         {/* ✅ Dark Overlay */}
         <div className="fixed inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 -z-10"></div>
   
         <main className="min-h-screen w-full relative z-10">
      <div className="backdrop-2xl  py-4 px-4 md:px-8 relative z-20">
        {/* Header */}
        <div className="backdrop-2xl  py-4 px-4 md:px-8 relative z-20">
          <div className="max-w-7xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </Link>
            <h1 className="text-white/90 md:text-4xl font-bold mb-2">Book Guest House</h1>
            <p className="text-white/90 text-lg">
              Select date range (from <strong>tomorrow</strong>). Auto-fills 9AM-12PM times.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Calendar Section */}
            <div className="w-full space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-white/90font-semibold text-white/90">Availability Calendar</h2>
                <p className="text-white/90text-slate-500">3 rooms total • <span className="text-white/90">Bookings from tomorrow</span></p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-white/90 text-slate-600 mb-4">
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white/90 from-emerald-50 to-green-50 border border-emerald-200/60" />
                  3 rooms available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60" />
                  1-2 rooms available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/60" />
                  Fully booked
                </span>
              </div>

              <BookingCalendar
                availability={availability}
                selected={startDate || undefined}
                rangeStart={calendarProps.startDate}
                rangeEnd={calendarProps.endDate}
                onSelect={handleCalendarSelect}
                disabled={(date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return isBefore(date, addDays(today, 1)) || availability[dateStr] === "booked";
                }}
              />

              {/* ✅ ENHANCED Range Summary with availability */}
              {startDate && endDate && rangeAvailability !== null && (
                <div className={`p-4 border rounded-xl shadow-sm ${
                  rangeAvailability === 0 
                    ? 'bg-red-50 border-red-200' 
                    : rangeAvailability < 3 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    ✅ Selected: <span className="text-indigo-600 font-bold">{format(startDate, "MMM dd")}</span> 
                    → <span className="text-purple-600 font-bold">{format(endDate, "MMM dd")}</span>
                  </h4>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-slate-600">Min rooms available:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      rangeAvailability === 0 
                        ? 'bg-red-100 text-red-800' 
                        : rangeAvailability < 3 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rangeAvailability}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Form will limit rooms input to {rangeAvailability} max
                    {rangeAvailability === 0 && ' ⚠️ Cannot book this range'}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full">
              <GuestHouseBookingForm
                approvedBookings={bookings.filter(b => b.status === RequestStatus.APPROVED)}
                onSubmit={pageHandleSubmit}
                selectedRange={selectedRange}
                onCancel={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
