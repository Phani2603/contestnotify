"use client";

import { useState, useCallback } from 'react';

export interface MongoDbStatus {
  success: boolean;
  mongodbConnected: boolean;
  database?: string;
  collections?: string[];
  requiredCollections?: string[];
  missingCollections?: string[];
  documentCounts?: Record<string, number>;
  error?: string;
}

export const useMongoDbStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MongoDbStatus | null>(null);

  const checkMongoDb = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug/mongodb');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("MongoDB status check error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    checkMongoDb,
    isLoading,
    error,
    data,
  };
};