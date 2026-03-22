"use client";

import { DayPicker } from "react-day-picker";
import { format, addDays, isBefore } from "date-fns";
import "react-day-picker/style.css";

export type DateAvailabilityMap = Record<string, "available" | "partial" | "booked">;

interface BookingCalendarProps {
  availability: DateAvailabilityMap;
  selected?: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  // ✅ NEW OPTIONAL PROPS (won't break hall bookings)
  rangeStart?: string | null;
  rangeEnd?: string | null;
}

export function BookingCalendar({
  availability,
  selected,
  onSelect,
  disabled: propDisabled,
  rangeStart,
  rangeEnd,
}: BookingCalendarProps) {
  const dateStr = (d: Date) => format(d, "yyyy-MM-dd");

  // ✅ BACKWARD COMPATIBLE: Use propDisabled OR default to tomorrow
  const disabled = (date: Date): boolean => {
    const propDisabledResult = propDisabled?.(date);
    if (propDisabledResult !== undefined) return propDisabledResult;
    
    // Default: disable past dates + today (tomorrow onwards)
    return isBefore(date, addDays(new Date(), 1));
  };

  // ✅ RANGE MODIFIERS (optional - safe for hall bookings)
  const modifiers = {
    available: (d: Date) => availability[dateStr(d)] === "available",
    partial: (d: Date) => availability[dateStr(d)] === "partial",
    booked: (d: Date) => availability[dateStr(d)] === "booked",
    // NEW: Range modifiers (Guest House only)
    rangeStart: rangeStart ? [new Date(rangeStart)] : [],
    rangeEnd: rangeEnd ? [new Date(rangeEnd)] : [],
  };

  return (
    <div className="w-full">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d) => d && onSelect(d)}
        disabled={disabled}
        className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-6 shadow-xl"
        classNames={{
          months: "flex flex-col sm:flex-row gap-6",
          month: "flex flex-col gap-4 w-full",
          month_caption: "flex justify-center items-center pt-2 pb-4 text-xl font-bold text-slate-900 relative",
          caption_label: "text-slate-900",
          nav: "flex gap-2",
          button_previous: "absolute left-0 top-2 rounded-xl border border-slate-300 bg-white p-2.5 hover:bg-slate-50 hover:border-royal/30 hover:shadow-md transition-all",
          button_next: "absolute right-0 top-2 rounded-xl border border-slate-300 bg-white p-2.5 hover:bg-slate-50 hover:border-royal/30 hover:shadow-md transition-all",
          weekdays: "flex justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2",
          weekday: "w-12 text-center",
          week: "flex justify-between gap-1",
          day: "rounded-xl w-12 h-12 flex items-center justify-center text-sm font-medium m-0 relative",
          day_button: "w-full h-full rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center",
          selected: "bg-gradient-to-br from-royal to-indigo-600 text-white font-semibold shadow-lg shadow-royal/30 ring-2 ring-royal/20",
          today: "ring-2 ring-royal/40 ring-offset-2 ring-offset-white bg-royal/5 font-semibold",
          outside: "text-slate-300 opacity-50",
          disabled: "opacity-40 cursor-not-allowed hover:scale-100",
          hidden: "invisible",
        }}
        modifiers={modifiers}
        modifiersClassNames={{
          // Existing styles (HALL bookings)
          available: "bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 hover:shadow-md",
          partial: "bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/50 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300 hover:shadow-md",
          booked: "bg-gradient-to-br from-red-50 to-rose-50 text-red-700 border border-red-200/50 cursor-not-allowed opacity-60",
          
          // ✅ NEW: Purple end date + range (Guest House only)
          rangeStart: "bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold ring-4 ring-blue-200/50 shadow-lg !scale-110",
          rangeEnd: "bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold ring-4 ring-purple-200/50 shadow-lg !scale-110",
        }}
        styles={{
          day: {
            margin: "2px",
          },
          day_button: {
            margin: "0",
          },
        }}
      />
    </div>
  );
}
