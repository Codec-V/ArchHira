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
  ARCHITECTURE_HALL: "Architecture Hall",
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

export async function sendDisapprovalEmail(booking: Booking): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(
      "[Email] SMTP not configured. Disapproval would be sent to:",
      booking.email
    );
    return false;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await transport.sendMail({
      from: from || "noreply@hirahall.local",
      to: booking.email,
      subject: `Booking Disapproved – ${
        typeLabel[booking.type] || booking.type
      } on ${booking.date}`,
      text: `Dear ${booking.name},\n\nWe regret to inform you that your previously approved booking request has been disapproved.\n\nVenue: ${
        typeLabel[booking.type] || booking.type
      }\nDate: ${booking.date}\nSlot: ${
        slotLabel[booking.slot] || booking.slot
      }\nSubject: ${booking.subject || "N/A"}\nPurpose: ${
        booking.purpose
      }\n\nIf you have any questions, please contact the administration.\n\nThank you.\n— Hira Hall & Guest House`,
      html: `
        <p>Dear ${booking.name},</p>
        <p>We regret to inform you that your <strong>previously approved</strong> booking request has been <strong>disapproved</strong>.</p>
        <ul>
          <li><strong>Venue:</strong> ${
            typeLabel[booking.type] || booking.type
          }</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Slot:</strong> ${
            slotLabel[booking.slot] || booking.slot
          }</li>
          <li><strong>Subject:</strong> ${booking.subject || "N/A"}</li>
          <li><strong>Purpose:</strong> ${booking.purpose}</li>
        </ul>
        <p>If you have any questions, please contact the administration.</p>
        <p>Thank you.</p>
        <p>— Hira Hall & Guest House</p>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Email] Disapproval send failed:", err);
    return false;
  }
}
// ADD THESE 3 FUNCTIONS to your existing email.ts file

/**
 * Send OTP for login/register verification
 */
export async function sendOTPEmail(email: string, otp: string, userName?: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log("[Email] SMTP not configured. OTP would be sent to:", email);
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hirahall.local",
      to: email,
      subject: "Your Hira Hall Booking Verification Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; font-size: 28px; font-weight: 800; margin: 0;">Hira Hall & Guest House</h1>
              <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 16px;">Verification Required</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 16px; padding: 32px; text-align: center; margin: 30px 0;">
              <div style="font-size: 48px; font-weight: 800; color: white; letter-spacing: 8px; margin: 0;">${otp}</div>
              <p style="color: rgba(255,255,255,0.9); margin: 16px 0 0 0; font-size: 16px;">Your verification code expires in 10 minutes</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px; margin: 0;">
              Hi ${userName || 'there'},
              <br/><br/>
              Use the code above to verify your ${email.includes('@student') ? 'student account' : 'account'}.
              <br/><br/>
              Didn't request this? Ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;" />
            <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin: 0;">
              © 2026 Hira Hall & Guest House
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Email] OTP send failed:", err);
    return false;
  }
}

/**
 * Send password reset OTP
 */
export async function sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log("[Email] SMTP not configured. Reset OTP would be sent to:", email);
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hirahall.local",
      to: email,
      subject: "Reset Your Hira Hall Booking Password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <h1 style="color: #DC2626; font-size: 28px; font-weight: 800; margin: 0; text-align: center;">Password Reset</h1>
            
            <div style="background: linear-gradient(135deg, #DC2626, #EF4444); border-radius: 16px; padding: 32px; text-align: center; margin: 30px 0;">
              <div style="font-size: 48px; font-weight: 800; color: white; letter-spacing: 8px; margin: 0;">${otp}</div>
              <p style="color: rgba(255,255,255,0.9); margin: 16px 0 0 0; font-size: 16px;">Your password reset code (expires in 10 minutes)</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Use this code to reset your password. If you didn't request this, ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;" />
            <p style="color: #9CA3AF; font-size: 14px; text-align: center;">
              © 2026 Hira Hall & Guest House
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Email] Reset OTP send failed:", err);
    return false;
  }
}
