'use client';

import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/dashboard/user-profile";
import { ProtectedRoute } from "@/components/protected-route";
import { SessionIndicator } from "@/components/dashboard/session-indicator";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [serverSessionData, setServerSessionData] = useState<any>(null);
  const [serverSessionError, setServerSessionError] = useState<string | null>(null);

  // Enhanced sign out with hard navigation
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // Use hard navigation to ensure clean state
    window.location.href = '/';
  };

  // Function to manually refresh the session
  const handleRefreshSession = async () => {
    try {
      await updateSession();
      console.log("Session refreshed");
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  // Function to check server-side session state
  const checkServerSession = async () => {
    setIsCheckingServer(true);
    setServerSessionData(null);
    setServerSessionError(null);
    
    try {
      const res = await fetch('/api/debug/session');
      const data = await res.json();
      setServerSessionData(data);
    } catch (error) {
      setServerSessionError(
        error instanceof Error ? error.message : "Unknown error checking server session"
      );
    } finally {
      setIsCheckingServer(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black/[0.96] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-2">
              <Button onClick={handleRefreshSession} variant="outline" size="sm">
                Refresh Session
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Session status indicator */}
          <SessionIndicator />

          <UserProfile session={session} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Upcoming Contests</h3>
              <p className="text-white/60">No contests found. Check back later!</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Your Notifications</h3>
              <p className="text-white/60">You have no active notifications set up.</p>
            </div>
          </div>

          {/* Advanced Session Diagnostics */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Authentication Verification</h3>
            <div className="mb-4">
              <p className="text-white/60 mb-2">
                Client session status: <span className={status === 'authenticated' ? 'text-green-400' : 'text-red-400'}>
                  {status}
                </span>
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={checkServerSession} 
                  disabled={isCheckingServer} 
                  variant="outline" 
                  size="sm"
                >
                  {isCheckingServer ? 'Checking...' : 'Check Server Session'}
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/debug/auth'}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                >
                  Open Debug Tools
                </Button>
              </div>
            </div>

            {/* Display server session data */}
            {serverSessionData && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-md overflow-auto max-h-60 text-sm">
                <p className="font-medium mb-1">Server Session Status:</p>
                <p className={serverSessionData.authenticated ? 'text-green-400' : 'text-red-400'}>
                  {serverSessionData.authenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
                <pre className="text-xs text-white/70 mt-2 overflow-auto">
                  {JSON.stringify(serverSessionData, null, 2)}
                </pre>
              </div>
            )}

            {/* Display server session error */}
            {serverSessionError && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-900/30 rounded-md text-red-400 text-sm">
                Error checking server session: {serverSessionError}
              </div>
            )}
            
            {/* Quick links for troubleshooting */}
            <div className="mt-4 text-sm text-white/60">
              <p>Having authentication issues? Try these steps:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <button 
                    className="text-blue-400 hover:underline"
                    onClick={() => window.location.reload()}
                  >
                    Hard refresh the page
                  </button>
                </li>
                <li>
                  <button 
                    className="text-blue-400 hover:underline"
                    onClick={() => {
                      // Clear auth-related cookies
                      document.cookie.split(";").forEach(c => {
                        const name = c.split("=")[0].trim();
                        if (name.startsWith("next-auth") || name.startsWith("__Secure-next-auth")) {
                          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                        }
                      });
                      window.location.href = '/auth/signin';
                    }}
                  >
                    Clear session cookies and sign in again
                  </button>
                </li>
                <li>
                  <a 
                    href="/auth/direct"
                    className="text-blue-400 hover:underline"
                  >
                    Try direct authentication page
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}