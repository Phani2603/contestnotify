"use client";

import AuthDebugPanel from "@/components/ui/auth-debug-panel";
import ApiDebugger from "@/components/api-debugger";
import { useSession } from "next-auth/react";
import { useState } from "react";

// Define the middleware test response type
interface MiddlewareTestResponse {
  timestamp: string;
  middlewareTest: string;
  nextAuthConfig: {
    baseUrl: string;
    secretSet: boolean;
    githubConfigured: boolean;
    dbConfigured: boolean;
  };
}

export default function DebugPage() {
  // We're only using status from useSession
  const { status } = useSession();
  const [middlewareTest, setMiddlewareTest] = useState<MiddlewareTestResponse | null>(null);
  const [middlewareLoading, setMiddlewareLoading] = useState(false);
  const [middlewareError, setMiddlewareError] = useState<string | null>(null);

  const testMiddleware = async () => {
    try {
      setMiddlewareLoading(true);
      setMiddlewareError(null);
      const response = await fetch('/api/debug/middleware-test');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMiddlewareTest(data);
    } catch (err) {
      setMiddlewareError(err instanceof Error ? err.message : String(err));
      console.error("Error testing middleware:", err);
    } finally {
      setMiddlewareLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-md">
        <p className="font-medium">⚠️ Warning</p>
        <p>This page is for development and debugging purposes only. It exposes sensitive session information and should not be deployed to production.</p>
      </div>
      
      <div className="mb-6 flex items-center gap-3">
        <a 
          href="/debug/troubleshoot" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <span className="mr-2">📋</span>
          Troubleshooting Guide
        </a>
        
        <a 
          href="/debug/troubleshooting.md" 
          target="_blank" 
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <span className="mr-2">�</span>
          Raw Markdown
        </a>
        
        <a 
          href="https://next-auth.js.org/getting-started/example" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          <span className="mr-2">📚</span>
          NextAuth.js Docs
        </a>
      </div>
      
      <AuthDebugPanel />
      
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
        <ApiDebugger />
      </div>
      
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Middleware Test</h2>
        <p className="mb-4">Test if the NextAuth middleware is correctly configured to allow API routes while protecting pages.</p>
        <button
          onClick={testMiddleware}
          className="mb-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
          disabled={middlewareLoading}
        >
          {middlewareLoading ? 'Testing...' : 'Test Middleware Configuration'}
        </button>
        
        {middlewareError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="font-bold">Middleware Error:</p>
            <p>{middlewareError}</p>
            <p className="mt-2">
              This likely means your middleware is blocking API routes. Make sure to update your middleware
              to skip API routes with a condition like: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">if (req.nextUrl.pathname.startsWith(&apos;/api/&apos;))</code>
            </p>
          </div>
        )}
        
        {middlewareTest && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
              <h4 className="font-medium">API Route Accessible</h4>
            </div>
            <p className="mb-2">{middlewareTest.middlewareTest}</p>
            <h5 className="font-medium mt-4 mb-2">NextAuth Configuration:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li className={middlewareTest.nextAuthConfig.baseUrl !== "Not set" ? "text-green-600" : "text-red-600"}>
                Base URL: {middlewareTest.nextAuthConfig.baseUrl}
              </li>
              <li className={middlewareTest.nextAuthConfig.secretSet ? "text-green-600" : "text-red-600"}>
                Secret: {middlewareTest.nextAuthConfig.secretSet ? "Set ✅" : "Not set ❌"}
              </li>
              <li className={middlewareTest.nextAuthConfig.githubConfigured ? "text-green-600" : "text-red-600"}>
                GitHub Provider: {middlewareTest.nextAuthConfig.githubConfigured ? "Configured ✅" : "Not configured ❌"}
              </li>
              <li className={middlewareTest.nextAuthConfig.dbConfigured ? "text-green-600" : "text-red-600"}>
                Database: {middlewareTest.nextAuthConfig.dbConfigured ? "Configured ✅" : "Not configured ❌"}
              </li>
            </ul>
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-500">Raw Middleware Test Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                {JSON.stringify(middlewareTest, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
        <ApiDebugger />
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Authentication Information</h2>
        <div className="mb-4">
          <p><strong>Current Status:</strong> {status}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Environment Check</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Node Environment: {process.env.NODE_ENV}</li>
              {/* Only include client-safe environment variables with NEXT_PUBLIC_ prefix */}
              <li>CLIST API Username: {process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓ Set' : '❌ Not set'}</li>
              <li>CLIST API Key: {process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓ Set' : '❌ Not set'}</li>
              <li>Auth Config: {status === 'authenticated' ? '✓ Working' : '❌ Not configured or not logged in'}</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">HTTP Headers & Cookies</h3>
            <p>Check your browser&apos;s developer tools to inspect headers and cookies related to authentication.</p>
            <ul className="mt-4 list-disc pl-5 space-y-1">
              <li>Cookie: next-auth.session-token</li>
              <li>Cookie: next-auth.callback-url</li>
              <li>Cookie: next-auth.csrf-token</li>
              <li>LocalStorage: next-auth.callback-url</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}