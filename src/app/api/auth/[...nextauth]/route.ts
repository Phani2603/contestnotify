import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import "./debug"; // Import debug logging
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/auth";
import { Adapter } from "next-auth/adapters";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "contestnotify",
  }) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          // Debug log to help trace the authentication flow
          console.log(`Attempting to authenticate user: ${credentials.email}`);
          
          const user = await getUserByEmail(credentials.email);
          
          if (!user || !user.password) {
            console.log(`User not found or missing password: ${credentials.email}`);
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            console.log(`Password validation failed for: ${credentials.email}`);
            return null;
          }
          
          console.log(`Authentication successful for: ${credentials.email}`);
          
          return {
            id: user._id ? user._id.toString() : user.id as string,
            email: user.email,
            name: user.name,
            role: user.role || "user",
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // @ts-expect-error - NextAuth type issues
    async jwt({ token, user, account, trigger = "unknown" }) {
      // Add enhanced debug logging
      console.log("JWT Callback:", { 
        trigger,
        tokenSub: token?.sub, 
        userId: user?.id, 
        provider: account?.provider,
        hasUser: !!user,
        hasAccount: !!account,
        tokenExp: token.exp,
        tokenIat: token.iat
      });
      
      // First-time sign in - add user details to the token
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        console.log("JWT: First-time authentication - adding user data to token:", { 
          id: user.id, 
          email: user.email,
          role: user.role || "user" 
        });
      }
      
      // Always return the complete token
      return token;
    },
    // @ts-expect-error - NextAuth type issues
    async session({ session, token, newSession, trigger = "unknown" }) {
      // Add enhanced debug logging
      console.log("Session Callback:", { 
        trigger,
        sessionUser: !!session?.user, 
        tokenSub: token?.sub,
        tokenId: token?.id,
        expires: session?.expires,
        isNewSession: !!newSession
      });
      
      // Add user ID and role to the session from the token
      if (token && session.user) {
        // Ensure all user properties are added to the session
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Make sure email and name are included (sometimes missing)
        if (token.email && !session.user.email) {
          session.user.email = token.email as string;
        }
        
        if (token.name && !session.user.name) {
          session.user.name = token.name as string;
        }
        
        if (token.picture && !session.user.image) {
          session.user.image = token.picture as string;
        }
        
        console.log("Session: Complete user data added to session:", { 
          id: session.user.id, 
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        });
      } else {
        console.log("Session: No token or session.user available", {
          hasToken: !!token,
          hasSessionUser: !!session?.user
        });
      }
      return session;
    },
    // Ensure proper redirection after sign in
    // @ts-expect-error - NextAuth type issues
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback running with:", { url, baseUrl });
      
      // Handle OAuth callback URLs - always send to dashboard
      if (url.includes('/api/auth/callback/')) {
        console.log("OAuth callback detected, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Handle direct sign-ins or sign-in pages
      if (url === '/api/auth/signin/' || url === '/auth/signin') {
        console.log("Sign-in page detected, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // If URL starts with callbackUrl parameter, extract and use it
      if (url.includes('callbackUrl=')) {
        try {
          const parsedUrl = new URL(url);
          const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
          if (callbackUrl) {
            console.log("Using callbackUrl parameter:", callbackUrl);
            return callbackUrl.startsWith('/') 
              ? `${baseUrl}${callbackUrl}` 
              : callbackUrl;
          }
        } catch (error) {
          console.error("Error parsing URL with callbackUrl:", error);
        }
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        console.log("Relative URL detected:", url);
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        console.log("Same-origin URL detected:", url);
        return url;
      }
      
      // Default fallback
      console.log("Using default redirect to dashboard");
      return `${baseUrl}/dashboard`;
    },
  },
  // Fix cookie configuration
  cookies: {
    sessionToken: {
      // Don't use __Secure- prefix in development as it requires HTTPS
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// ts-expect-error - NextAuth type issues with Next.js App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };