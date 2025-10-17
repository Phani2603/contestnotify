'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthDebug } from "@/components/auth-debug";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spotlight } from "@/components/ui/spotlight";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log("Attempting sign in with credentials:", { email });

    try {
      // Use signIn with credentials provider
      const result = await signIn('credentials', {
        redirect: false, // Don't redirect automatically
        callbackUrl, // Pass through the callback URL
        email, // Pass credential fields
        password,
      });

      console.log("Sign-in result:", result);

      if (!result?.ok) {
        setError(result?.error || 'Invalid email or password');
      } else {
        // Force a FULL page reload to update the session
        // This ensures the cookies are properly set and read
        console.log("Authentication successful, hard redirecting to:", callbackUrl);
        
        // Small timeout to ensure cookie is set before redirect
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="max-w-md w-full mx-auto p-4 relative z-10">
        <Card className="p-8 bg-black border border-white/[0.2] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Sign In</h2>

            <div className="mb-4">
              <AuthDebug />
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 text-red-500 text-center rounded">
                {error}
              </div>
            )}

            {/* OAuth Providers */}
            <div className="flex flex-col gap-3 mb-6">
              <Button
                onClick={() => {
                  console.log("Starting GitHub authentication");
                  setIsLoading(true);
                  // Use explicit redirect URL for GitHub auth
                  signIn('github', { 
                    callbackUrl: '/dashboard', 
                    redirect: true 
                  }).catch(err => {
                    console.error("GitHub sign-in error:", err);
                    setIsLoading(false);
                  });
                }}
                disabled={isLoading}
                className="bg-[#24292F] hover:bg-[#24292F]/90 text-white"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-black text-white/40">or continue with</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}