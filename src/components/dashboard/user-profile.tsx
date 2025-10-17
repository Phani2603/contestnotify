'use client';

import { Session } from "next-auth";

interface UserProfileProps {
  session: Session | null;
}

export function UserProfile({ session }: UserProfileProps) {
  // Format dates for better readability
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };
  
  // Calculate time left until session expiration
  const getExpirationInfo = () => {
    if (!session?.expires) return { expired: true, timeLeft: 'Session expired or invalid' };
    
    const expiresAt = new Date(session.expires);
    const now = new Date();
    
    if (expiresAt <= now) {
      return { expired: true, timeLeft: 'Session expired' };
    }
    
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeftMs / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minutesRemaining = minutesLeft % 60;
    
    return {
      expired: false,
      timeLeft: `${hoursLeft}h ${minutesRemaining}m remaining`,
      expirationDate: formatDate(session.expires)
    };
  };
  
  // Get session expiration info
  const expiration = getExpirationInfo();

  // Handle missing session
  if (!session || !session.user) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-amber-400 mb-4">Session Information Missing</h2>
        <p className="text-white/80 mb-4">
          Your session appears to be invalid or has expired. You might need to sign in again.
        </p>
        <div className="bg-black/30 p-4 rounded-md text-xs text-amber-300/70 overflow-auto">
          <code>Session data unavailable</code>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      
      <div className="flex items-start gap-6">
        {/* User avatar */}
        <div className="flex-shrink-0">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Profile"}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
          )}
        </div>
        
        {/* User details */}
        <div className="flex-grow space-y-2">
          <p>
            <span className="text-white/60">Name:</span>{" "}
            <span className="font-medium">{session.user.name || 'N/A'}</span>
          </p>
          <p>
            <span className="text-white/60">Email:</span>{" "}
            <span className="font-medium">{session.user.email || 'N/A'}</span>
          </p>
          <p>
            <span className="text-white/60">Role:</span>{" "}
            <span className="font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm">
              {(session.user && 'role' in session.user ? session.user.role : 'User')}
            </span>
          </p>
          <p>
            <span className="text-white/60">Session expires:</span>{" "}
            <span className={`font-medium ${expiration.expired ? 'text-red-400' : 'text-green-400'}`}>
              {expiration.expirationDate || 'N/A'} ({expiration.timeLeft})
            </span>
          </p>
        </div>
      </div>
      
      {/* Session debugging section */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <details>
          <summary className="text-sm text-white/70 cursor-pointer hover:text-white/90">
            Session debugging information
          </summary>
          <div className="mt-3 p-3 bg-black/30 rounded-md overflow-auto max-h-40">
            <pre className="text-xs text-white/60">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}