"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";

// Define types for database response
interface DbUserRecord {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
  createdAt?: Date;
}

interface DbAccountRecord {
  provider: string;
  providerAccountId: string;
  userId: string;
  type: string;
  createdAt?: Date;
}

interface DbSessionRecord {
  userId: string;
  expires: string;
  sessionToken: string;
}

interface DbResponse {
  success: boolean;
  users?: DbUserRecord[];
  accounts?: DbAccountRecord[];
  sessions?: DbSessionRecord[];
  error?: string;
}

export default function AuthDebugPanel() {
  const { data: session, status } = useSession();
  const [dbData, setDbData] = useState<DbResponse | null>(null);
  // Define MongoDB status response type
  interface MongoDbStatus {
    success: boolean;
    mongodbConnected: boolean;
    database?: string;
    collections?: string[];
    requiredCollections?: string[];
    missingCollections?: string[];
    documentCounts?: Record<string, number>;
    error?: string;
  }
  
  const [mongoStatus, setMongoStatus] = useState<MongoDbStatus | null>(null);
  
  // Server session check state
  interface ServerSessionResponse {
    authenticated: boolean;
    session: {
      expires: string;
      user: {
        name?: string;
        email?: string;
        role?: string;
      };
    } | null;
    timestamp: string;
    error?: string;
  }
  
  const [serverSession, setServerSession] = useState<ServerSessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mongoLoading, setMongoLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mongoError, setMongoError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const fetchDbData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/debug/auth');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setDbData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching auth debug data:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkMongoConnection = async () => {
    try {
      setMongoLoading(true);
      setMongoError(null);
      const response = await fetch('/api/debug/mongodb');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMongoStatus(data);
    } catch (err) {
      setMongoError(err instanceof Error ? err.message : String(err));
      console.error("Error checking MongoDB connection:", err);
    } finally {
      setMongoLoading(false);
    }
  };
  
  const checkServerSession = async () => {
    try {
      setSessionLoading(true);
      setSessionError(null);
      const response = await fetch('/api/debug/session');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setServerSession(data);
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
      console.error("Error checking server session:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    // Don't auto-fetch to avoid unnecessary DB calls
    // User will click button to fetch
  }, []);

  return (
    <Card className="p-6 bg-gray-50 dark:bg-gray-900 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Authentication Debug Panel</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Session Information</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md">
          <p><strong>Status:</strong> {status}</p>
          {session ? (
            <div className="mt-2">
              <p><strong>User:</strong> {session.user?.name || 'N/A'} ({session.user?.email || 'No email'})</p>
              <p><strong>Role:</strong> {session.user?.role || 'Not defined'}</p>
              <p><strong>Expires:</strong> {session.expires}</p>
              <details>
                <summary className="cursor-pointer text-blue-500">Raw Session Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="mt-2 text-red-500">No active session</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">MongoDB Connection</h3>
        <button
          onClick={checkMongoConnection}
          className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          disabled={mongoLoading}
        >
          {mongoLoading ? 'Checking...' : 'Check MongoDB Connection'}
        </button>
        
        {mongoError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {mongoError}
          </div>
        )}
        
        {mongoStatus && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-md">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${mongoStatus.mongodbConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h4 className="font-medium">Connection Status: {mongoStatus.mongodbConnected ? 'Connected' : 'Disconnected'}</h4>
            </div>
            
            {mongoStatus.mongodbConnected && (
              <>
                <p><strong>Database:</strong> {mongoStatus.database}</p>
                
                <div className="mt-4">
                  <h5 className="font-medium">NextAuth Collections:</h5>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {mongoStatus.requiredCollections?.map(name => (
                      <li key={name} className={`${mongoStatus.collections?.includes(name) ? 'text-green-600' : 'text-red-600'}`}>
                        {name}: {mongoStatus.collections?.includes(name) 
                          ? `${mongoStatus.documentCounts?.[name] || 0} documents` 
                          : 'Missing'}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {mongoStatus.missingCollections && mongoStatus.missingCollections.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                    <p className="font-medium">Warning: Missing Collections</p>
                    <p>The following required NextAuth collections are missing: {mongoStatus.missingCollections.join(", ")}</p>
                    <p className="mt-2">This could indicate that no users have signed in yet or there might be an issue with NextAuth setup.</p>
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-500">Raw MongoDB Status</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                    {JSON.stringify(mongoStatus, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Database Records</h3>
        <button
          onClick={fetchDbData}
          className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Database Records'}
        </button>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        {dbData && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Users Collection ({dbData.users ? dbData.users.length : 0})</h4>
              {dbData.users && dbData.users.length > 0 ? (
                <details>
                  <summary className="cursor-pointer text-blue-500">Show Users</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                    {JSON.stringify(dbData.users, null, 2)}
                  </pre>
                </details>
              ) : (
                <p className="text-gray-500">No user records found</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Accounts Collection ({dbData.accounts ? dbData.accounts.length : 0})</h4>
              {dbData.accounts && dbData.accounts.length > 0 ? (
                <details>
                  <summary className="cursor-pointer text-blue-500">Show Accounts</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                    {JSON.stringify(dbData.accounts, null, 2)}
                  </pre>
                </details>
              ) : (
                <p className="text-gray-500">No account records found</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Sessions Collection ({dbData.sessions ? dbData.sessions.length : 0})</h4>
              {dbData.sessions && dbData.sessions.length > 0 ? (
                <details>
                  <summary className="cursor-pointer text-blue-500">Show Sessions</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                    {JSON.stringify(dbData.sessions, null, 2)}
                  </pre>
                </details>
              ) : (
                <p className="text-gray-500">No session records found</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Server-Side Session Check</h3>
        <button
          onClick={checkServerSession}
          className="mb-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
          disabled={sessionLoading}
        >
          {sessionLoading ? 'Checking...' : 'Check Server Session'}
        </button>
        
        {sessionError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {sessionError}
          </div>
        )}
        
        {serverSession && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${serverSession.authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h4 className="font-medium">Authentication Status: {serverSession.authenticated ? 'Authenticated' : 'Not Authenticated'}</h4>
            </div>
            
            <p><strong>Server Time:</strong> {serverSession.timestamp}</p>
            
            {serverSession.session ? (
              <div className="mt-2">
                <p><strong>User:</strong> {serverSession.session.user?.name || 'N/A'} ({serverSession.session.user?.email || 'No email'})</p>
                <p><strong>Role:</strong> {serverSession.session.user?.role || 'Not defined'}</p>
                <p><strong>Expires:</strong> {serverSession.session.expires}</p>
              </div>
            ) : (
              <p className="mt-2 text-amber-500">No session data on server</p>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-500">Raw Server Session Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 overflow-auto rounded text-xs">
                {JSON.stringify(serverSession, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Auth Storage</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Cookies</h4>
            <p className="text-xs text-gray-600 mb-2">
              NextAuth.js with JWT strategy stores session tokens in cookies, not localStorage.
            </p>
            <button
              onClick={() => {
                const cookieInfo = document.cookie
                  .split(';')
                  .map(c => c.trim())
                  .filter(c => c.startsWith('next-auth') || c.startsWith('__Secure-next-auth'))
                  .map(c => {
                    const name = c.split('=')[0];
                    return { name, value: '***** (value hidden for security) *****' };
                  });
                
                // Create a new text area element to display the data
                const textArea = document.createElement('textarea');
                textArea.value = cookieInfo.length > 0 
                  ? JSON.stringify(cookieInfo, null, 2)
                  : 'No NextAuth cookies found. This could indicate you are not signed in.';
                textArea.className = 'w-full h-32 p-2 mt-2 bg-gray-100 dark:bg-gray-700 rounded';
                textArea.readOnly = true;
                
                // Replace existing text area if it exists
                const existingCookieArea = document.getElementById('next-auth-cookies');
                if (existingCookieArea) {
                  existingCookieArea.replaceWith(textArea);
                } else {
                  // Otherwise, append the new one
                  const container = document.getElementById('cookie-container');
                  if (container) {
                    textArea.id = 'next-auth-cookies';
                    container.appendChild(textArea);
                  }
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Check NextAuth Cookies
            </button>
            <div id="cookie-container" className="mt-2"></div>
          </div>
          
          <div>
            <h4 className="font-medium">Local Storage</h4>
            <p className="text-xs text-gray-600 mb-2">
              Note: NextAuth.js typically doesn&apos;t use localStorage for session tokens with default settings.
              Local storage is sometimes used for temporary state like callback URLs.
            </p>
            <button
              onClick={() => {
                const nextAuthItems = Object.keys(localStorage)
                  .filter(key => key.startsWith('next-auth'))
                  .reduce((obj: Record<string, string>, key) => {
                    obj[key] = localStorage.getItem(key) || '';
                    return obj;
                  }, {});
                
                // Create a new text area element to display the data
                const textArea = document.createElement('textarea');
                textArea.value = Object.keys(nextAuthItems).length > 0
                  ? JSON.stringify(nextAuthItems, null, 2)
                  : 'No NextAuth items found in localStorage. This is normal when using cookie-based sessions.';
                textArea.className = 'w-full h-32 p-2 mt-2 bg-gray-100 dark:bg-gray-700 rounded';
                textArea.readOnly = true;
                
                // Replace existing text area if it exists
                const existingTextArea = document.getElementById('next-auth-local-storage');
                if (existingTextArea) {
                  existingTextArea.replaceWith(textArea);
                } else {
                  // Otherwise, append the new one
                  const container = document.getElementById('local-storage-container');
                  if (container) {
                    textArea.id = 'next-auth-local-storage';
                    container.appendChild(textArea);
                  }
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Check NextAuth Local Storage
            </button>
            <div id="local-storage-container" className="mt-2"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}