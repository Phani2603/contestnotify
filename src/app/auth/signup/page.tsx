'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spotlight } from "@/components/ui/spotlight";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
      } else {
        // Initialize database to ensure collections are created
        try {
          await fetch('/api/setup/db');
        } catch (err) {
          console.error('Database setup error:', err);
          // Continue even if DB setup fails, as the user can still sign in
        }
        
        // Redirect to sign-in page after successful registration
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Create an Account</h2>

            {error && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 text-red-500 text-center rounded">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="John Doe"
                />
              </div>
              
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
                  minLength={8}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="••••••••"
                />
                <p className="text-xs text-white/40 mt-1">Password must be at least 8 characters</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-500 hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}