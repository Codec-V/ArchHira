"use client";

import { useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Booking } from "@/types";
import {
  guestHouseBookingSchemaRefined,
  type GuestHouseBookingInput,
} from "@/lib/validations";
import {
  getGuestHouseRoomsLeftForDate,
  getApprovedBookings,
} from "@/lib/booking-logic";
import { format, parseISO } from "date-fns"; // ✅ Added for date parsing

type Props = {
  approvedBookings: Booking[];
  onSubmit: (data: GuestHouseBookingInput) => Promise<void>;
  onCancel: () => void;
  selectedRange?: { startDate: string; endDate: string };
};

const CATEGORY_LABELS: Record<string, string> = {
  A: "Category A",
  B: "Category B",
  C: "Category C",
  HALL: "Hall",
};

export function GuestHouseBookingForm({ 
  approvedBookings, 
  onSubmit, 
  onCancel, 
  selectedRange 
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GuestHouseBookingInput>({
    resolver: zodResolver(guestHouseBookingSchemaRefined),
    defaultValues: {
      type: "GUEST_HOUSE",
      category: "A",
      roomsRequested: 1,
      expectedArrival: selectedRange?.startDate || "",
      expectedDeparture: selectedRange?.endDate || "",
    } as any,
  });

  useEffect(() => {
    if (selectedRange?.startDate) {
      setValue("expectedArrival", selectedRange.startDate);
    }
    if (selectedRange?.endDate) {
      setValue("expectedDeparture", selectedRange.endDate);
    }
  }, [selectedRange, setValue]);

  const arrival = watch("expectedArrival");
  const departure = watch("expectedDeparture");
  const category = watch("category");
  const showPaymentFields = category === "B" || category === "C" || category === "HALL";

  // ✅ CRITICAL: MIN ROOMS AVAILABLE IN ENTIRE RANGE
  const minRoomsAvailableInRange = useMemo(() => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return 3;
    
    const approvedGuest = getApprovedBookings(approvedBookings, "GUEST_HOUSE" as any);
    let minAvailable = 3;
    
    try {
      const startDate = parseISO(selectedRange.startDate.slice(0, 10));
      const endDate = parseISO(selectedRange.endDate.slice(0, 10));
      
      // Check every day in selected range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        const roomsLeft = getGuestHouseRoomsLeftForDate(approvedGuest, dateStr);
        minAvailable = Math.min(minAvailable, roomsLeft);
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      return 0;
    }
    
    return minAvailable;
  }, [selectedRange, approvedBookings]);

  const roomsLeftForArrivalDay = useMemo(() => {
    if (!arrival) return null;
    const dateStr = arrival.slice(0, 10);
    const approvedGuest = getApprovedBookings(approvedBookings, "GUEST_HOUSE" as any);
    return getGuestHouseRoomsLeftForDate(approvedGuest, dateStr);
  }, [arrival, approvedBookings]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const formattedData = {
          ...data,
          roomsRequested: Number(data.roomsRequested)
        };
        await onSubmit(formattedData);
      }, (err) => console.log("Validation Errors:", err))}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
    >
      <div className="border-b pb-4">
        <h3 className="text-2xl font-bold text-slate-900">Guest House Requisition</h3>
        {selectedRange && (
          <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-sm text-indigo-700 font-medium">
              📅 Auto-filled: {selectedRange.startDate.slice(0, 10)} → {selectedRange.endDate.slice(0, 10)}
            </p>
            <p className={`text-xs font-bold mt-1 ${
              minRoomsAvailableInRange === 0 
                ? 'text-red-600' 
                : minRoomsAvailableInRange < 3 
                ? 'text-amber-600' 
                : 'text-emerald-600'
            }`}>
              Min {minRoomsAvailableInRange} room(s) available in range
              {minRoomsAvailableInRange === 0 && ' ⚠️ Cannot book'}
            </p>
          </div>
        )}
      </div>

      {/* 1. VISITOR INFO */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-500">1. Visitor Details</h4>
        <div className="grid gap-4">
          <input {...register("visitorName")} placeholder="Visitor Name *" className="w-full rounded-xl border-2 p-3" />
          {errors.visitorName && <p className="text-xs text-red-600">{errors.visitorName.message}</p>}
          <textarea {...register("visitorAddress")} placeholder="Full Postal Address *" className="w-full rounded-xl border-2 p-3" rows={2} />
          {errors.visitorAddress && <p className="text-xs text-red-600">{errors.visitorAddress.message}</p>}
        </div>
      </div>

      {/* 2. STAY DETAILS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-500">2. Stay Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Arrival (Auto-filled 9AM)</label>
            <input 
              type="datetime-local" 
              {...register("expectedArrival")} 
              className="w-full border-2 p-3 rounded-xl bg-slate-50" 
              disabled={!!selectedRange?.startDate}
            />
            {errors.expectedArrival && <p className="text-xs text-red-600">{errors.expectedArrival.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Departure (Auto-filled 12PM)</label>
            <input 
              type="datetime-local" 
              {...register("expectedDeparture")} 
              className="w-full border-2 p-3 rounded-xl bg-slate-50" 
              disabled={!!selectedRange?.endDate}
            />
            {errors.expectedDeparture && <p className="text-xs text-red-600">{errors.expectedDeparture.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <select {...register("category")} className="border-2 p-3 rounded-xl bg-white">
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
            <option value="HALL">Hall</option>
          </select>
          {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
          
          <div>
            <label className="block text-xs text-slate-500 mb-1">Rooms Requested</label>
            <input 
              type="number" 
              {...register("roomsRequested", { 
                valueAsNumber: true,
                required: "Rooms required",
                min: { 
                  value: 1, 
                  message: "Minimum 1 room" 
                },
                max: { 
                  value: Math.max(1, minRoomsAvailableInRange), 
                  message: `Maximum ${minRoomsAvailableInRange} room(s) available in range` 
                }
              })} 
              className={`border-2 p-3 rounded-xl w-full ${
                minRoomsAvailableInRange === 0 
                  ? 'bg-red-50 cursor-not-allowed' 
                  : 'bg-white'
              }`} 
              placeholder="Rooms" 
              min={1} 
              max={Math.max(1, minRoomsAvailableInRange)}
              disabled={minRoomsAvailableInRange === 0}
            />
            {errors.roomsRequested && (
              <p className="text-xs text-red-600 mt-1">{errors.roomsRequested.message}</p>
            )}
          </div>
        </div>

        <textarea {...register("purpose")} placeholder="Justification (min 5 chars) *" className="w-full rounded-xl border-2 p-3" rows={2} />
        {errors.purpose && <p className="text-xs text-red-600">{errors.purpose.message}</p>}

        {showPaymentFields && (
          <div className="grid gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <input {...register("advancedPaymentDetails")} placeholder="Payment Details (Amount/ID) *" className="w-full p-2 border rounded-lg" />
            {errors.advancedPaymentDetails && <p className="text-xs text-red-600">{errors.advancedPaymentDetails.message}</p>}
            <input {...register("paymentDriveLink")} placeholder="Receipt Drive Link (https://...) *" className="w-full p-2 border rounded-lg" />
            {errors.paymentDriveLink && <p className="text-xs text-red-600">{errors.paymentDriveLink.message}</p>}
          </div>
        )}
      </div>

      {/* 3. REQUESTER DETAILS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-500">3. Requester Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <input {...register("requesterName")} placeholder="Your Name *" className="border-2 p-3 rounded-xl" />
          {errors.requesterName && <p className="text-xs text-red-600">{errors.requesterName.message}</p>}
          <input {...register("requesterDesignation")} placeholder="Designation *" className="border-2 p-3 rounded-xl" />
          {errors.requesterDesignation && <p className="text-xs text-red-600">{errors.requesterDesignation.message}</p>}
          <input {...register("requesterDepartment")} placeholder="Department *" className="border-2 p-3 rounded-xl" />
          {errors.requesterDepartment && <p className="text-xs text-red-600">{errors.requesterDepartment.message}</p>}
          <input {...register("requesterPhone")} placeholder="Phone (10 digits) *" className="border-2 p-3 rounded-xl" />
          {errors.requesterPhone && <p className="text-xs text-red-600">{errors.requesterPhone.message}</p>}
        </div>
        <input {...register("requesterEmail")} placeholder="Your Email *" className="w-full border-2 p-3 rounded-xl" />
        {errors.requesterEmail && <p className="text-xs text-red-600">{errors.requesterEmail.message}</p>}
      </div>

      <input type="hidden" {...register("type")} />

      <div className="flex gap-4 pt-4 border-t">
        <button 
          type="submit" 
          disabled={isSubmitting || minRoomsAvailableInRange === 0}
          className="flex-1 bg-royal text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Requisition"}
        </button>
        <button type="button" onClick={onCancel} className="px-8 border-2 rounded-xl">Cancel</button>
      </div>
    </form>
  );
}
