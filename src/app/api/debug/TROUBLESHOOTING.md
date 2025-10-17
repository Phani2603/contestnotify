# NextAuth Authentication Troubleshooting Guide

This guide is designed to help troubleshoot authentication issues with NextAuth.js in the ContestNotify application.

## Environment Variables

Make sure you have correctly set up the following environment variables:

```
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
MONGODB_URI=your_mongodb_uri
```

> **Important**: NextAuth.js expects specific environment variable names. 
> - Use `GITHUB_ID` not `GITHUB_CLIENT_ID`
> - Use `GITHUB_SECRET` not `GITHUB_CLIENT_SECRET`
> - Use `NEXTAUTH_SECRET` not `AUTH_SECRET` 

## Authentication Flow

1. **When a user signs in**:
   - NextAuth.js creates a JWT token containing user information
   - The token is stored in a HTTP-Only cookie (not localStorage)
   - For GitHub auth, user information is stored in the MongoDB database

2. **On subsequent requests**:
   - NextAuth.js reads the cookie to verify authentication status
   - The session is validated against the expiration date in the JWT
   - If using database sessions, the session is also checked in the database

## Common Issues and Solutions

### "Not Authenticated" Error

If you're getting "Not authenticated, No token in localStorage" errors:

1. **Check cookies, not localStorage**:
   - NextAuth.js uses cookies by default, not localStorage
   - Use browser dev tools to check if `next-auth.session-token` or `__Secure-next-auth.session-token` cookies exist

2. **Verify server-side session**:
   - Use the `/api/debug/session` endpoint to check if the server recognizes your session
   - Compare with client-side session from `useSession()` hook

3. **CORS issues**:
   - If accessing from a different origin, you may need to configure CORS settings

### Database Issues

1. **MongoDB Connection**:
   - Use `/api/debug/mongodb` endpoint to check if MongoDB is connected
   - Verify that NextAuth collections exist (users, accounts, sessions)

2. **Missing User Records**:
   - Use `/api/debug/auth` endpoint to check if user accounts exist in the database
   - If records are missing, there might be issues during sign-up

### OAuth Provider Issues

1. **GitHub Authentication**:
   - Ensure GitHub OAuth app has the correct callback URL: `https://your-domain.com/api/auth/callback/github`
   - Check for error messages in the browser console and server logs
   - Verify GITHUB_ID and GITHUB_SECRET are correctly set

2. **Callback Errors**:
   - If you see "Error: Callback" messages, check your GitHub OAuth settings
   - The callback URL in your GitHub app settings must exactly match your NextAuth.js callback URL

## Debugging Tools

This application includes several debugging tools:

1. **Authentication Debug Panel**: `/dashboard/debug` - Visual interface for checking session status
2. **API Debug Endpoints**:
   - `/api/debug/auth` - Check user records in MongoDB
   - `/api/debug/mongodb` - Check MongoDB connection
   - `/api/debug/session` - Check server-side session
3. **NextAuth.js Debug Mode**: Enabled in development to show detailed logs

## JWT vs Database Sessions

ContestNotify uses JWT sessions (default NextAuth.js behavior):
- Session data is stored in an encrypted cookie
- No database queries required to validate sessions
- The JWT token contains user information, including custom fields like `role`

If you were expecting database sessions instead, you would need to change the `session.strategy` option to `"database"` in your NextAuth.js configuration.

## Session Data Structure

When debugging, be aware of the session data structure:

```typescript
{
  user: {
    name: string,
    email: string,
    image?: string,
    id: string,    // Added by our custom callback
    role: string   // Added by our custom callback
  },
  expires: string  // ISO date string
}
```

## Next Steps If Still Having Issues

1. Check browser developer tools Network tab for failed requests
2. Look at server-side logs for authentication errors
3. Review cookies in browser developer tools Application tab
4. Try clearing cookies and signing in again
5. Test with a different provider if available
6. Verify your MongoDB database is accessible and the collections are properly set up