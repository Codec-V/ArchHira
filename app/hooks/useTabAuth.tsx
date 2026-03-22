// hooks/useTabAuth.tsx
"use client";
import { useEffect } from 'react';

export function useTabAuth() {
  useEffect(() => {
    const channel = new BroadcastChannel('tab-auth');
    
    // Listen for logout from other tabs
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT_ALL') {
        // Clear storage and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };
    
    channel.addEventListener('message', handleMessage);
    
    // Broadcast logout when THIS tab closes
    const handleBeforeUnload = () => {
      channel.postMessage({ type: 'LOGOUT_ALL' });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      channel.close();
    };
  }, []);
}
