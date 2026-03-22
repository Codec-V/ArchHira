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
  [Slot.SECOND_HALF]: "Second Day",
  [Slot.FULL_DAY]: "Full Day",
};

const typeLabels: Record<BookingType, string> = {
  [BookingType.HIRA_HALL]: "Hira Hall",
  [BookingType.ARCHITECTURE_HALL]: "Architecture Hall",
  [BookingType.GUEST_HOUSE]: "Guest House",
};

export function BookingForm({ type, date, approvedBookings, onSubmit, onCancel }: Props) {
  const hallDayState = useMemo(() => {
    if (type === BookingType.GUEST_HOUSE) return null;
    const approved = getApprovedBookings(approvedBookings, type);
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
      department: "", // Added department default value
      subject: "",
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
      className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-8 shadow-xl"
    >
      <div className="pb-4 border-b border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Request</h3>
        <p className="text-sm text-slate-600 font-medium">
          {typeLabels[type]} — {date}
        </p>
      </div>

      {/* Basic Info Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
          <input
            {...register("name")}
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm"
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
          <input
            {...register("designation")}
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm"
            placeholder="e.g. Student / Professor"
          />
          {errors.designation && <p className="mt-2 text-sm text-red-600">{errors.designation.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm"
            placeholder="your@email.com"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Added Department Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
          <input
            {...register("department")}
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm"
            placeholder="e.g. Computer Science, Mechanical Engg"
          />
          {errors.department && <p className="mt-2 text-sm text-red-600">{errors.department.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
        <input
          {...register("subject")}
          className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm"
          placeholder="e.g. Department Meeting, Workshop"
        />
        {errors.subject && <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose</label>
        <textarea
          {...register("purpose")}
          rows={3}
          className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-royal focus:ring-2 focus:ring-royal/20 transition-all shadow-sm resize-none"
          placeholder="Detailed description..."
        />
        {errors.purpose && <p className="mt-2 text-sm text-red-600">{errors.purpose.message}</p>}
      </div>

      {/* Slot Selection */}
      {type !== BookingType.GUEST_HOUSE && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Time Slot</label>
          <div className="grid grid-cols-3 gap-3">
            {([Slot.FIRST_HALF, Slot.SECOND_HALF, Slot.FULL_DAY] as const).map((s) => {
              const available = availableSlots.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all font-medium ${
                    available
                      ? currentSlot === s
                        ? "border-royal bg-royal/10 text-royal shadow-sm"
                        : "border-slate-300 hover:border-royal/50 text-slate-700"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <input
                    type="radio"
                    value={s}
                    {...register("slot")}
                    disabled={!available}
                    className="sr-only"
                    onChange={() => setValue("slot", s)}
                  />
                  <span className="text-sm">{slotLabels[s]}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden Fields */}
      <input type="hidden" {...register("type")} />
      <input type="hidden" {...register("date")} />

      <div className="flex gap-4 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-royal px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
