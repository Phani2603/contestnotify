import { NextRequest, NextResponse } from "next/server";
// Import the getToken helper from next-auth/jwt
import { getToken } from "next-auth/jwt";

// Get first-time user status from cookie
function isFirstTimeUser(req: NextRequest): boolean {
  const firstTimeUserCookie = req.cookies.get('first-time-user');
  return !firstTimeUserCookie || firstTimeUserCookie.value === 'true';
}

export default async function middleware(req: NextRequest) {
  // Get the token with proper error handling
  let token = null;
  let isAuthenticated = false;
  
  try {
    // Debug token extraction
    console.log("Middleware checking authentication for path:", req.nextUrl.pathname);
    
    token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    isAuthenticated = !!token;
    console.log("Authentication result:", isAuthenticated ? "Authenticated" : "Not authenticated");
  } catch (error) {
    console.error("Middleware token error:", error);
    isAuthenticated = false;
  }

  // Get the pathname of the request
  const path = req.nextUrl.pathname;
  
  // Skip middleware for API routes, especially auth callbacks
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Define protected routes that require authentication
  const isProtectedRoute = path.startsWith("/dashboard");
  
  // Define admin-only routes
  const isAdminRoute = path.startsWith("/admin");
  
  // Define auth routes (signin, signup)
  const isAuthRoute = path.startsWith("/auth/signin") || path.startsWith("/auth/signup");

  // If user is on auth page but already authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`Protected route ${req.nextUrl.pathname} accessed without authentication, redirecting to sign in`);
    
    // Store the original URL to redirect back after authentication
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    
    // Add a debug parameter to indicate redirect happened from middleware
    const redirectUrl = `/auth/signin?callbackUrl=${callbackUrl}&from=middleware`;
    
    // Send user to the sign-in page
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  
  // Handle admin routes - check for admin role
  if (isAdminRoute && (!isAuthenticated || token?.role !== "admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // First-time user flow: Redirect to platforms page when accessing dashboard 
  // (except platforms page itself)
  if (
    isAuthenticated && 
    isFirstTimeUser(req) && 
    path === '/dashboard' &&
    !path.startsWith('/api/')
  ) {
    console.log('First-time user, redirecting to platforms page');
    return NextResponse.redirect(new URL('/dashboard/platforms', req.url));
  }
  
  // Mark first-time user as completed if they visit the platforms page
  if (path === '/dashboard/platforms' && isAuthenticated) {
    const response = NextResponse.next();
    response.cookies.set('first-time-user', 'false', { 
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true
    });
    return response;
  }
  
  // Allow all other routes
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*", 
    // Admin routes
    "/admin/:path*",
    // Auth routes
    "/auth/:path*",
    // Exclude API routes, static files, etc.
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|.*\\..*).*)",
  ],
};