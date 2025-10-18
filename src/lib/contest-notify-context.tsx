'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

// Types for our data models
export interface Contest {
  id: number | string;
  name: string;
  platform: string;
  date: Date;
  startTime: string; // HH:MM UTC
  localStartTime?: string; // HH:MM AM/PM in local timezone
  duration: string;
  category?: string; 
  reminder?: string;
  notes?: string;
  notificationsEnabled?: boolean;
  link?: string;
  originalStartISO?: string; // Original ISO date string from the API
}

export interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  username: string;
  notificationsEnabled: boolean;
  logo?: string;
}

export interface UserPerformance {
  id: number;
  name: string;
  platform: string;
  ranking: string;
  problemsSolved: string;
  score: string;
}

interface ContestNotifyContextType {
  // Contests
  contests: Contest[];
  addContest: (contest: Omit<Contest, 'id'>) => void;
  updateContest: (id: number | string, contest: Partial<Contest>) => void;
  deleteContest: (id: number | string) => void;
  toggleContestNotification: (id: number | string) => void;
  
  // Platforms
  platforms: Platform[];
  updatePlatform: (id: string, platform: Partial<Platform>) => void;
  togglePlatform: (id: string, field: 'enabled' | 'notificationsEnabled') => void;
  
  // User Performance
  userPerformance: UserPerformance[];

  // Data Status
  isLoading: boolean;
  error: string | null;

  // API Operations
  fetchContestsForSelectedPlatforms: () => Promise<void>;

  // Filter helpers
  getUpcomingContests: (limit?: number, notificationsOnly?: boolean) => Contest[];
  getContestsForPlatform: (platformName: string) => Contest[];
  getContestsForDate: (date: Date) => Contest[];
}

// Define the shape of our context
const ContestNotifyContext = createContext<ContestNotifyContextType | undefined>(undefined);

// Sample data - this will be replaced with API calls in production
const sampleContests: Contest[] = [
  {
    id: 1,
    name: "Codeforces Round #870",
    platform: "Codeforces",
    date: new Date(2025, 9, 19), // Oct 19, 2025
    startTime: "17:30",
    duration: "2 hours",
    category: "Algorithm",
    reminder: "1 hour before",
    notes: "Focus on dynamic programming and graph algorithms",
    notificationsEnabled: true,
    link: "https://codeforces.com/contests"
  },
  
  {
    id: 2,
    name: "LeetCode Weekly Contest 378",
    platform: "LeetCode",
    date: new Date(2025, 9, 21), // Oct 21, 2025
    startTime: "14:30",
    duration: "1.5 hours",
    category: "Algorithm",
    reminder: "30 minutes before",
    notes: "Review binary trees and hash maps",
    notificationsEnabled: true,
    link: "https://leetcode.com/contest"
  },
  
  {
    id: 3,
    name: "AtCoder Beginner Contest 300",
    platform: "AtCoder",
    date: new Date(2025, 9, 22), // Oct 22, 2025
    startTime: "12:00",
    duration: "100 minutes",
    category: "Beginner",
    reminder: "1 day before",
    notes: "",
    notificationsEnabled: false,
    link: "https://atcoder.jp/contests"
  },
  {
    id: 4,
    name: "HackerRank Weekly Coding Challenge",
    platform: "HackerRank",
    date: new Date(2025, 9, 23), // Oct 23, 2025
    startTime: "15:00",
    duration: "3 hours",
    category: "Mixed",
    reminder: "2 hours before",
    notes: "Focus on SQL and algorithms",
    notificationsEnabled: false,
    link: "https://www.hackerrank.com/contests"
  },
  {
    id: 5,
    name: "Google Kick Start Round F",
    platform: "Google",
    date: new Date(2025, 9, 28), // Oct 28, 2025
    startTime: "10:00",
    duration: "3 hours",
    category: "Advanced",
    reminder: "1 day before",
    notes: "Very difficult, prepare dynamic programming topics",
    notificationsEnabled: true,
    link: "https://codingcompetitions.withgoogle.com/kickstart"
  },
  {
    id: 6,
    name: "CodeChef October Challenge",
    platform: "CodeChef",
    date: new Date(2025, 9, 30), // Oct 30, 2025
    startTime: "15:00",
    duration: "2 hours",
    category: "Beginner",
    reminder: "1 day before",
    notes: "Focus on basic data structures",
    notificationsEnabled: true,
    link: "https://www.codechef.com/contests"
  }

];

const samplePlatforms: Platform[] = [
  {
    id: '1',
    name: 'Codeforces',
    enabled: true,
    username: 'user123',
    notificationsEnabled: true,
    logo: '/platforms/codeforces.png'
  },
  {
    id: '2',
    name: 'LeetCode',
    enabled: true,
    username: 'leetcoder',
    notificationsEnabled: true,
    logo: '/platforms/leetcode.png'
  },
  {
    id: '3',
    name: 'HackerRank',
    enabled: false,
    username: '',
    notificationsEnabled: false,
    logo: '/platforms/hackerrank.png'
  },
  {
    id: '4',
    name: 'AtCoder',
    enabled: false,
    username: '',
    notificationsEnabled: false,
    logo: '/platforms/atcoder.png'
  },
  {
    id: '5',
    name: 'Google',
    enabled: true,
    username: 'googler123',
    notificationsEnabled: true,
    logo: '/platforms/google.png'
  },
  {
    id: '6',
    name: 'CodeChef',
    enabled: true,
    username: 'chef_coder',
    notificationsEnabled: true,
    logo: '/platforms/codechef.png'
  }
];

const samplePerformance: UserPerformance[] = [
  {
    id: 1,
    name: "Codeforces Round #869",
    platform: "Codeforces",
    ranking: "178th / 12,456",
    problemsSolved: "4/7",
    score: "1826"
  },
  {
    id: 2,
    name: "LeetCode Weekly Contest 377",
    platform: "LeetCode",
    ranking: "326th / 18,992",
    problemsSolved: "3/4",
    score: "1912"
  },
  {
    id: 3,
    name: "HackerRank University CodeSprint",
    platform: "HackerRank",
    ranking: "42nd / 5,317",
    problemsSolved: "6/8",
    score: "2104"
  }
];

// Create a provider component for our context
export function ContestNotifyProvider({ children }: { children: ReactNode }) {
  const [contests, setContests] = useState<Contest[]>(sampleContests);
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    // Try to load platforms from localStorage on client side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contestnotify-platforms');
      if (saved) {
        try {
          const parsedPlatforms = JSON.parse(saved) as Platform[];
          // If we have valid platform data, use it
          if (Array.isArray(parsedPlatforms) && parsedPlatforms.length > 0) {
            // Check if CodeChef is missing
            if (!parsedPlatforms.some(p => p.name === 'CodeChef')) {
              console.log('CodeChef missing from saved platforms, adding it back');
              const codeChefPlatform = samplePlatforms.find(p => p.name === 'CodeChef');
              if (codeChefPlatform) {
                parsedPlatforms.push(codeChefPlatform);
              }
            }
            return parsedPlatforms;
          }
        } catch (e) {
          console.error('Failed to parse saved platforms:', e);
        }
      }
    }
    // Fall back to sample data
    return samplePlatforms;
  });
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>(samplePerformance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch contests from CLIST API
  const fetchContestsForSelectedPlatforms = async () => {
    // Skip if NOT running on client side (i.e. during SSR)
    if (typeof window === 'undefined') {
      console.log('Skipping API call during server-side rendering');
      return;
    }
    
    // Check if environment variables are available
    console.log('Environment variables check:', {
      username: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
      apiKey: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗',
    });
    
    // Only fetch if we have platforms enabled
    const enabledPlatforms = platforms.filter(p => p.enabled);
    if (enabledPlatforms.length === 0) {
      console.log('No enabled platforms, skipping API call');
      return;
    }
    
    // Debug output - check which platforms are enabled
    console.log('All platforms with enabled status:', 
      platforms.map(p => ({ name: p.name, enabled: p.enabled }))
    );
    
    setIsLoading(true);
    setError(null);
    
      try {
        // Import the CLIST API functions dynamically
        // This ensures they're only loaded on the client side
        console.log('Importing API functions...');
        const { fetchContestsViaServerRoute, convertClistContestToAppFormat, PLATFORM_TO_RESOURCE_ID } = 
          await import('@/lib/api/clist');
        
        // Get platform names of enabled platforms
        const platformNames = enabledPlatforms
          .map(platform => platform.name)
          .filter(name => name && name.trim().length > 0); // Filter out empty names
        
        console.log('Fetching contests for platforms:', platformNames);
        
        if (platformNames.length === 0) {
          console.warn('No valid platform names to fetch contests for');
          // Instead of failing, we'll just return empty results
          setContests([]);
          return;
        }
        
        // Verify that platform names map to valid resource IDs
        // Important: Check if the names match exactly the keys in PLATFORM_TO_RESOURCE_ID
        const validPlatformNames = platformNames.filter(name => {
          // Check if name exists in our mapping
          const isValid = PLATFORM_TO_RESOURCE_ID[name] !== undefined;
          if (!isValid) {
            console.warn(`Platform name "${name}" doesn't have a resource ID mapping.`);
            console.log('Available platform mappings:', Object.keys(PLATFORM_TO_RESOURCE_ID));
          }
          return isValid;
        });
        
        if (validPlatformNames.length === 0) {
          console.warn('None of the provided platform names have valid resource IDs:', platformNames);
          setError('No valid platform names. Please check platform configuration.');
          return;
        }
        
        console.log('Valid platforms with resource IDs:', validPlatformNames);
        console.log('Resource IDs for valid platforms:', validPlatformNames.map(name => PLATFORM_TO_RESOURCE_ID[name]));
        
        // Fetch contests via our server-side API route
        // This is more secure as it doesn't expose API keys in client-side code
        const clistResponse = await fetchContestsViaServerRoute({
          limit: 50,
          platformNames: validPlatformNames
        });      // Convert to our app format
      // First, try to get user's notification preferences
      let enabledContestIds: (string | number)[] = [];
      try {
        const notificationsResponse = await fetch('/api/notifications/user');
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          enabledContestIds = notificationsData.enabledContestIds || [];
          console.log('Loaded notification preferences:', { 
            count: enabledContestIds.length,
            ids: enabledContestIds.slice(0, 5).concat(enabledContestIds.length > 5 ? ['...'] : [])
          });
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        // Continue with empty preferences, fallback to current state
      }
      
      // Map API contests to app format
      const apiContests = clistResponse.objects.map(contest => {
        const appFormat = convertClistContestToAppFormat(contest);
        
        // Check if this contest has notifications enabled
        // First priority: Check loaded preferences from database
        // Second priority: Check current state (for newly toggled notifications)
        // Default: false
        const notificationEnabled = 
          enabledContestIds.includes(appFormat.id) ||
          contests.find(c => c.id === appFormat.id)?.notificationsEnabled || 
          false;
        
        return {
          ...appFormat,
          notificationsEnabled: notificationEnabled
        };
      });
      
      // Update state with API contests
      // Note: In a real app, you might merge with local data
      // or store notification preferences separately
      setContests(apiContests);
      
    } catch (error) {
      console.error('Error fetching contests:', error);
      
      // Add diagnostic information to help troubleshoot
      const diagnostics = {
        enabledPlatformsCount: enabledPlatforms.length,
        platformNames: enabledPlatforms.map(p => p.name),
        clientEnvVars: {
          clistUsername: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
          clistApiKey: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗'
        }
      };
      console.error('Diagnostics:', diagnostics);
      
      // Provide more detailed error information
      const errorMessage = error instanceof Error 
        ? `${error.message} (${error.name})` 
        : 'Unknown error occurred';
        
      setError(`Failed to load contest data: ${errorMessage}`);
      
      // Fallback to sample data if API fails
      console.log('Using fallback sample data due to API error');
      setContests(sampleContests);
      
      // Don't rethrow when initiated from context - we've already handled it
      // with our fallback mechanism
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clean up expired notifications
  const cleanupExpiredNotifications = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      console.log('Running cleanup for expired contest notifications');
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Cleanup failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Notification cleanup result:', result);
      
      // If we cleaned up any notifications, refresh contest list to ensure UI is in sync
      if (result.cleanedCount > 0) {
        console.log(`Cleaned up ${result.cleanedCount} expired notifications, refreshing contests`);
        fetchContestsForSelectedPlatforms();
      }
    } catch (error) {
      console.error('Failed to clean up notifications:', error);
    }
  };

  // Fetch contests from CLIST API when platforms change
  useEffect(() => {
    // Call the fetch function on initial load and when platforms change
    fetchContestsForSelectedPlatforms();
    
    // Set up periodic refresh (every 30 minutes)
    const refreshInterval = setInterval(fetchContestsForSelectedPlatforms, 30 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platforms]); // contests is intentionally omitted to prevent infinite loops
  
  // Set up periodic cleanup of expired notifications
  useEffect(() => {
    // Skip if NOT running on client side
    if (typeof window === 'undefined') return;
    
    // Clean up expired notifications on initial load
    cleanupExpiredNotifications();
    
    // Set up interval to run cleanup every hour
    const cleanupInterval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(cleanupInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contest CRUD operations
  const addContest = (contest: Omit<Contest, 'id'>) => {
    const newId = Math.max(...contests.map(c => typeof c.id === 'string' ? parseInt(c.id) : c.id), 0) + 1;
    setContests([...contests, { ...contest, id: newId }]);
  };

  const updateContest = (id: number | string, contestUpdates: Partial<Contest>) => {
    setContests(contests.map(contest => 
      contest.id === id ? { ...contest, ...contestUpdates } : contest
    ));
  };

  const deleteContest = (id: number | string) => {
    setContests(contests.filter(contest => contest.id !== id));
  };

  // Toggle contest notification and persist to database
  const toggleContestNotification = async (id: number | string) => {
    // Get current state of notification for this contest
    const contest = contests.find(c => c.id === id);
    const currentlyEnabled = contest?.notificationsEnabled || false;
    
    // Optimistically update UI
    setContests(contests.map(contest => 
      contest.id === id 
        ? { ...contest, notificationsEnabled: !currentlyEnabled } 
        : contest
    ));
    
    try {
      // Persist to database via API
      const response = await fetch('/api/notifications/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: id,
          enabled: !currentlyEnabled
        }),
      });
      
      if (!response.ok) {
        // Revert UI change if the API call fails
        console.error('Failed to update notification preference:', await response.text());
        
        // Roll back the UI change
        setContests(contests.map(contest => 
          contest.id === id 
            ? { ...contest, notificationsEnabled: currentlyEnabled } 
            : contest
        ));
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      
      // Roll back the UI change
      setContests(contests.map(contest => 
        contest.id === id 
          ? { ...contest, notificationsEnabled: currentlyEnabled } 
          : contest
      ));
    }
  };

  // Platform operations
  const updatePlatform = (id: string, platformUpdates: Partial<Platform>) => {
    // First create the updated platforms array
    const updatedPlatforms = platforms.map(platform => 
      platform.id === id ? { ...platform, ...platformUpdates } : platform
    );
    
    // Update the state with the new platforms array
    setPlatforms(updatedPlatforms);
    
    // In a real app, you'd persist this to a database
    // and sync with user preferences
    if (typeof window !== 'undefined') {
      // Store in local storage for now - use the updatedPlatforms array
      // to ensure we're saving the latest state
      localStorage.setItem('contestnotify-platforms', JSON.stringify(updatedPlatforms));
      
      // Verify that CodeChef is still present
      const saved = localStorage.getItem('contestnotify-platforms');
      if (saved) {
        try {
          const parsedPlatforms = JSON.parse(saved) as Platform[];
          if (!parsedPlatforms.some(p => p.name === 'CodeChef')) {
            console.warn('CodeChef missing after update operation, ensure it is preserved');
          }
        } catch (e) {
          console.error('Failed to verify platforms after update:', e);
        }
      }
    }
  };

  const togglePlatform = (id: string, field: 'enabled' | 'notificationsEnabled') => {
    // First create the updated platforms array
    const updatedPlatforms = platforms.map(platform => {
      if (platform.id === id) {
        const updatedPlatform = {
          ...platform,
          [field]: !platform[field],
        };
        
        // If disabling platform, also disable notifications
        if (field === 'enabled' && !updatedPlatform.enabled) {
          updatedPlatform.notificationsEnabled = false;
        }
        
        return updatedPlatform;
      }
      return platform;
    });
    
    // Update the state with the new platforms array
    setPlatforms(updatedPlatforms);
    
    // In a real app, you'd persist this to a database
    // and sync with user preferences
    if (typeof window !== 'undefined') {
      // Store in local storage for now - use the updatedPlatforms array
      // to ensure we're saving the latest state
      localStorage.setItem('contestnotify-platforms', JSON.stringify(updatedPlatforms));
      
      // Double-check that CodeChef is present in localStorage data
      const saved = localStorage.getItem('contestnotify-platforms');
      if (saved) {
        try {
          const parsedPlatforms = JSON.parse(saved) as Platform[];
          if (!parsedPlatforms.some(p => p.name === 'CodeChef')) {
            console.warn('CodeChef missing after toggle operation, ensure it is preserved');
          }
        } catch (e) {
          console.error('Failed to verify platforms after toggle:', e);
        }
      }
    }
  };

  // Helper function to check if a contest has expired
  const isContestExpired = (contest: Contest): boolean => {
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

  // Filter helpers
  const getUpcomingContests = (limit?: number, notificationsOnly: boolean = true): Contest[] => {
    // Sort by date and time
    const sorted = [...contests].sort((a, b) => {
      // Use originalStartISO if available for most accurate sorting
      const aDate = a.originalStartISO ? new Date(a.originalStartISO) : new Date(a.date);
      const bDate = b.originalStartISO ? new Date(b.originalStartISO) : new Date(b.date);
      
      // Only set hours and minutes if we're using the date field
      if (!a.originalStartISO) {
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        aDate.setHours(aHours, aMinutes);
      }
      
      if (!b.originalStartISO) {
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        bDate.setHours(bHours, bMinutes);
      }
      
      return aDate.getTime() - bDate.getTime();
    });
    
    // Filter out expired contests
    const now = new Date();
    const currentContests = sorted.filter(contest => {
      // First check if the contest is expired using our helper function
      if (isContestExpired(contest)) {
        return false;
      }
      
      // Then check if it's in the future (for upcoming contests)
      if (contest.originalStartISO) {
        return new Date(contest.originalStartISO) > now;
      }
      
      const contestDateTime = new Date(contest.date);
      const [hours, minutes] = contest.startTime.split(':').map(Number);
      contestDateTime.setHours(hours, minutes);
      return contestDateTime > now;
    });
    
    // Only return contests from platforms that are enabled
    const enabledPlatforms = platforms
      .filter(p => p.enabled)
      .map(p => p.name);
    
    let filteredContests = currentContests.filter(contest => {
      // If platform is undefined or blank, show it by default
      if (!contest.platform || contest.platform.trim() === '') return true;
      // If it's "Unknown Platform", check if we should include it
      if (contest.platform === 'Unknown Platform' || contest.platform === 'Unknown') return true;
      // Otherwise, check if it's in the enabled platforms (case-insensitive matching)
      const platformLower = contest.platform.toLowerCase();
      return enabledPlatforms.some(p => p.toLowerCase() === platformLower);
    });
    
    // Filter for contests with notifications enabled if notificationsOnly is true
    if (notificationsOnly) {
      filteredContests = filteredContests.filter(contest => contest.notificationsEnabled);
    }
    
    // Return all or limited number
    return limit ? filteredContests.slice(0, limit) : filteredContests;
  };

  const getContestsForPlatform = (platformName: string): Contest[] => {
    return contests.filter(contest => 
      contest.platform.toLowerCase() === platformName.toLowerCase()
    );
  };

  const getContestsForDate = (date: Date): Contest[] => {
    return contests.filter(contest => 
      contest.date.getFullYear() === date.getFullYear() &&
      contest.date.getMonth() === date.getMonth() &&
      contest.date.getDate() === date.getDate()
    );
  };

  // Provide the context value
  const value: ContestNotifyContextType = {
    contests,
    addContest,
    updateContest,
    deleteContest,
    toggleContestNotification,
    platforms,
    updatePlatform,
    togglePlatform,
    userPerformance,
    isLoading,
    error,
    fetchContestsForSelectedPlatforms,
    getUpcomingContests,
    getContestsForPlatform,
    getContestsForDate
  };

  return (
    <ContestNotifyContext.Provider value={value}>
      {children}
    </ContestNotifyContext.Provider>
  );
}

// Custom hook for using the contest notify context
export function useContestNotify() {
  const context = useContext(ContestNotifyContext);
  
  if (context === undefined) {
    throw new Error('useContestNotify must be used within a ContestNotifyProvider');
  }
  
  return context;
}

// Helper functions for formatting
export function formatContestTimeUntil(date: Date, startTime: string): string {
  try {
    const now = new Date();
    
    // Ensure we have a proper Date object
    let contestDate = date instanceof Date ? new Date(date) : new Date();
    
    if (isNaN(contestDate.getTime())) {
      console.error("Invalid date provided to formatContestTimeUntil:", date);
      return "Invalid date";
    }
    
    // If the startTime is already set in the date object, we don't need to set it again
    // This is a safeguard against double-setting the time that could lead to timezone issues
    const hours = contestDate.getHours();
    const minutes = contestDate.getMinutes();
    
    console.log('Contest time calculation details:', {
      contestName: 'Contest',
      originalDate: date.toString(),
      parsedDate: contestDate.toString(),
      startTime,
      currentHours: hours,
      currentMinutes: minutes,
      browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localeTime: contestDate.toLocaleTimeString(),
    });
    
    // Only override hours/minutes if we're sure the startTime is in the correct format
    // and the date doesn't already have the correct time
    if (startTime && typeof startTime === 'string' && /^\d{1,2}:\d{2}$/.test(startTime)) {
      const [timeHours, timeMinutes] = startTime.split(':').map(Number);
      
      // Only set hours and minutes if they differ from what's already in the date
      // This helps avoid timezone conversion issues
      if (hours !== timeHours || minutes !== timeMinutes) {
        console.log(`Adjusting contest time from ${hours}:${minutes} to ${timeHours}:${timeMinutes}`);
        contestDate = new Date(contestDate);
        contestDate.setHours(timeHours, timeMinutes, 0, 0);
      }
    }
    
    const diffMs = contestDate.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Started';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
  } catch (error) {
    console.error("Error in formatContestTimeUntil:", error);
    return "Time error";
  }
}

export function formatContestDateAndTime(date: Date, startTime: string): string {
  const formattedDate = format(date, 'MMMM d, yyyy');
  return `${formattedDate} at ${startTime}`;
}