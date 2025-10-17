'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { AuthDebug } from '@/components/auth-debug';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AuthDebugPage() {
  const { data: session, status, update } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  
  // Function to check server-side session
  const checkServerSession = async () => {
    try {
      setIsCheckingServer(true);
      const res = await fetch('/api/debug/auth-test');
      const data = await res.json();
      setServerStatus(data);
    } catch (error) {
      setServerStatus({ error: String(error) });
    } finally {
      setIsCheckingServer(false);
    }
  };
  
  // Direct sign in function
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      setResult(res);
      
      if (res?.ok) {
        // Refresh session
        await update();
      }
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  
  // GitHub sign in
  const handleGithubSignIn = () => {
    // Force hard navigation for OAuth flow
    window.location.href = '/api/auth/signin/github?callbackUrl=/debug/auth';
  };
  
  // Clear all cookies
  const clearCookies = () => {
    const cookies = document.cookie.split(";");
    
    for (const cookie of cookies) {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    
    // Clear localStorage items related to auth
    localStorage.removeItem('next-auth.csrf-token');
    localStorage.removeItem('next-auth.callback-url');
    localStorage.removeItem('next-auth.state');
    
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">NextAuth.js Debugging Tool</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-black/80 border border-white/20 text-white">
          <h2 className="text-xl font-bold mb-4">Auth Status</h2>
          
          <div className="mb-6">
            <AuthDebug />
          </div>
          
          <h3 className="font-medium mb-2">Session Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => update()}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={status === 'loading'}
            >
              Refresh Session
            </Button>
            
            {status === 'authenticated' ? (
              <Button 
                onClick={() => signOut({ redirect: false })}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Sign In Page
              </Button>
            )}
            
            <Button
              onClick={clearCookies}
              variant="outline"
              className="border-white/20 text-red-400 hover:bg-red-950/30"
            >
              Clear All Auth Data
            </Button>
          </div>
        </Card>
        
        <Card className="p-6 bg-black/80 border border-white/20 text-white">
          <h2 className="text-xl font-bold mb-4">Test Authentication</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-1" htmlFor="debug-email">Email</label>
              <input
                id="debug-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1" htmlFor="debug-password">Password</label>
              <input
                id="debug-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            </div>
            
            <Button 
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Signing In...' : 'Test Credentials Sign In'}
            </Button>
            
            <Button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-700"
            >
              Test GitHub Sign In
            </Button>
          </div>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Client Sign In Result:</h3>
              <pre className="bg-black/40 p-3 rounded overflow-auto max-h-40 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </Card>
        
        <Card className="p-6 bg-black/80 border border-white/20 text-white lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Server-Side Authentication Check</h2>
          
          <div className="mb-4 flex items-center gap-4">
            <Button
              onClick={checkServerSession}
              disabled={isCheckingServer}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCheckingServer ? 'Checking...' : 'Check Server Session'}
            </Button>
            
            <div className="text-sm text-white/70">
              This checks authentication directly from the server without any client-side state.
            </div>
          </div>
          
          {serverStatus && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Server Status:</h3>
              <pre className="bg-black/40 p-3 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(serverStatus, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-8 bg-black/80 border border-white/20 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Guide</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Make sure your <code className="bg-black/50 px-1 rounded text-purple-300">.env.local</code> file has the correct <code className="bg-black/50 px-1 rounded text-purple-300">NEXTAUTH_SECRET</code> variable.</li>
          <li>If using <code className="bg-black/50 px-1 rounded text-purple-300">__Secure-</code> prefix for cookies, ensure the site is served over HTTPS.</li>
          <li>Check that <code className="bg-black/50 px-1 rounded text-purple-300">NEXTAUTH_URL</code> is properly set in your environment.</li>
          <li>Try clearing all cookies and local storage items and signing in again.</li>
          <li>When using credentials provider, ensure password comparison is working correctly.</li>
        </ul>
      </div>
    </div>
  );
}