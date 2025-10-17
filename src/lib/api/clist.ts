/**
 * Utility functions for working with the Clist.by API
 * API Documentation: https://clist.by/api/v4/doc/
 */

// API base URL
const CLIST_API_BASE_URL = 'https://clist.by/api/v4';

// Types for API responses
export interface ClistContest {
  id: number;
  name: string;
  event: string;
  start: string; // ISO date string
  end: string; // ISO date string
  duration: number; // Duration in seconds
  href: string; // URL to the contest
  resource: {
    id: number;
    name: string; // Platform name (e.g. "Codeforces")
    icon?: string;
  };
}

export interface ClistResponse {
  meta: {
    limit: number;
    offset: number;
    total_count: number;
  };
  objects: ClistContest[];
}

/**
 * Fetches upcoming contests from the Clist.by API
 * @param limit Maximum number of contests to return
 * @param offset Number of contests to skip
 * @param resourceIds Array of resource IDs to filter by
 * @returns Promise with contest data
 */
export async function fetchUpcomingContests({
  limit = 50,
  offset = 0,
  resourceIds = [], // e.g. [1, 2, 93] for Codeforces, CodeChef, LeetCode
}: {
  limit?: number;
  offset?: number;
  resourceIds?: number[];
} = {}): Promise<ClistResponse> {
  // Get the API key from environment variables
  const apiKey = process.env.CLIST_API_KEY;
  
  if (!apiKey) {
    throw new Error('CLIST_API_KEY is not defined in environment variables');
  }
  
  // Current date in ISO format
  const now = new Date().toISOString();
  
  // Calculate date 3 months from now
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const futureDate = threeMonthsLater.toISOString();
  
  // Build URL with query parameters
  let url = `${CLIST_API_BASE_URL}/contest/?limit=${limit}&offset=${offset}&start__gte=${now}&start__lte=${futureDate}&order_by=start`;
  
  // Add resource filter if provided
  if (resourceIds.length > 0) {
    url += `&resource__id__in=${resourceIds.join(',')}`;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: ClistResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contests from Clist API:', error);
    throw error;
  }
}

/**
 * Map of common programming contest platforms to their resource IDs in Clist.by
 */
export const CLIST_RESOURCE_IDS = {
  CODEFORCES: 1,
  CODECHEF: 2,
  TOPCODER: 12,
  HACKERRANK: 63,
  LEETCODE: 93,
  ATCODER: 93,
  GOOGLE_KICKSTART: 36,
  HACKEREARTH: 73,
};

/**
 * Convert a Clist contest to our application's contest format
 */
export function convertClistContestToAppFormat(contest: ClistContest) {
  // Calculate duration in hours and minutes
  const durationInSeconds = contest.duration;
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  
  const durationString = hours > 0
    ? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
    : `${minutes} minutes`;
  
  // Parse start time
  const startTime = new Date(contest.start);
  
  return {
    id: contest.id.toString(),
    name: contest.name,
    platform: contest.resource.name,
    date: startTime,
    startTime: startTime.toTimeString().substring(0, 5), // Format as "HH:MM"
    duration: durationString,
    url: contest.href,
    notificationsEnabled: false, // Default value, should be updated from user preferences
  };
}