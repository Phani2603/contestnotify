'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AuthDebug } from './auth-debug';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [redirecting, setRedirecting] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  useEffect(() => {
    // Enhanced debugging
    console.log("ProtectedRoute - Auth status:", status);
    console.log("ProtectedRoute - Session data:", session ? {
      user: session.user,
      expires: session.expires
    } : "No session");
    
    // If the user is not authenticated and the status is not loading
    if (status === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to signin with hard navigation");
      setRedirecting(true);
      
      // Use window.location for a hard redirect to ensure session revalidation
      // This is more reliable than router.push for authentication issues
      const callbackUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
    }
    
    // Mark auth check as complete when we have a definitive status
    if (status !== 'loading') {
      setAuthCheckComplete(true);
    }
  }, [status, session]);

  // Loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/[0.96]">
        <div className="animate-pulse text-white text-xl mb-4">Loading session...</div>
        <div className="text-white/60 text-sm">Verifying authentication status...</div>
      </div>
    );
  }

  // Redirecting state
  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/[0.96]">
        <div className="text-white text-xl mb-4">Redirecting to login...</div>
        <div className="text-white/60 text-sm mb-4">You need to sign in to access this page</div>
        <div className="max-w-md w-full">
          <AuthDebug />
        </div>
      </div>
    );
  }

  // Authentication check completed and authenticated
  if (authCheckComplete && status === 'authenticated') {
    return <>{children}</>;
  }

  // Default state - should only briefly appear
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black/[0.96]">
      <div className="text-white text-xl mb-4">Verifying authentication...</div>
      <div className="max-w-md w-full">
        <AuthDebug />
      </div>
    </div>
  );
}