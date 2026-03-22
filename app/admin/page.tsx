"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations";
import { useAutoLogout } from "@/app/hooks/useAutoLogout";
import Image from "next/image";
export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });
 const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
useAutoLogout();
  // ✅ FIXED: Proper auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies
        });
        
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

  const onSubmit = async (data: AdminLoginInput) => {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json?.error || "Login failed.");
      return;
    }
    sessionStorage.setItem("adminEmail", json.email);
    sessionStorage.setItem("adminIsSuperAdmin", String(json.isSuperAdmin));
    sessionStorage.setItem("admin", "true");
    router.push("/admin/dashboard");
  };

  return (
     <>
                <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden">
                <Image
                  src="/NIT-Raipur-Aerial-view.png"
                  alt="NIT Raipur Campus"
                  fill
                  sizes="100vw"
                  className="object-cover brightness-75"
                  priority
                />
              </div>
              <div className="fixed inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 -z-10"></div>
                <main className="min-h-screen w-full relative z-10 flex items-center justify-center">
      <div className="w-full max-w-sm glass rounded-2xl p-8 shadow-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-royal font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <h1 className="text-2xl font-bold text-royal">Admin Login</h1>
        <p className="text-slate-600 text-sm mt-1 mb-6">
          Sign in with your admin email and password.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-royal focus:ring-2 focus:ring-royal/20"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-soft-red">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
    </>
  );
}