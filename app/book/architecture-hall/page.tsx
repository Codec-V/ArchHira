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
import { useRouter } from "next/navigation";
import { useAutoLogout } from "@/app/hooks/useAutoLogout";
import Image from "next/image";

export default function BookArchitectureHallPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // ✅ FIXED: Only fetch bookings when authenticated
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
    () => getApprovedBookings(bookings, BookingType.ARCHITECTURE_HALL),
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
      credentials: "include" // ✅ Send auth cookie
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
            Your Architecture Hall booking request has been submitted. You will receive an email notification after admin approval.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book/architecture-hall" className="btn-primary inline-flex items-center justify-center">
              Book Another Date
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50 hover:border-royal/30 transition-all"
            >
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
      {/* ✅ NIT Background */}
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
        {/* ✅ TRANSPARENT Header (Glass) */}
        <div className="backdrop-2xl  py-4 px-4 md:px-8 relative z-20">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-white/95 hover:text-white font-medium mb-4 transition-all backdrop-blur-sm hover:bg-white/10 px-3 py-1 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent drop-shadow-2xl">
              Book Architecture Hall
            </h1>
            <p className="text-white/95 text-lg drop-shadow-lg max-w-2xl">
              Select a date from the calendar to start your booking request
            </p>
          </div>
        </div>

        {/* ✅ Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 relative z-20">
          {/* Legend - Glass Card */}
          <div className="flex flex-wrap gap-6 mb-8 p-6   rounded-3xl ">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400/80 to-green-400/80 border-2 border-white/30 shadow-lg" />
              <span className="text-white/95 font-medium text-sm drop-shadow-lg">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400/80 to-yellow-400/80 border-2 border-white/30 shadow-lg" />
              <span className="text-white/95 font-medium text-sm drop-shadow-lg">Partially Booked</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-red-400/80 to-rose-400/80 border-2 border-white/30 shadow-lg opacity-70" />
              <span className="text-white/95 font-medium text-sm drop-shadow-lg">Fully Booked</span>
            </div>
          </div>

          {/* Calendar and Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] gap-8 items-start">
            {/* Calendar Section - Glass Card */}
            <div className=" backdrop-xl rounded-3xl p-6 hover:shadow-3xl transition-all duration-300">
              <BookingCalendar
                availability={availability}
                selected={selectedDate ?? undefined}
                onSelect={setSelectedDate}
              />
            </div>

            {/* Form Section - Glass Card */}
            <div className="backdrop-xl rounded-3xl p-6 hover:shadow-3xl transition-all duration-300">
              {selectedDate ? (
                <BookingForm
                  type={BookingType.ARCHITECTURE_HALL}
                  date={format(selectedDate, "yyyy-MM-dd")}
                  approvedBookings={bookings.filter(
                    (b) => b.status === RequestStatus.APPROVED
                  )}
                  onSubmit={handleSubmit}
                  onCancel={() => setSelectedDate(null)}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-xl border border-white/30 mx-auto">
                    <svg
                      className="w-10 h-10 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white/95 mb-2 drop-shadow-2xl">
                    Select a Date
                  </h3>
                  <p className="text-white/80 drop-shadow-lg">
                    Choose a date from the calendar to open the booking form
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
