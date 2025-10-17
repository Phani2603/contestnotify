import { NextResponse } from "next/server";

// A simple diagnostic route to check if middleware is allowing access to this route
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    middlewareTest: "This route is accessible, which means the middleware is correctly allowing access to API routes",
    nextAuthConfig: {
      baseUrl: process.env.NEXTAUTH_URL || "Not set",
      secretSet: Boolean(process.env.NEXTAUTH_SECRET),
      githubConfigured: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
      dbConfigured: Boolean(process.env.MONGODB_URI),
    },
    // Debug info - value will be masked
    envCheck: {
      GITHUB_ID_PREFIX: process.env.GITHUB_ID?.substring(0, 3) || "missing",
      GITHUB_SECRET_PREFIX: process.env.GITHUB_SECRET?.substring(0, 3) || "missing",
      NEXTAUTH_SECRET_PREFIX: process.env.NEXTAUTH_SECRET?.substring(0, 3) || "missing"
    }
  });
}