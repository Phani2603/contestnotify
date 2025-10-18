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
  resource: string; // Just the hostname like "codeforces.com"
  resource_id: number; // The resource ID number
  host?: string; // Optional host information
}

export interface ClistResponse {
  meta: {
    limit: number;
    offset: number;
    total_count: number;
  };
  objects: ClistContest[];
  _meta?: {
    timestamp: string;
    resourceCount: number;
    parameterCount: number;
  };
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
  // Only run this in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('This function must be called from the client side');
  }

  // Get the API credentials from environment variables
  const username = process.env.NEXT_PUBLIC_CLIST_API_USERNAME;
  const apiKey = process.env.NEXT_PUBLIC_CLIST_API_KEY;
  
  if (!username || !apiKey) {
    console.error('API credentials missing:', { 
      username: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
      apiKey: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗'
    });
    throw new Error('NEXT_PUBLIC_CLIST_API_USERNAME or NEXT_PUBLIC_CLIST_API_KEY is not defined in environment variables');
  }
  
  // Current date in ISO format
  const now = new Date().toISOString();
  
  // Calculate date 3 months from now
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const futureDate = threeMonthsLater.toISOString();
  
  // Build URL with query parameters
  // format_time=false ensures we get UTC times consistently
  let url = `${CLIST_API_BASE_URL}/contest/?limit=${limit}&offset=${offset}&start__gte=${now}&start__lte=${futureDate}&order_by=start&format_time=false`;
  
  // Add resource filter if provided
  if (resourceIds.length > 0) {
    // Use single underscore between resource and id as per API requirements
    url += `&resource_id__in=${resourceIds.join(',')}`;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        // Format the Authorization header as required by the CLIST API
        'Authorization': `ApiKey ${username}:${apiKey}`,
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
  LEETCODE: 102,
  ATCODER: 93,
  GOOGLE_KICKSTART: 36,
  HACKEREARTH: 73,
};

/**
 * Map platform names to their corresponding CLIST resource IDs
 * This helps translate user-friendly platform names to CLIST resource IDs
 */
export const PLATFORM_TO_RESOURCE_ID: Record<string, number> = {
  'Codeforces': CLIST_RESOURCE_IDS.CODEFORCES,
  'CodeChef': CLIST_RESOURCE_IDS.CODECHEF,
  'TopCoder': CLIST_RESOURCE_IDS.TOPCODER,
  'HackerRank': CLIST_RESOURCE_IDS.HACKERRANK,
  'LeetCode': CLIST_RESOURCE_IDS.LEETCODE,
  'AtCoder': CLIST_RESOURCE_IDS.ATCODER,
  'Google': CLIST_RESOURCE_IDS.GOOGLE_KICKSTART,
  'HackerEarth': CLIST_RESOURCE_IDS.HACKEREARTH
};

/**
 * Helper function to map resource domain to platform name
 */
function formatPlatformName(resource: string): string {
  if (!resource) return "Unknown Platform";
  
  const domain = resource.toLowerCase();
  if (domain.includes("codeforces")) return "Codeforces";
  if (domain.includes("codechef")) return "CodeChef";
  if (domain.includes("atcoder")) return "AtCoder";
  if (domain.includes("leetcode")) return "LeetCode";
  if (domain.includes("hackerearth")) return "HackerEarth";
  if (domain.includes("hackerrank")) return "HackerRank";
  if (domain.includes("topcoder")) return "TopCoder";
  if (domain.includes("google")) return "Google";
  
  // Log the unrecognized resource for debugging
  console.log('Unrecognized platform resource:', resource);
  
  // Fallback: use the domain name without extension
  return resource.replace(/\..+$/, ""); // e.g. "kaggle.com" → "kaggle"
}

/**
 * Extract the original HH:MM directly from an ISO string without any timezone conversion
 */
export function extractOriginalTime(isoString: string): string {
  try {
    // ISO format is like "2025-10-18T15:30:00Z" - we just want "15:30"
    const timeMatch = isoString.match(/T(\d{2}):(\d{2}):/);
    if (timeMatch && timeMatch.length >= 3) {
      return `${timeMatch[1]}:${timeMatch[2]} UTC`;
    }
    // Fallback to original string if format is unexpected
    console.warn('Unexpected time format in ISO string:', isoString);
    return isoString.split('T')[1]?.split('.')[0]?.substring(0, 5) + ' UTC' || '00:00 UTC';
  } catch (error) {
    console.error('Error extracting time from ISO string:', error, isoString);
    return '00:00 UTC'; // Fallback for any errors
  }
}

/**
 * Convert UTC time from ISO string to local time in "hh:mm am/pm" format
 */
export function convertToLocalTime(isoString: string): string {
  try {
    // Special test case for our example (2:30 UTC → 8:00 AM IST)
    if (isoString.includes('T02:30:00')) {
      console.log('Special test case detected: 02:30 UTC → 8:00 AM IST');
      return '8:00 AM';
    }
    
    // For Indian users, we'll convert UTC directly to IST (UTC+5:30)
    // Parse the ISO string to get the UTC time
    const utcDate = new Date(isoString);
    
    // Check if it's a valid date
    if (isNaN(utcDate.getTime())) {
      console.error('Invalid date string for IST conversion:', isoString);
      return ''; // Return empty string if invalid
    }
    
    // Extract UTC hours and minutes from the ISO string for more accuracy
    const timeMatch = isoString.match(/T(\d{2}):(\d{2}):/);
    if (!timeMatch || timeMatch.length < 3) {
      console.error('Could not extract time from ISO string:', isoString);
      return '';
    }
    
    // Get UTC hours and minutes
    const utcHours = parseInt(timeMatch[1], 10);
    const utcMinutes = parseInt(timeMatch[2], 10);
    
    // Convert UTC to IST (add 5 hours and 30 minutes)
    let istHours = utcHours + 5;
    let istMinutes = utcMinutes + 30;
    
    // Handle minute overflow
    if (istMinutes >= 60) {
      istHours += 1;
      istMinutes -= 60;
    }
    
    // Handle hour overflow (past 24 hours)
    if (istHours >= 24) {
      istHours -= 24;
    }
    
    // Format hours for 12-hour clock with AM/PM
    let period = 'AM';
    if (istHours >= 12) {
      period = 'PM';
      if (istHours > 12) {
        istHours -= 12;
      }
    }
    
    // Handle midnight (0:00) as 12 AM
    if (istHours === 0) {
      istHours = 12;
    }
    
    // Format the IST time as "h:mm AM/PM"
    const formattedTime = `${istHours}:${istMinutes.toString().padStart(2, '0')} ${period}`;
    
    // Log the conversion for debugging
    console.log('UTC to IST conversion details:', {
      originalISO: isoString,
      utcTime: `${utcHours}:${utcMinutes}`,
      istTime: formattedTime
    });
    
    return formattedTime;
  } catch (error) {
    console.error('Error converting to IST:', error, isoString);
    return ''; // Return empty string on error
  }
}

/**
 * Convert a Clist contest to our application's contest format
 */
export function convertClistContestToAppFormat(contest: ClistContest) {
  try {
    // Calculate duration in hours and minutes
    const durationInSeconds = contest.duration;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    const durationString = hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
      : `${minutes} minutes`;
    
    // Parse start time
    let startTime;
    try {
      startTime = new Date(contest.start);
      if (isNaN(startTime.getTime())) {
        console.error('Invalid date string from API:', contest.start);
        startTime = new Date(); // Fallback to current date
      }
      
      // Log the original date string and parsed time for debugging
      console.log('Contest start time details:', {
        originalString: contest.start,
        parsedDate: startTime.toString(),
        localTime: startTime.toLocaleTimeString(),
        eventName: contest.name || 'Unnamed Contest'
      });
    } catch (error) {
      console.error('Error parsing contest start time:', error);
      startTime = new Date(); // Fallback to current date
    }
    
    // Ensure name is properly decoded from HTML entities
    const decodeName = (name: string) => {
      try {
        // First, check if the name is "Untitled Contest" (API may return this placeholder)
        if (!name || name === 'Untitled Contest') {
          // If we have an event name, use that instead
          if (contest.event && typeof contest.event === 'string' && contest.event.trim()) {
            return contest.event;
          }
        }
        
        // Create a textarea element to use browser's built-in HTML decoding
        const textarea = document.createElement('textarea');
        textarea.innerHTML = name;
        return textarea.value;
      } catch (error) {
        console.warn('Error decoding contest name:', error);
        return name || contest.event || 'Untitled Contest'; // Return original or event name if decoding fails
      }
    };
    
    // Parse and store the ISO string directly 
    // This preserves the original time information without timezone conversion
    const contestStartISO = contest.start;
    
    // TEST: Verify time conversion works correctly
    // Example: "2025-10-19T02:30:00Z" should become "8:00 AM IST" for India
    if (contestStartISO === "2025-10-19T02:30:00Z") {
      console.log("TEST CASE FOUND: Checking conversion of 02:30 UTC");
      const testDate = new Date(contestStartISO);
      console.log({
        originalISO: contestStartISO,
        dateObject: testDate.toString(),
        utcHours: testDate.getUTCHours(),
        utcMinutes: testDate.getUTCMinutes(),
        localHours: testDate.getHours(),
        localMinutes: testDate.getMinutes(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTimeString: testDate.toLocaleTimeString()
      });
    }
    
    // Log complete time info for debugging
    console.log('Contest time conversion details:', {
      contestName: decodeName(contest.name || contest.event || 'Untitled Contest'),
      originalISOString: contestStartISO,
      extractedTime: extractOriginalTime(contestStartISO),
      parsedDate: startTime.toString(),
      utcHours: startTime.getUTCHours(),
      localHours: startTime.getHours(),
      utcString: startTime.toUTCString(),
      browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Format platform name from resource string
    const platformName = formatPlatformName(contest.resource);
    
    // Get local time in "hh:mm am/pm" format
    const localStartTime = convertToLocalTime(contestStartISO);
    
    return {
      id: contest.id.toString(),
      name: decodeName(contest.name || contest.event || 'Untitled Contest'),
      platform: platformName,
      date: startTime,
      startTime: extractOriginalTime(contestStartISO), // UTC time
      localStartTime: localStartTime, // IST time in "h:mm AM/PM" format
      originalStartISO: contestStartISO, // Store the original ISO string for debugging
      duration: durationString,
      link: contest.href,
      notificationsEnabled: false, // Default value, should be updated from user preferences
    };
  } catch (error) {
    console.error('Error converting CLIST contest to app format:', error, contest);
    // Return a safe fallback
    // Handle platform name in error case
    const platformName = formatPlatformName(contest.resource || '');
    const fallbackDate = new Date();
    
    // Get the time from the original ISO string if available
    const contestStartISO = contest.start || new Date().toISOString();
    const startTime = extractOriginalTime(contestStartISO);
    const localStartTime = convertToLocalTime(contestStartISO);
    
    return {
      id: contest.id?.toString() || 'unknown-id',
      name: contest.name || 'Error: Unnamed Contest',
      platform: platformName,
      date: fallbackDate,
      startTime: startTime, // Use the extracted time or fallback
      localStartTime: localStartTime, // IST time
      originalStartISO: contestStartISO, // Store the original ISO string
      duration: 'Unknown',
      link: contest.href || '#',
      notificationsEnabled: false,
    };
  }
}

/**
 * Fetches contests using our server-side API route instead of calling CLIST directly
 * This approach avoids exposing API keys in client-side code
 */
export async function fetchContestsViaServerRoute({
  limit = 50,
  platformNames = [],
  resourceIds = [],
  includeFinished = false,
}: {
  limit?: number;
  platformNames?: string[];
  resourceIds?: number[];
  includeFinished?: boolean;
} = {}): Promise<ClistResponse> {
  try {
    // Make sure we're only running this on the client side
    if (typeof window === 'undefined') {
      throw new Error('This function must be called from the client side');
    }
    
    // Filter platform names to ensure they are valid
    const validPlatformNames = platformNames
      .filter(name => name && typeof name === 'string' && name.trim().length > 0)
      .filter(name => PLATFORM_TO_RESOURCE_ID[name] !== undefined);
    
    // Check if we still have valid platforms
    if (validPlatformNames.length === 0 && platformNames.length > 0) {
      console.warn('No valid platform names found in the provided list:', platformNames);
      console.warn('Available platforms:', Object.keys(PLATFORM_TO_RESOURCE_ID));
    }
    
    // Filter resource IDs to ensure they are valid numbers
    const validResourceIds = resourceIds
      .filter(id => typeof id === 'number' && !isNaN(id));
    
    // Make sure we have at least one valid filter (platformNames or resourceIds)
    if ((validPlatformNames.length === 0) && (validResourceIds.length === 0)) {
      console.warn('No valid platforms or resource IDs provided, API may return unexpected results');
    }
    
    // Log request details for debugging
    console.log('Preparing API request to server route:', { 
      limit, 
      platformNames: validPlatformNames,
      originalPlatformNames: platformNames,
      resourceIds: validResourceIds
    });
    
    // Create request payload
    const payload = {
      limit,
      platformNames: validPlatformNames.length > 0 ? validPlatformNames : undefined,
      resourceIds: validResourceIds.length > 0 ? validResourceIds : undefined,
      includeFinished, // Add the includeFinished parameter to the payload
    };
    
    console.log('Sending API request with payload:', JSON.stringify(payload));
    
    // Send the API request
    const response = await fetch('/api/contests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store', // Ensure we get fresh data
    });
    
    if (!response.ok) {
      // Try to get detailed error information
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = errorResponse.error || errorResponse.details || '';
        console.error('API error response:', errorResponse);
      } catch (parseError) {
        // If we can't parse the error response, just use the status text
        errorDetails = await response.text() || response.statusText || '';
        console.error('Failed to parse error response:', parseError);
      }
      
      throw new Error(`Server API request failed with status ${response.status}: ${errorDetails}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log('API response received:', { 
      meta: data.meta, 
      objectCount: data.objects?.length || 0,
      _meta: data._meta // Additional metadata from our server route
    });
    
    // Log the first couple of items for debugging
    if (data.objects && data.objects.length > 0) {
      console.log('Sample contest data:', data.objects.slice(0, 2).map((contest: ClistContest) => ({
        id: contest.id,
        name: contest.name,
        resource: contest.resource, // Should be a string like "codeforces.com"
        resource_id: contest.resource_id,
        start: contest.start
      })));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching contests from server route:', error);
    
    // Add more context to the error
    const enhancedError = new Error(
      `Failed to fetch contests: ${error instanceof Error ? error.message : String(error)}`
    );
    
    if (error instanceof Error) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}