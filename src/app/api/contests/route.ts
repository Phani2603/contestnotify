import { NextResponse } from 'next/server';
import { PLATFORM_TO_RESOURCE_ID } from '@/lib/api/clist';

// Types for request
interface ContestRequest {
  limit?: number;
  platformNames?: string[];
  resourceIds?: number[];
  includeFinished?: boolean;
}

export async function POST(request: Request) {
  try {
    // Parse request body with better error handling
    let body: ContestRequest;
    
    try {
      body = await request.json();
      console.log('API request body received:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Could not parse JSON' },
        { status: 400 }
      );
    }
    
    // Validate request body
    if (!body) {
      console.error('Empty request body');
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Request body is empty' },
        { status: 400 }
      );
    }
    
    // Validate platformNames if provided
    if (body.platformNames !== undefined) {
      if (!Array.isArray(body.platformNames)) {
        console.error('platformNames is not an array:', body.platformNames);
        return NextResponse.json(
          { error: 'Invalid platformNames', details: 'platformNames must be an array' },
          { status: 400 }
        );
      }
      
      // Filter out any non-string or empty platform names
      body.platformNames = body.platformNames
        .filter(name => typeof name === 'string' && name.trim().length > 0);
    }
    
    // Validate resourceIds if provided
    if (body.resourceIds !== undefined) {
      if (!Array.isArray(body.resourceIds)) {
        console.error('resourceIds is not an array:', body.resourceIds);
        return NextResponse.json(
          { error: 'Invalid resourceIds', details: 'resourceIds must be an array' },
          { status: 400 }
        );
      }
    }
    
    // Validate required API credentials
    const apiUsername = process.env.CLIST_API_USERNAME || process.env.NEXT_PUBLIC_CLIST_API_USERNAME;
    const apiKey = process.env.CLIST_API_KEY || process.env.NEXT_PUBLIC_CLIST_API_KEY;
    
    if (!apiUsername || !apiKey) {
      console.error('API credentials missing');
      return NextResponse.json(
        { error: 'API credentials not configured', details: 'Missing username or API key' },
        { status: 500 }
      );
    }
    
    // Build request parameters
    const params = new URLSearchParams();
    
    // Add limit parameter
    if (body.limit && typeof body.limit === 'number') {
      params.append('limit', body.limit.toString());
    } else {
      params.append('limit', '50'); // Default limit
    }
    
    // Convert platform names to resource IDs if provided
    let resourceIds: number[] = [];
    
    if (body.platformNames && body.platformNames.length > 0) {
      console.log('Platform names received:', body.platformNames);
      console.log('Available platform mappings:', Object.keys(PLATFORM_TO_RESOURCE_ID));
      
      // Create a case-insensitive mapping for platform names
      const platformMap = Object.entries(PLATFORM_TO_RESOURCE_ID).reduce((map, [key, value]) => {
        map[key.toLowerCase()] = value;
        return map;
      }, {} as Record<string, number>);
      
      // Log each platform name and its mapping (or lack of)
      body.platformNames.forEach(name => {
        // Try exact match first
        let resourceId = PLATFORM_TO_RESOURCE_ID[name];
        
        // If not found, try case-insensitive matching
        if (resourceId === undefined && name) {
          resourceId = platformMap[name.toLowerCase()];
        }
        
        console.log(`Platform '${name}' -> Resource ID: ${resourceId !== undefined ? resourceId : 'Not found'}`);
      });
      
      resourceIds = body.platformNames
        .map(name => {
          // Try exact match first
          const exactMatch = PLATFORM_TO_RESOURCE_ID[name];
          if (exactMatch !== undefined) return exactMatch;
          
          // Then try case-insensitive match
          return name ? platformMap[name.toLowerCase()] : undefined;
        })
        .filter(id => id !== undefined) as number[];
        
      console.log('Converted platform names to resource IDs:', {
        platformNames: body.platformNames,
        resourceIds
      });
      
      // If no valid resource IDs were found, log a warning
      if (resourceIds.length === 0 && body.platformNames.length > 0) {
        console.warn('None of the provided platform names matched valid resource IDs!');
      }
    } else if (body.resourceIds && body.resourceIds.length > 0) {
      resourceIds = body.resourceIds;
    }
    
    // Add resource filter if we have resource IDs
    if (resourceIds.length > 0) {
      // Fix: Changed from resource__id__in to resource_id__in (single underscore between resource and id)
      params.append('resource_id__in', resourceIds.join(','));
    }
    
    // Add upcoming contests filter (contests that haven't ended yet)
    const now = new Date().toISOString();
    
    // Only filter for active contests if includeFinished is false
    if (!body.includeFinished) {
      params.append('end__gt', now);
    }
    
    // Add sorting by start time
    params.append('order_by', 'start');
    
    // Ensure we get consistent UTC times
    params.append('format_time', 'false');
    
    // Make API request
    const url = `https://clist.by/api/v4/contest/?${params.toString()}`;
    console.log('Making API request to:', url);
    console.log('Request parameters:', Object.fromEntries(params.entries()));
    
    // Log specific parameters for debugging
    console.log('Using resource_id__in parameter:', params.get('resource_id__in') || 'Not set');
    console.log('Using end__gt parameter:', params.get('end__gt'));
    console.log('Using limit parameter:', params.get('limit'));
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `ApiKey ${apiUsername}:${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CLIST API request failed with status ${response.status}:`, errorText);
      
      return NextResponse.json(
        { 
          error: `CLIST API request failed with status ${response.status}`,
          details: errorText,
          request: {
            url: url.replace(apiKey, '***API_KEY***'), // Hide API key in logs
            resourceIds,
            parameters: Object.fromEntries(params.entries())
          }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return contest data with metadata
    return NextResponse.json({
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        resourceCount: resourceIds.length,
        parameterCount: Array.from(params.keys()).length
      }
    });
  } catch (error) {
    console.error('Error fetching contests from CLIST API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contests', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}