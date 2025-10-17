'use client';

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Refresh the session every 5 minutes to prevent it from expiring
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}