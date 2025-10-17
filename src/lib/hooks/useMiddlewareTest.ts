"use client";

import { useState, useCallback } from 'react';

export interface NextAuthConfigStatus {
  baseUrl: string;
  secretSet: boolean;
  githubConfigured: boolean;
  dbConfigured: boolean;
}

export interface MiddlewareTestResult {
  timestamp: string;
  middlewareTest: string;
  nextAuthConfig: NextAuthConfigStatus;
}

export const useMiddlewareTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MiddlewareTestResult | null>(null);

  const testMiddleware = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug/middleware-test');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Middleware test error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    testMiddleware,
    isLoading,
    error,
    data,
  };
};