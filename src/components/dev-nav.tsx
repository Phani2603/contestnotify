"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DevNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        title="Developer Tools"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64 overflow-hidden">
          <div className="p-3 bg-amber-500 text-white">
            <h3 className="font-bold">Developer Tools</h3>
            <p className="text-xs opacity-90">Environment: {process.env.NODE_ENV}</p>
          </div>
          
          <div className="p-2">
            <div className="text-xs p-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="font-medium">Auth Status: <span className={
                status === 'authenticated' ? 'text-green-600 dark:text-green-400' :
                status === 'loading' ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }>{status}</span></p>
              {session?.user && (
                <p className="truncate">User: {session.user.email}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Link
                href="/debug"
                className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  pathname === '/debug'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Auth Debug Dashboard
              </Link>
              <Link
                href="/debug/troubleshoot"
                className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  pathname === '/debug/troubleshoot'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Troubleshooting Guide
              </Link>
              <Link
                href="/"
                className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  pathname === '/'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home Page
              </Link>
              {status === 'authenticated' ? (
                <Link
                  href="/api/auth/signout"
                  className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="flex items-center px-3 py-2 text-sm text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
              )}
            </div>
          </div>
          
          <div className="p-2 mt-1 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-500">
            <p>Development tools only - will not appear in production</p>
          </div>
        </div>
      )}
    </div>
  );
}