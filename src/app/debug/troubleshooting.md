# Next.js Authentication Troubleshooting Guide

This document provides solutions for common authentication issues with Next.js and NextAuth.js.

## Quick Fixes for Common Issues

### Middleware Redirect Loops

**Issue:** Pages keep redirecting or you get "Too Many Redirects" errors.

**Solutions:**
1. Make sure your middleware excludes API routes:
   ```typescript
   // In middleware.ts
   export function middleware(request: NextRequest) {
     // Skip API routes
     if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.next();
     }
     
     // Rest of your middleware logic
   }
   ```

2. Exclude auth-related paths:
   ```typescript
   // In middleware.ts
   export const config = {
     matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
   }
   ```

### Sessions Not Persisting

**Issue:** User is redirected to sign in despite successful authentication.

**Solutions:**
1. Check MongoDB connection - verify that collections are being created:
   - Use the Debug page to check if MongoDB is connected and NextAuth collections exist
   
2. Verify JWT settings in NextAuth config:
   ```typescript
   // In [...nextauth]/route.ts
   export const authOptions: NextAuthOptions = {
     // ...
     session: {
       strategy: "jwt", // Make sure this is set to "jwt"
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     // ...
   }
   ```

3. Check the browser's local storage and cookies:
   - Verify that `next-auth.session-token` cookie is set
   - Inspect Local Storage for next-auth items

### OAuth Provider Issues

**Issue:** GitHub or other OAuth provider login fails.

**Solutions:**
1. Verify environment variables:
   - `GITHUB_ID` and `GITHUB_SECRET` are correctly set
   - `NEXTAUTH_URL` matches your application URL (e.g., http://localhost:3000 for local development)
   
2. Check OAuth callback URLs:
   - GitHub: Verify that your callback URL (`/api/auth/callback/github`) is registered in your GitHub OAuth App settings
   
3. Inspect Network tab during authentication:
   - Look for HTTP errors when redirecting to provider
   - Verify callback is properly reaching your app

### TypeScript Errors with Session

**Issue:** TypeScript errors when accessing custom properties like `session.user.role`.

**Solutions:**
1. Properly extend NextAuth types:
   ```typescript
   // In types/next-auth.d.ts
   import NextAuth from "next-auth";
   
   declare module "next-auth" {
     interface Session {
       user: {
         id?: string;
         name?: string;
         email?: string;
         image?: string;
         role?: string;
       }
     }
   }
   ```

2. Make sure you're using the JWT callbacks to include custom fields:
   ```typescript
   callbacks: {
     jwt: async ({ token, user }) => {
       if (user) {
         token.role = user.role;
         token.id = user.id;
       }
       return token;
     },
     session: async ({ session, token }) => {
       if (session.user) {
         session.user.role = token.role as string;
         session.user.id = token.id as string;
       }
       return session;
     },
   }
   ```

## Debugging Steps

1. Use the `/debug` page to inspect session state and database records
2. Check browser console for errors related to Next.js or authentication
3. Verify environment variables are correctly set
4. Check that MongoDB is properly connected and accessible
5. Test API routes directly to ensure they're not being blocked by middleware

## Environment Setup Checklist

- [ ] `NEXTAUTH_URL` is set to your application URL
- [ ] `NEXTAUTH_SECRET` is set to a secure random string
- [ ] OAuth provider credentials are properly configured
- [ ] MongoDB connection string is correct and the database is accessible
- [ ] Middleware is configured to exclude API routes

## Common Error Messages and Solutions

- **TypeError: Cannot destructure property 'user' of 'session' as it is null:** User is not authenticated, check session persistence.
- **Error: PKCE verification failed:** OAuth callback issue, check provider configuration.
- **MongoDB connection error:** Check your MongoDB URI and network access.
- **Invalid JWT:** Secret may have changed, or JWT token might be corrupt, clear cookies and try again.