'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Enhanced Debug component for checking authentication status and cookies
 */
export function AuthDebug() {
  const { data: session, status, update } = useSession();
  const [cookieDetails, setCookieDetails] = useState<string | null>(null);
  const [allCookies, setAllCookies] = useState<string[]>([]);
  
  const checkCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(';').map(c => c.trim());
    setAllCookies(cookies);
    
    // Check for NextAuth session tokens
    const productionToken = cookies.find(c => c.startsWith('__Secure-next-auth.session-token='));
    const developmentToken = cookies.find(c => c.startsWith('next-auth.session-token='));
    const callbackUrl = cookies.find(c => c.startsWith('next-auth.callback-url='));
    
    if (productionToken) {
      setCookieDetails('Production session token exists (with __Secure- prefix)');
    } else if (developmentToken) {
      setCookieDetails('Development session token exists');
    } else if (callbackUrl) {
      setCookieDetails('Only callback URL cookie found, no session token');
    } else {
      setCookieDetails('No NextAuth cookies found');
    }
  };
  
  // Check cookies on mount and when status changes
  useEffect(() => {
    checkCookies();
    
    // Create an interval to keep checking (useful for debugging)
    const interval = setInterval(checkCookies, 3000);
    return () => clearInterval(interval);
  }, [status]);
  
  // Helper to refresh the session
  const handleRefresh = async () => {
    try {
      await update();
      checkCookies();
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="p-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md">
        <p className="font-medium mb-1">Checking authentication status...</p>
        <p className="text-xs opacity-80">{cookieDetails}</p>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">Not authenticated</p>
            <p className="text-sm mt-1">{cookieDetails}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        
        {allCookies.length > 0 ? (
          <details className="mt-3">
            <summary className="text-xs cursor-pointer hover:underline">Show all cookies</summary>
            <div className="mt-2 p-2 bg-black/20 rounded text-xs">
              <ul className="list-disc pl-4 space-y-1">
                {allCookies.map((cookie, i) => (
                  <li key={i}>{cookie}</li>
                ))}
              </ul>
            </div>
          </details>
        ) : (
          <p className="text-xs mt-2">No cookies found</p>
        )}
      </div>
    );
  }
  
  // Authenticated state
  return (
    <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">Authenticated as: {session?.user?.name || session?.user?.email}</p>
          <p className="text-sm">Role: {session?.user?.role || 'user'}</p>
          <p className="text-xs mt-1">{cookieDetails}</p>
          {session?.expires && (
            <p className="text-xs mt-1">
              Expires: {new Date(session.expires).toLocaleString()}
            </p>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="text-xs bg-green-500/20 hover:bg-green-500/30 px-2 py-1 rounded"
        >
          Refresh
        </button>
      </div>
      
      <details className="mt-3">
        <summary className="text-xs cursor-pointer hover:underline">Session details</summary>
        <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(session, null, 2)}
        </pre>
      </details>
      
      {allCookies.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs cursor-pointer hover:underline">All cookies</summary>
          <div className="mt-2 p-2 bg-black/20 rounded text-xs">
            <ul className="list-disc pl-4 space-y-1">
              {allCookies.map((cookie, i) => (
                <li key={i}>{cookie}</li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}