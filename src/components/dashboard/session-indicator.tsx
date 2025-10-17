'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SessionIndicator() {
  const { data: session, status, update } = useSession();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpiring, setIsExpiring] = useState(false);
  const [sessionChecks, setSessionChecks] = useState(0);

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      await update();
      console.log("Session refreshed");
      setSessionChecks(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  // Calculate and update time left in session
  useEffect(() => {
    if (!session?.expires) {
      setTimeLeft("No expiration found");
      return;
    }

    const updateTimeLeft = () => {
      try {
        const expiresAt = new Date(session.expires);
        const now = new Date();
        
        if (expiresAt <= now) {
          setTimeLeft("Expired");
          setIsExpiring(true);
          return;
        }
        
        const timeLeftMs = expiresAt.getTime() - now.getTime();
        const minutesLeft = Math.floor(timeLeftMs / (1000 * 60));
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minutesRemaining = minutesLeft % 60;
        
        setTimeLeft(`${hoursLeft}h ${minutesRemaining}m`);
        
        // Set warning flag if less than 10 minutes remaining
        setIsExpiring(minutesLeft < 10);
      } catch (error) {
        setTimeLeft("Invalid expiration");
        console.error("Error calculating session expiration:", error);
      }
    };
    
    // Update immediately and then every minute
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [session?.expires, sessionChecks]);

  if (status === 'loading') {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-yellow-500 text-sm">Checking session status...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-red-500 text-sm">Not authenticated</span>
        </div>
        <Button 
          onClick={() => window.location.href = '/auth/signin'} 
          size="sm" 
          variant="outline"
          className="text-xs h-7 border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={`${
      isExpiring ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'
    } border rounded-lg p-3 mb-4 flex justify-between items-center`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 ${
          isExpiring ? 'bg-amber-500' : 'bg-green-500'
        } rounded-full mr-2 ${isExpiring ? 'animate-pulse' : ''}`}></div>
        <span className={`${isExpiring ? 'text-amber-500' : 'text-green-500'} text-sm`}>
          {isExpiring ? 'Session expiring soon' : 'Authenticated'} 
          {timeLeft && ` (${timeLeft})`}
        </span>
      </div>
      <Button 
        onClick={refreshSession} 
        size="sm" 
        variant="outline"
        className={`text-xs h-7 ${
          isExpiring 
            ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
            : 'border-green-500/30 text-green-400 hover:bg-green-500/20'
        }`}
      >
        Refresh Session
      </Button>
    </div>
  );
}