import { NextResponse } from 'next/server';

export async function GET() {
  // This is a debug route to verify CLIST API credentials are properly configured
  try {
    console.log('Debug API endpoint accessed for CLIST verification');
    
    // Check if environment variables are available server-side
    const serverEnvCheck = {
      username: process.env.CLIST_API_USERNAME ? '✓' : '✗',
      apiKey: process.env.CLIST_API_KEY ? '✓' : '✗',
      nextPublicUsername: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
      nextPublicApiKey: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗',
    };
    
    console.log('Environment variables check:', serverEnvCheck);
    
    // Make a minimal request to the CLIST API to verify credentials
    // We'll just request 1 contest to minimize bandwidth
    const clistUrl = new URL('https://clist.by/api/v4/contest/');
    clistUrl.searchParams.append('limit', '1');
    
    const apiUsername = process.env.CLIST_API_USERNAME || process.env.NEXT_PUBLIC_CLIST_API_USERNAME;
    const apiKey = process.env.CLIST_API_KEY || process.env.NEXT_PUBLIC_CLIST_API_KEY;
    
    if (!apiUsername || !apiKey) {
      console.error('API credentials missing');
      return NextResponse.json({
        success: false,
        error: 'CLIST API credentials not configured',
        environmentCheck: serverEnvCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('Making CLIST API request to verify credentials');
    
    const response = await fetch(clistUrl.toString(), {
      headers: {
        'Authorization': `ApiKey ${apiUsername}:${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CLIST API returned status ${response.status}:`, errorText);
      
      return NextResponse.json({
        success: false,
        error: `CLIST API returned status ${response.status}`,
        statusText: response.statusText,
        responseText: errorText,
        environmentCheck: serverEnvCheck,
        timestamp: new Date().toISOString(),
        request: {
          url: clistUrl.toString().replace(apiKey, '***API_KEY***'),
        }
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('CLIST API response received successfully');
    
    return NextResponse.json({
      success: true,
      environmentCheck: serverEnvCheck,
      timestamp: new Date().toISOString(),
      apiResponse: {
        meta: data.meta,
        objectCount: data.objects?.length || 0,
        sample: data.objects?.[0] ? {
          name: data.objects[0].event,
          platform: data.objects[0].resource?.name,
          start: data.objects[0].start,
          end: data.objects[0].end,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error in debug CLIST API endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}