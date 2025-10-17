'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

// Types for our data models
export interface Contest {
  id: number | string;
  name: string;
  platform: string;
  date: Date;
  startTime: string; // HH:MM
  duration: string;
  category?: string; 
  reminder?: string;
  notes?: string;
  notificationsEnabled?: boolean;
  link?: string;
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

  // Filter helpers
  getUpcomingContests: (limit?: number) => Contest[];
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
  const [platforms, setPlatforms] = useState<Platform[]>(samplePlatforms);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>(samplePerformance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with sample data
  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we're using our sample data
    // In the future, you'd implement:
    // const fetchData = async () => {
    //   setIsLoading(true);
    //   try {
    //     // API calls
    //   } catch (error) {
    //     setError('Failed to load data');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchData();
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

  const toggleContestNotification = (id: number | string) => {
    setContests(contests.map(contest => 
      contest.id === id 
        ? { ...contest, notificationsEnabled: !contest.notificationsEnabled } 
        : contest
    ));
  };

  // Platform operations
  const updatePlatform = (id: string, platformUpdates: Partial<Platform>) => {
    setPlatforms(platforms.map(platform => 
      platform.id === id ? { ...platform, ...platformUpdates } : platform
    ));
  };

  const togglePlatform = (id: string, field: 'enabled' | 'notificationsEnabled') => {
    setPlatforms(platforms.map(platform => {
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
    }));
  };

  // Filter helpers
  const getUpcomingContests = (limit?: number): Contest[] => {
    // Sort by date and time
    const sorted = [...contests].sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      
      // Set hours and minutes
      const [aHours, aMinutes] = a.startTime.split(':').map(Number);
      const [bHours, bMinutes] = b.startTime.split(':').map(Number);
      
      aDate.setHours(aHours, aMinutes);
      bDate.setHours(bHours, bMinutes);
      
      return aDate.getTime() - bDate.getTime();
    });
    
    // Only return contests from platforms that are enabled
    const enabledPlatforms = platforms
      .filter(p => p.enabled)
      .map(p => p.name);
    
    const filteredContests = sorted.filter(contest => enabledPlatforms.includes(contest.platform));
    
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
  const now = new Date();
  const contestDate = new Date(date);
  
  // Set hours and minutes from startTime
  const [hours, minutes] = startTime.split(':').map(Number);
  contestDate.setHours(hours, minutes);
  
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
}

export function formatContestDateAndTime(date: Date, startTime: string): string {
  const formattedDate = format(date, 'MMMM d, yyyy');
  return `${formattedDate} at ${startTime}`;
}