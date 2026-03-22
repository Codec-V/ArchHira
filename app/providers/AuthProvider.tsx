// providers/AuthProvider.tsx
"use client";
import { useTabAuth } from "@/app/hooks/useTabAuth"; // Your hook

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Runs ONCE per tab - covers ALL pages!
  useTabAuth();
  
  return <>{children}</>;
}
