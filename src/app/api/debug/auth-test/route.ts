import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * API Route to test authentication from the server side
 */
export async function GET(req: NextRequest) {
  try {
    // Get the session from the server-side using two different methods
    // to help diagnose where the issue might be

    // Method 1: Get token directly
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Method 2: Use getServerSession
    const session = await getServerSession(authOptions);

    // Check for environment variables
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    };

    // Get all cookies for debugging
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookies = cookies.filter(c => 
      c.startsWith('next-auth.session-token=') || 
      c.startsWith('__Secure-next-auth.session-token=')
    );

    return NextResponse.json({
      tokenAuth: {
        authenticated: !!token,
        tokenExists: !!token,
        tokenData: token ? {
          name: token.name,
          email: token.email,
          role: token.role,
          exp: token.exp,
          iat: token.iat
        } : null
      },
      sessionAuth: {
        authenticated: !!session,
        sessionExists: !!session,
        sessionData: session ? {
          user: {
            name: session.user?.name,
            email: session.user?.email,
            role: session.user?.role
          },
          expires: session.expires
        } : null
      },
      environment: envVars,
      cookies: {
        count: cookies.length,
        sessionCookies: sessionCookies.length,
        sessionCookieNames: sessionCookies.map(c => c.split('=')[0]),
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}