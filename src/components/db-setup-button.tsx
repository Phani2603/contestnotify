'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DbStatus {
  success: boolean;
  message: string;
  status?: {
    status: string;
    database: string;
    collections: Record<string, number>;
    stats: {
      dataSize: number;
      storageSize: number;
      indexes: number;
    }
  };
  error?: boolean;
}

export default function DbSetupButton() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkDbStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/setup/db');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking DB status:', error);
      setStatus({ success: false, message: 'Failed to check database status' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-black/40 border border-white/10 rounded-lg max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Database Status</h2>
      
      <Button 
        onClick={checkDbStatus} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Checking...' : 'Check Database Status'}
      </Button>
      
      {status && (
        <div className="mt-2">
          <div className={`p-2 rounded ${status.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            <p className="font-medium">{status.message}</p>
          </div>
          
          {status.status && (
            <>
              <button 
                className="text-sm text-blue-400 mt-2 underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Hide Details' : 'Show Details'}
              </button>
              
              {expanded && (
                <div className="mt-2 text-sm p-2 bg-gray-800/50 rounded overflow-auto max-h-60">
                  <pre>{JSON.stringify(status.status, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}