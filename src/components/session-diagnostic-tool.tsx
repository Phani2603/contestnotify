'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SessionDiagnosticTool() {
  const { data: session, status, update } = useSession();
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [allCookies, setAllCookies] = useState<string[]>([]);

  // Get all cookies
  const getCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    setAllCookies(cookies);
    return cookies;
  };

  // Run full diagnostics
  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResults(null);

    try {
      // Step 1: Check client-side status
      const clientStatus = {
        authenticated: status === 'authenticated',
        status,
        sessionExists: !!session,
        userEmail: session?.user?.email || 'N/A',
        expires: session?.expires || 'N/A'
      };

      // Step 2: Check cookies
      const cookies = getCookies();
      const authCookies = cookies.filter(c => 
        c.startsWith('next-auth') || c.startsWith('__Secure-next-auth')
      );

      // Step 3: Check server-side status
      let serverStatus;
      try {
        const res = await fetch('/api/debug/auth-test');
        serverStatus = await res.json();
      } catch (error) {
        serverStatus = { error: String(error) };
      }

      // Step 4: Check localStorage
      const localStorageItems = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('next-auth')) {
          localStorageItems[key] = localStorage.getItem(key);
        }
      }

      // Step 5: Check issues
      const issues = [];
      
      if (!clientStatus.authenticated) {
        issues.push('Client not authenticated');
      }
      
      if (authCookies.length === 0) {
        issues.push('No NextAuth cookies found');
      }
      
      if (serverStatus && !serverStatus.tokenAuth?.authenticated) {
        issues.push('Server-side token authentication failed');
      }
      
      if (serverStatus && !serverStatus.sessionAuth?.authenticated) {
        issues.push('Server-side session authentication failed');
      }

      // Assemble results
      setDiagnosticResults({
        timestamp: new Date().toISOString(),
        client: clientStatus,
        cookies: {
          all: cookies,
          auth: authCookies,
        },
        localStorage: localStorageItems,
        server: serverStatus,
        issues,
        recommendations: generateRecommendations(issues, serverStatus, authCookies)
      });
    } catch (error) {
      console.error("Diagnostic error:", error);
      setDiagnosticResults({
        error: String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Generate recommendations based on issues
  const generateRecommendations = (issues, serverStatus, authCookies) => {
    const recommendations = [];
    
    if (issues.includes('No NextAuth cookies found')) {
      recommendations.push({
        issue: 'Missing authentication cookies',
        solution: 'Try clearing all cookies and sign in again with a hard refresh.'
      });
    }
    
    if (issues.includes('Server-side token authentication failed')) {
      recommendations.push({
        issue: 'Server cannot validate token',
        solution: 'Check if NEXTAUTH_SECRET is properly set in .env.local.'
      });
    }
    
    if (authCookies.some(c => c.startsWith('__Secure-')) && location.protocol !== 'https:') {
      recommendations.push({
        issue: 'Using __Secure- cookie prefix with HTTP',
        solution: 'Remove __Secure- prefix for local development or use HTTPS.'
      });
    }
    
    if (serverStatus?.environment?.NEXTAUTH_URL !== location.origin) {
      recommendations.push({
        issue: 'NEXTAUTH_URL mismatch',
        solution: `Set NEXTAUTH_URL to ${location.origin} in your .env.local file.`
      });
    }
    
    if (recommendations.length === 0 && issues.length > 0) {
      recommendations.push({
        issue: 'General authentication issues',
        solution: 'Try using the debug page to test authentication with different methods.'
      });
    }
    
    return recommendations;
  };

  // Run diagnostics on mount
  useEffect(() => {
    getCookies();
  }, []);

  return (
    <Card className="p-6 bg-black/80 border border-white/20 text-white">
      <h2 className="text-xl font-bold mb-4">Session Diagnostic Tool</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Running...' : 'Run Full Diagnostics'}
        </Button>
        
        <div className="text-sm">
          Status: <span className={
            status === 'authenticated' ? 'text-green-400' :
            status === 'loading' ? 'text-yellow-400' : 'text-red-400'
          }>{status}</span>
        </div>
      </div>

      {diagnosticResults && (
        <div>
          {diagnosticResults.issues?.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md">
              <h3 className="font-medium text-red-400 mb-2">Issues Detected:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-300">
                {diagnosticResults.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnosticResults.recommendations?.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-md">
              <h3 className="font-medium text-yellow-400 mb-2">Recommendations:</h3>
              {diagnosticResults.recommendations.map((rec, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium text-sm">{rec.issue}</p>
                  <p className="text-sm text-yellow-300/80">{rec.solution}</p>
                </div>
              ))}
            </div>
          )}

          {diagnosticResults.issues?.length === 0 && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-md">
              <h3 className="font-medium text-green-400">All checks passed!</h3>
              <p className="text-sm text-green-300/80 mt-1">Authentication appears to be working correctly.</p>
            </div>
          )}

          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium hover:text-blue-400">
              Authentication Details
            </summary>
            <div className="mt-3 p-3 bg-black/30 rounded-md text-xs">
              <h4 className="font-medium mb-1">Client Status:</h4>
              <pre className="overflow-auto mb-3 pl-3">
                {JSON.stringify(diagnosticResults.client, null, 2)}
              </pre>
              
              <h4 className="font-medium mb-1">Server Status:</h4>
              <pre className="overflow-auto mb-3 pl-3">
                {JSON.stringify(diagnosticResults.server, null, 2)}
              </pre>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer text-sm font-medium hover:text-blue-400">
              Cookies & Storage
            </summary>
            <div className="mt-3 p-3 bg-black/30 rounded-md text-xs">
              <h4 className="font-medium mb-1">Auth Cookies:</h4>
              <ul className="list-disc pl-5 mb-3">
                {diagnosticResults.cookies.auth.length > 0 ? (
                  diagnosticResults.cookies.auth.map((cookie, i) => (
                    <li key={i}>{cookie}</li>
                  ))
                ) : (
                  <li className="text-red-400">No auth cookies found</li>
                )}
              </ul>
              
              <h4 className="font-medium mb-1">LocalStorage Auth Items:</h4>
              <pre className="overflow-auto pl-3">
                {JSON.stringify(diagnosticResults.localStorage, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {!diagnosticResults && allCookies.length > 0 && (
        <div className="text-sm text-white/70">
          <p className="mb-2">Found {allCookies.length} total cookies</p>
          <p>Run diagnostics for complete assessment</p>
        </div>
      )}
    </Card>
  );
}