import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hira Hall & Guest House Booking",
  description: "Book Hira Hall or Guest House for your events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      >
        {children}
      </body>
    </html>
  );
}
