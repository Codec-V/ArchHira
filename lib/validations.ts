import { z } from "zod";
import { BookingType, Slot } from "@/types";

export const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  designation: z.string().min(1, "Designation is required").max(100),
  email: z.string().email("Valid email is required"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters").max(500),
  type: z.nativeEnum(BookingType),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slot: z.nativeEnum(Slot),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/** Hall slot is required when type is HIRA_HALL; for GUEST_HOUSE we force FULL_DAY in UI. */
export const bookingRequestSchemaRefined = bookingRequestSchema.superRefine(
  (data, ctx) => {
    if (data.type === BookingType.GUEST_HOUSE && data.slot !== Slot.FULL_DAY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slot"],
        message: "Guest House can only be booked for Full Day.",
      });
    }
  }
);

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const addAdminSchema = z.object({
  currentAdminEmail: z.string().email(),
  newEmail: z.string().email("Valid email is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type AddAdminInput = z.infer<typeof addAdminSchema>;
