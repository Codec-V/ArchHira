import Link from "next/link";
import { Building2, Home } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="pt-12 pb-8 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-royal drop-shadow-sm">
          Hira Hall & Guest House
        </h1>
        <p className="mt-2 text-slate-600 text-lg max-w-xl mx-auto">
          Book venues for your academic and institutional events
        </p>
      </header>

      {/* Glassmorphism cards */}
      <section className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 px-4 pb-16">
        <Link
          href="/book/hall"
          className="glass rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4
                     hover:scale-[1.02] transition-transform duration-200 shadow-lg hover:shadow-xl
                     border-2 border-transparent hover:border-royal/30"
        >
          <div className="w-20 h-20 rounded-full bg-royal/10 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-royal" />
          </div>
          <h2 className="text-xl font-semibold text-royal">Book Hira Hall</h2>
          <p className="text-slate-600 text-center text-sm">
            First Half, Second Half, or Full Day
          </p>
        </Link>

        <Link
          href="/book/guest-house"
          className="glass rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4
                     hover:scale-[1.02] transition-transform duration-200 shadow-lg hover:shadow-xl
                     border-2 border-transparent hover:border-royal/30"
        >
          <div className="w-20 h-20 rounded-full bg-royal/10 flex items-center justify-center">
            <Home className="w-10 h-10 text-royal" />
          </div>
          <h2 className="text-xl font-semibold text-royal">Book Guest House</h2>
          <p className="text-slate-600 text-center text-sm">
            Full Day bookings only
          </p>
        </Link>
      </section>

      <footer className="py-4 text-center text-slate-500 text-sm">
        <Link href="/admin" className="underline hover:text-royal">Admin</Link>
      </footer>
    </main>
  );
}
