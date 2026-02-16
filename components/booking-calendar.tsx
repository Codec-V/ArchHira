"use client";

import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

export type DateAvailabilityMap = Record<string, "available" | "partial" | "booked">;

interface BookingCalendarProps {
  availability: DateAvailabilityMap;
  selected?: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

export function BookingCalendar(props: BookingCalendarProps) {
  const { availability, selected, onSelect, disabled } = props;
  const dateStr = (d: Date) => format(d, "yyyy-MM-dd");

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={(d) => d && onSelect(d)}
      disabled={disabled}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-2 text-lg font-semibold text-royal",
        nav: "flex gap-2",
        button_previous: "absolute left-2 top-2 rounded-lg border p-2 hover:bg-slate-100",
        button_next: "absolute right-2 top-2 rounded-lg border p-2 hover:bg-slate-100",
        weekdays: "flex justify-around text-slate-600 text-sm",
        week: "flex justify-around",
        day: "rounded-lg w-10 h-10 flex items-center justify-center text-sm",
        day_button: "w-full h-full rounded-lg transition-colors",
        selected: "bg-royal text-white font-semibold",
        today: "ring-2 ring-royal/50",
        outside: "text-slate-300",
        disabled: "opacity-50 cursor-not-allowed",
        hidden: "invisible",
      }}
      modifiers={{
        available: (d) => availability[dateStr(d)] === "available",
        partial: (d) => availability[dateStr(d)] === "partial",
        booked: (d) => availability[dateStr(d)] === "booked",
      }}
      modifiersClassNames={{
        available: "bg-green-100 text-green-800 hover:bg-green-200",
        partial: "bg-amber-100 text-amber-800 hover:bg-amber-200",
        booked: "bg-red-100 text-red-800 cursor-not-allowed",
      }}
    />
  );
}
