"use client";
import { useEffect } from "react";

export function useAutoLogout() {
  useEffect(() => {
    // ✅ Session cookies handle logout automatically!
    // No need to do anything here
    
    console.log("✅ Session management: Cookies handle browser close");
  }, []);
}
