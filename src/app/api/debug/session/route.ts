import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// This route shows whether the user is authenticated according to the server
export async function GET() {
  try {
    // Get the session from the server side
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        expires: session.expires,
        user: {
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role || 'Not defined',
        }
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown session error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}