"use client";
import Link from "next/link";
import { Building2, Home, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ NIT Background - Full screen */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(/NIT-Raipur-Aerial-view.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-900/30 via-slate-800/20 to-slate-900/30 -z-10"></div>
      
      <main className="min-h-screen w-full flex flex-col relative z-10">
        {/* Header */}
        <header className="pt-16 pb-12 px-4 text-center 
  /* ✅ TRANSPARENT GLASS */
   backdrop-xl 
  
  relative z-20">
  <div className="absolute top-6 right-6">
    <LogoutButton />
  </div>
  <div className="max-w-4xl mx-auto">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 
      drop-shadow-2xl bg-gradient-to-r from-white to-slate-100 bg-clip-text text-transparent">
      Welcome to Hira Hall & Guest House
    </h1>
    <p className="mt-4 text-white/95 text-lg md:text-xl max-w-2xl mx-auto 
      leading-relaxed drop-shadow-2xl">
      Book venues for your academic and institutional events
    </p>
  </div>
</header>


        {/* Quick Actions */}
        <section className="px-4 py-16 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* ✅ HIRA HALL - Fixed Image */}
            <Link href="/book/hall" className="group relative rounded-3xl h-80 w-full shadow-2xl hover:shadow-3xl border-2 border-white/50 hover:border-indigo-400/70 overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl hover:scale-[1.02] transition-all duration-500">
              {/* Background Image */}
              <Image
                src="/Hira Lounge.jpg"
                alt="Hira Hall"
                fill
                className="object-cover brightness-50 group-hover:brightness-75 transition-all duration-500"
                priority
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white z-20">
                {/* <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/40">
                  <Building2 className="w-10 h-10 text-indigo-200 drop-shadow-lg" />
                </div> */}
                <h2 className="text-2xl font-bold drop-shadow-2xl mb-2">Hira Hall</h2>
                <p className="text-white/90 text-sm drop-shadow-lg">First Half, Second Half, Full Day</p>
              </div>
            </Link>

            {/* ✅ ARCHITECTURE HALL - Fixed Image */}
            <Link href="/book/architecture-hall" className="group relative rounded-3xl h-80 w-full shadow-2xl hover:shadow-3xl border-2 border-white/50 hover:border-sky-400/70 overflow-hidden bg-gradient-to-br from-sky-500/10 to-emerald-500/10 backdrop-blur-xl hover:scale-[1.02] transition-all duration-500">
              <Image
                src="/architecture-hall.jpg"
                alt="Architecture Hall"
                fill
                className="object-cover brightness-50 group-hover:brightness-75 transition-all duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white z-20">
                {/* <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/40">
                  <Building className="w-10 h-10 text-sky-200 drop-shadow-lg" />
                </div> */}
                <h2 className="text-2xl font-bold drop-shadow-2xl mb-2">Architecture Hall</h2>
                <p className="text-white/90 text-sm drop-shadow-lg">First Half, Second Half, Full Day</p>
              </div>
            </Link>

            {/* ✅ GUEST HOUSE - Fixed Image */}
            <Link href="/book/guest-house" className="group relative rounded-3xl h-80 w-full shadow-2xl hover:shadow-3xl border-2 border-white/50 hover:border-emerald-400/70 overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl hover:scale-[1.02] transition-all duration-500">
              <Image
                src="/guest-house.jpg"
                alt="Guest House"
                fill
                className="object-cover brightness-50 group-hover:brightness-75 transition-all duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white z-20">
                {/* <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/40">
                  <Home className="w-10 h-10 text-emerald-200 drop-shadow-lg" />
                </div> */}
                <h2 className="text-2xl font-bold drop-shadow-2xl mb-2">Guest House</h2>
                <p className="text-white/90 text-sm drop-shadow-lg">Full Day bookings for extended stays</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="py-8 px-4 text-center 
  /* ✅ TRANSPARENT GLASS */
   backdrop-xl 
  
  relative z-20">
  <Link href="/admin" className="text-white/95 hover:text-indigo-200 
    font-semibold text-lg transition-all duration-300 hover:underline 
    drop-shadow-lg hover:drop-shadow-xl">
    Admin Portal →
  </Link>
</footer>

      </main>
    </>
  );
}
