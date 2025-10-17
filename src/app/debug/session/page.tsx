'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function SessionDebugPage() {
  const { data: session, status, update } = useSession();
  const [serverSession, setServerSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkServerSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      
      setServerSession(data);
      console.log("Server session data:", data);
    } catch (err) {
      console.error("Error checking server session:", err);
      setError("Failed to check server session");
    } finally {
      setLoading(false);
    }
  };

  const refreshClientSession = () => {
    update();
  };

  return (
    <div className="min-h-screen bg-black/[0.96] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>
            <div className="mb-4">
              <p><strong>Status:</strong> {status}</p>
              {session ? (
                <>
                  <p><strong>User:</strong> {session.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                  <p><strong>Role:</strong> {session.user?.role || 'N/A'}</p>
                  <p><strong>Expires:</strong> {session.expires}</p>
                </>
              ) : (
                <p className="text-red-400">No session data available</p>
              )}
            </div>
            <Button onClick={refreshClientSession}>Refresh Client Session</Button>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Server-Side Session</h2>
            <div className="mb-4">
              {serverSession ? (
                <div>
                  <p><strong>Authenticated:</strong> {serverSession.authenticated ? 'Yes' : 'No'}</p>
                  {serverSession.session ? (
                    <>
                      <p><strong>User:</strong> {serverSession.session.user?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {serverSession.session.user?.email || 'N/A'}</p>
                      <p><strong>Role:</strong> {serverSession.session.user?.role || 'N/A'}</p>
                      <p><strong>Expires:</strong> {serverSession.session.expires}</p>
                    </>
                  ) : (
                    <p className="text-amber-400">No session data on server</p>
                  )}
                  <p className="text-xs mt-2 text-gray-400">Checked at: {serverSession.timestamp}</p>
                </div>
              ) : (
                <p className="text-gray-400">Click button to check server session</p>
              )}
              
              {error && (
                <div className="p-3 mt-2 bg-red-500/10 border border-red-500/20 rounded">
                  Error: {error}
                </div>
              )}
            </div>
            <Button 
              onClick={checkServerSession} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Checking...' : 'Check Server Session'}
            </Button>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Session Debug Tools</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Cookies</h3>
              <Button
                onClick={() => {
                  const cookies = document.cookie.split(';')
                    .map(c => c.trim())
                    .filter(c => c.startsWith('next-auth') || c.startsWith('__Secure-next-auth'))
                    .map(c => {
                      const [name, value] = c.split('=');
                      return { name, exists: true };
                    });
                  
                  console.log('NextAuth cookies:', cookies.length ? cookies : 'None found');
                  alert(cookies.length 
                    ? `Found ${cookies.length} NextAuth cookies: ${cookies.map(c => c.name).join(', ')}` 
                    : 'No NextAuth cookies found');
                }}
              >
                Check NextAuth Cookies
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Clear Session</h3>
              <Button
                variant="destructive"
                onClick={() => {
                  document.cookie.split(";").forEach(c => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                  alert('All cookies cleared. Refresh the page to see changes.');
                }}
              >
                Clear All Cookies
              </Button>
              <p className="text-xs mt-2 text-gray-400">
                This will clear all cookies. You&apos;ll need to sign in again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}