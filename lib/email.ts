/**
 * Send acceptance/rejection emails via SMTP (Nodemailer).
 * Set SMTP env vars in .env.local to enable.
 */

import nodemailer from "nodemailer";
import type { Booking } from "@/types";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "dsharma033.btech2023@it.nitrr.ac.in";
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

const typeLabel: Record<string, string> = {
  HIRA_HALL: "Hira Hall",
  GUEST_HOUSE: "Guest House",
};
const slotLabel: Record<string, string> = {
  FIRST_HALF: "First Half",
  SECOND_HALF: "Second Half",
  FULL_DAY: "Full Day",
};

export async function sendAcceptanceEmail(booking: Booking): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(
      "[Email] SMTP not configured. Acceptance would be sent to:",
      booking.email
    );
    return false;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await transport.sendMail({
      from: from || "noreply@hirahall.local",
      to: booking.email,
      subject: `Booking Approved – ${
        typeLabel[booking.type] || booking.type
      } on ${booking.date}`,
      text: `Dear ${booking.name},\n\nYour booking request has been approved.\n\nVenue: ${
        typeLabel[booking.type] || booking.type
      }\nDate: ${booking.date}\nSlot: ${
        slotLabel[booking.slot] || booking.slot
      }\nPurpose: ${
        booking.purpose
      }\n\nThank you.\n— Hira Hall & Guest House`,
      html: `
        <p>Dear ${booking.name},</p>
        <p>Your booking request has been <strong>approved</strong>.</p>
        <ul>
          <li><strong>Venue:</strong> ${
            typeLabel[booking.type] || booking.type
          }</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Slot:</strong> ${
            slotLabel[booking.slot] || booking.slot
          }</li>
          <li><strong>Purpose:</strong> ${booking.purpose}</li>
        </ul>
        <p>Thank you.</p>
        <p>— Hira Hall & Guest House</p>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Email] Acceptance send failed:", err);
    return false;
  }
}

export async function sendRejectionEmail(booking: Booking): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(
      "[Email] SMTP not configured. Rejection would be sent to:",
      booking.email
    );
    return false;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await transport.sendMail({
      from: from || "noreply@hirahall.local",
      to: booking.email,
      subject: `Booking Request Update – ${
        typeLabel[booking.type] || booking.type
      } on ${booking.date}`,
      text: `Dear ${booking.name},\n\nUnfortunately your booking request could not be approved.\n\nVenue: ${
        typeLabel[booking.type] || booking.type
      }\nDate: ${booking.date}\nSlot: ${
        slotLabel[booking.slot] || booking.slot
      }\n\nYou may submit a new request for another date. Thank you.\n— Hira Hall & Guest House`,
      html: `
        <p>Dear ${booking.name},</p>
        <p>Unfortunately your booking request could not be approved.</p>
        <ul>
          <li><strong>Venue:</strong> ${
            typeLabel[booking.type] || booking.type
          }</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Slot:</strong> ${
            slotLabel[booking.slot] || booking.slot
          }</li>
        </ul>
        <p>You may submit a new request for another date. Thank you.</p>
        <p>— Hira Hall & Guest House</p>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Email] Rejection send failed:", err);
    return false;
  }
}