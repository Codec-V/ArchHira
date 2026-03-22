import { z } from "zod";
import { BookingType, Slot } from "@/types";

// -------------------------------
// Hall / Architecture booking
// -------------------------------

export const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  designation: z.string().min(1, "Designation is required").max(100),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  purpose: z.string().min(5, "Purpose must be at least 5 characters").max(500),
  type: z.nativeEnum(BookingType),
  department: z
    .string()
    .min(1, "Department is required")
    .max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slot: z.nativeEnum(Slot),
  requestingBodyId: z.string().min(1, "Requesting body is required").default("general-default"),
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

// -------------------------------
// Guest House requisition
// -------------------------------

const datetimeLocalRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // HTML datetime-local format

export const guestHouseBookingSchema = z.object({
  type: z.literal(BookingType.GUEST_HOUSE),
  requestingBodyId: z
    .string()
    .min(1, "Requesting body is required").default("guest-house-default"),

  // Visitor details
  visitorName: z
    .string()
    .min(2, "Visitor name must be at least 2 characters")
    .max(100),
  visitorAddress: z
    .string()
    .min(5, "Visitor address must be at least 5 characters")
    .max(500),

  // Stay timing
  expectedArrival: z
    .string()
    .regex(datetimeLocalRegex, "Expected arrival must include date and time"),
  expectedDeparture: z
    .string()
    .regex(datetimeLocalRegex, "Expected departure must include date and time"),

  // Category / rooms / justification
  category: z.enum(["A", "B", "C", "HALL"]),
  purpose: z
    .string()
    .min(5, "Justification must be at least 5 characters")
    .max(500),
  roomsRequested: z
    .number({
      invalid_type_error: "Number of rooms is required",
    })
    .int("Number of rooms must be an integer")
    .min(1, "At least 1 room is required")
    .max(3, "Maximum 3 rooms can be booked"),
  advancedPaymentDetails: z.string().optional(),
  paymentDriveLink: z.string().url("Provide a valid Drive link").optional(),

  // Requester details
  requesterName: z
    .string()
    .min(2, "Requester name must be at least 2 characters")
    .max(100),
  requesterDesignation: z
    .string()
    .min(1, "Designation is required")
    .max(100),
  requesterDepartment: z
    .string()
    .min(1, "Department is required")
    .max(100),
  requesterPhone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  requesterEmail: z.string().email("Valid email is required"),
});

export type GuestHouseBookingInput = z.infer<typeof guestHouseBookingSchema>;

export const guestHouseBookingSchemaRefined = guestHouseBookingSchema.superRefine(
  (data, ctx) => {
    // Expected Departure cannot be before Expected Arrival.
    if (data.expectedDeparture <= data.expectedArrival) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expectedDeparture"],
        message: "Expected departure must be after expected arrival.",
      });
    }

    // Payment details required for B, C, or Hall.
    if (["B", "C", "HALL"].includes(data.category)) {
      if (!data.advancedPaymentDetails || data.advancedPaymentDetails.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["advancedPaymentDetails"],
          message: "Advanced Payment Details are required for this category.",
        });
      }
      if (!data.paymentDriveLink || data.paymentDriveLink.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentDriveLink"],
          message: "Drive link for payment attachment is required.",
        });
      }
    }
  }
);

export const anyBookingSchema = z.union([
  bookingRequestSchemaRefined,
  guestHouseBookingSchemaRefined,
]);

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
