'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useContestNotify } from '@/lib/contest-notify-context';

/**
 * Notification Debug Page
 * Shows current notification settings and database state
 */
export default function NotificationsDebugPage() {
  const [dbNotifications, setDbNotifications] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type CleanupResult = {
    status: string;
    message: string;
    cleanedCount: number;
    expiredContestIds?: (string | number)[];
  };
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  const { contests, toggleContestNotification } = useContestNotify();

  // Load notifications from database
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/user');
      
      if (!response.ok) {
        throw new Error(`Failed to load notifications: ${response.status}`);
      }
      
      const data = await response.json();
      setDbNotifications(data.enabledContestIds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle manual cleanup
  const handleCleanupExpired = async () => {
    setIsCleaningUp(true);
    setCleanupResult(null);
    
    try {
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Cleanup failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      setCleanupResult(result);
      
      // Refresh notifications list after cleanup
      loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error cleaning up notifications:', err);
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  // Load notifications on initial render
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Count contests with notifications enabled in current state
  const enabledContests = contests.filter(c => c.notificationsEnabled);
  
  // Helper function to check if a contest is expired
  const isContestExpired = (contest: { 
    originalStartISO?: string;
    date: Date;
    startTime: string;
    duration?: string | number;
  }) => {
    const now = new Date();
    
    // Get contest start time
    const contestStartTime = contest.originalStartISO 
      ? new Date(contest.originalStartISO)
      : (() => {
          const date = new Date(contest.date);
          const [hours, minutes] = contest.startTime.split(':').map(Number);
          date.setHours(hours, minutes);
          return date;
        })();
    
    // If contest already has an end time or duration, use that
    if (contest.duration) {
      // Parse duration - could be in format like "2 hours" or "100 minutes"
      let durationInMs = 0;
      
      // Try to parse duration string to get milliseconds
      if (typeof contest.duration === 'string') {
        const durationStr = contest.duration.toLowerCase();
        if (durationStr.includes('hour')) {
          const hours = parseFloat(durationStr) || 2; // Default to 2 hours if parsing fails
          durationInMs = hours * 60 * 60 * 1000;
        } else if (durationStr.includes('minute')) {
          const minutes = parseFloat(durationStr) || 120; // Default to 120 minutes if parsing fails
          durationInMs = minutes * 60 * 1000;
        } else {
          // Default to 2 hours if format is unrecognized
          durationInMs = 2 * 60 * 60 * 1000;
        }
      } else {
        // If duration is already a number, assume it's in seconds
        durationInMs = contest.duration * 1000;
      }
      
      // Calculate end time using duration
      const contestEndTime = new Date(contestStartTime.getTime() + durationInMs);
      
      // Contest is expired if it's already ended
      return contestEndTime < now;
    }
    
    // For contests without duration, assume they're expired if they started more than 6 hours ago
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    return (now.getTime() - contestStartTime.getTime()) > sixHoursInMs;
  };

  // Identify potentially expired contests with notifications
  const potentiallyExpiredContests = contests
    .filter(c => c.notificationsEnabled && isContestExpired(c));

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Debug</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <p className="mb-2">Total contests: {contests.length}</p>
          <p className="mb-4">Enabled notifications: {enabledContests.length}</p>
          
          <h3 className="text-lg font-medium mb-2">Contests with enabled notifications:</h3>
          {enabledContests.length > 0 ? (
            <ul className="list-disc list-inside">
              {enabledContests.map(contest => (
                <li key={contest.id} className="mb-1">
                  {contest.name} ({contest.platform})
                  <button
                    onClick={() => toggleContestNotification(contest.id)}
                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Disable
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No contests with notifications enabled</p>
          )}
        </Card>
        
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Database State</h2>
          {isLoading ? (
            <p>Loading notifications from database...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <>
              <p className="mb-4">Stored notification IDs: {dbNotifications.length}</p>
              
              {dbNotifications.length > 0 ? (
                <ul className="list-disc list-inside">
                  {dbNotifications.map((id) => {
                    // Find matching contest from current state
                    const contest = contests.find(c => c.id === id);
                    
                    return (
                      <li key={id} className="mb-1">
                        {contest ? (
                          <>
                            {contest.name} ({contest.platform})
                          </>
                        ) : (
                          <>ID: {id} (Contest not found in current state)</>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">No notifications stored in database</p>
              )}
            </>
          )}
        </Card>
      </div>
      
      {potentiallyExpiredContests.length > 0 && (
        <Card className="p-4 mt-6 border-amber-300">
          <h2 className="text-xl font-semibold mb-4 text-amber-700">Potentially Expired Contests</h2>
          <p className="mb-4 text-amber-600">
            These contests appear to be expired but still have notifications enabled:
          </p>
          
          <ul className="list-disc list-inside">
            {potentiallyExpiredContests.map(contest => (
              <li key={contest.id} className="mb-1">
                {contest.name} ({contest.platform})
                <button
                  onClick={() => toggleContestNotification(contest.id)}
                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                >
                  Disable
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <button
              onClick={handleCleanupExpired}
              disabled={isCleaningUp}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
            >
              {isCleaningUp ? 'Cleaning Up...' : 'Run Cleanup for Expired Contests'}
            </button>
            
            {cleanupResult && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p><strong>Cleanup Result:</strong></p>
                <p>Status: {cleanupResult.status}</p>
                <p>Message: {cleanupResult.message}</p>
                <p>Cleaned: {cleanupResult.cleanedCount} notifications</p>
              </div>
            )}
          </div>
        </Card>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">All Available Contests</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contests.slice(0, 12).map(contest => {
            const expired = isContestExpired(contest);
            
            return (
              <Card 
                key={contest.id} 
                className={`p-4 ${expired ? 'bg-gray-50 border-gray-200' : ''}`}
              >
                <h3 className="font-medium">{contest.name}</h3>
                <p className="text-sm text-gray-600">{contest.platform}</p>
                <p className="text-sm">Start: {contest.originalStartISO ? new Date(contest.originalStartISO).toLocaleString() : 'N/A'}</p>
                <p className="text-sm">Duration: {contest.duration || 'N/A'}</p>
                {expired && (
                  <p className="text-xs text-amber-600 mt-1">This contest appears to be expired</p>
                )}
                <p className="text-sm">Notifications: {contest.notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
                <button
                  onClick={() => toggleContestNotification(contest.id)}
                  className={`mt-2 px-3 py-1 text-sm rounded ${
                    contest.notificationsEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {contest.notificationsEnabled ? 'Disable' : 'Enable'} Notifications
                </button>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCleanupExpired}
            disabled={isCleaningUp}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isCleaningUp ? 'Cleaning Up...' : 'Run Manual Cleanup for Expired Contests'}
          </button>
        </div>
      </div>
    </div>
  );
}