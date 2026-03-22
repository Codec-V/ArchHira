"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Broadcast to ALL tabs
      const channel = new BroadcastChannel('tab-auth');
      channel.postMessage({ type: 'LOGOUT_ALL' });
      channel.close();
      
      // 2. Clear server cookie
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      // 3. Client cleanup
      localStorage.clear();
      sessionStorage.clear();
      
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 bg-white rounded-2xl border-2 border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-100 shadow-lg transition-all hover:scale-105"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  );
}
