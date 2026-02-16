"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingType, Slot } from "@/types";
import { bookingRequestSchemaRefined, type BookingRequestInput } from "@/lib/validations";
import { getAvailableHallSlots, getHallDayState } from "@/lib/booking-logic";
import { getApprovedBookings } from "@/lib/booking-logic";
import { useMemo } from "react";

type Props = {
  type: BookingType;
  date: string;
  approvedBookings: import("@/types").Booking[];
  onSubmit: (data: BookingRequestInput) => Promise<void>;
  onCancel: () => void;
};

const slotLabels: Record<Slot, string> = {
  [Slot.FIRST_HALF]: "First Half",
  [Slot.SECOND_HALF]: "Second Half",
  [Slot.FULL_DAY]: "Full Day",
};

export function BookingForm({ type, date, approvedBookings, onSubmit, onCancel }: Props) {
  const hallDayState = useMemo(() => {
    if (type !== BookingType.HIRA_HALL) return null;
    const approved = getApprovedBookings(approvedBookings, BookingType.HIRA_HALL);
    return getHallDayState(approved, date);
  }, [type, date, approvedBookings]);

  const availableSlots = useMemo(() => {
    if (type === BookingType.GUEST_HOUSE) return [Slot.FULL_DAY];
    if (hallDayState) return getAvailableHallSlots(hallDayState);
    return [Slot.FIRST_HALF, Slot.SECOND_HALF, Slot.FULL_DAY];
  }, [type, hallDayState]);

  const defaultSlot = type === BookingType.GUEST_HOUSE ? Slot.FULL_DAY : availableSlots[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingRequestInput>({
    resolver: zodResolver(bookingRequestSchemaRefined),
    defaultValues: {
      name: "",
      designation: "",
      email: "",
      purpose: "",
      type,
      date,
      slot: defaultSlot,
    },
  });

  const currentSlot = watch("slot");

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-royal">Booking Request</h3>
      <p className="text-sm text-slate-600">
        {type === BookingType.HIRA_HALL ? "Hira Hall" : "Guest House"} — {date}
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
        <input
          {...register("name")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Designation
        </label>
        <input
          {...register("designation")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
          placeholder="Your designation"
        />
        {errors.designation && (
          <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
        <textarea
          {...register("purpose")}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
          placeholder="Purpose of booking"
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
        )}
      </div>

      {type === BookingType.HIRA_HALL && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slot
          </label>
          <div className="flex flex-wrap gap-2">
            {([Slot.FIRST_HALF, Slot.SECOND_HALF, Slot.FULL_DAY] as const).map(
              (s) => {
                const available = availableSlots.includes(s);
                return (
                  <label
                    key={s}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer transition-colors ${
                      available
                        ? "border-slate-300 hover:border-royal"
                        : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                    } ${currentSlot === s ? "border-royal bg-royal/5" : ""}`}
                  >
                    <input
                      type="radio"
                      value={s}
                      {...register("slot")}
                      disabled={!available}
                      className="sr-only"
                      onChange={() => setValue("slot", s)}
                    />
                    <span>{slotLabels[s]}</span>
                  </label>
                );
              }
            )}
          </div>
          {errors.slot && (
            <p className="mt-1 text-sm text-red-600">{errors.slot.message}</p>
          )}
        </div>
      )}

      <input type="hidden" {...register("type")} />
      <input type="hidden" {...register("date")} />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit Request"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
