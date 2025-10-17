'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { AuthDebug } from "@/components/auth-debug";
import { useState } from "react";

export default function DirectAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle direct GitHub sign in
  const handleGithubSignIn = () => {
    setIsLoading(true);
    // Hard navigation to GitHub auth
    window.location.href = '/api/auth/signin/github?callbackUrl=/dashboard';
  };
  
  // Handle direct credentials sign in
  const handleCredentialsSignIn = () => {
    setIsLoading(true);
    // Hard navigation to built-in NextAuth sign in page
    window.location.href = '/api/auth/signin?callbackUrl=/dashboard';
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden p-4">
      <div className="max-w-md w-full mx-auto relative z-10">
        <Card className="p-8 bg-black border border-white/[0.2] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
              Direct Authentication Test
            </h2>
            
            <div className="mb-6">
              <AuthDebug />
            </div>
            
            <div className="text-white/60 text-sm mb-6">
              <p>This page provides direct authentication links that bypass client-side logic and use built-in NextAuth flows.</p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={handleGithubSignIn}
                disabled={isLoading}
                className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub Directly
              </Button>
              
              <Button
                onClick={handleCredentialsSignIn}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign in with Credentials Directly
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm text-white/50">
              <p>These links use NextAuth.js built-in pages to bypass any custom components.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}