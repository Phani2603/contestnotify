import { NextResponse } from "next/server";

// This route helps debug environment variables
export async function GET() {
  return NextResponse.json({
    variables: {
      GITHUB_ID: process.env.GITHUB_ID ? "Set ✓" : "Not set ✗",
      GITHUB_SECRET: process.env.GITHUB_SECRET ? "Set ✓" : "Not set ✗",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set ✓" : "Not set ✗",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
      NODE_ENV: process.env.NODE_ENV,
    },
    // Don't include actual values for security
  });
}