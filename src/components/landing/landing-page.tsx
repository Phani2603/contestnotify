"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import FeaturesSectionDemo from "@/components/ui/features-section-demo-3";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const testimonials = [
  {
    quote: "ContestNotify keeps me on track with all programming contests. Never missed a Codeforces round since!",
    name: "Alex Chen",
    title: "Software Engineer at Google",
  },
  {
    quote: "The notification system is perfect. I get reminders exactly when I need them.",
    name: "Maria Rodriguez",
    title: "CS Student at MIT",
  },
  {
    quote: "Having all contests in one place saved me hours of checking multiple websites.",
    name: "Raj Patel",
    title: "Competitive Programmer",
  },
  {
    quote: "The customizable reminders are a game-changer for my competition schedule.",
    name: "Sophie Kim",
    title: "ICPC World Finalist",
  },
  {
    quote: "Clean interface, reliable notifications. Exactly what I needed.",
    name: "David Johnson",
    title: "LeetCode Power User",
  },
];

// Navigation items are defined in the component's render function

export function LandingPage() {
  // Define navigation items
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Testimonials", link: "#testimonials" },
    { name: "Pricing", link: "#pricing" },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Resizable navbar */}
      <Navbar className="fixed top-0">
        {/* Desktop navbar */}
        <NavBody>
          {/* Logo - left side */}
          <div className="relative z-20 flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
              <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
                <span className="text-sm font-bold">CN</span>
              </div>
            </div>
            <span className="font-display font-bold text-lg">ContestNotify</span>
          </div>

          {/* Navigation items - center */}
          <NavItems items={navItems} />
          
          {/* Buttons - right side */}
          <div className="relative z-20 ml-auto flex items-center gap-4">
            <ModeToggle />
            <NavbarButton href="/auth/signin" variant="secondary">
              Log in
            </NavbarButton>
            <NavbarButton 
              href="/auth/signup"
              variant="primary"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
            >
              <span className="relative z-10">Sign up free</span>
            </NavbarButton>
          </div>
        </NavBody>
        
        {/* Mobile navbar */}
        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
                  <span className="text-sm font-bold">CN</span>
                </div>
              </div>
              <span className="font-display font-bold text-lg">ContestNotify</span>
            </div>
            
            <div className="flex items-center gap-4">
              <ModeToggle />
              <MobileNavToggle isOpen={isMenuOpen} onClick={toggleMenu} />
            </div>
          </MobileNavHeader>
          
          <MobileNavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.link}
                className="w-full rounded-md px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex w-full flex-col gap-2">
              <NavbarButton href="/auth/login" variant="secondary" className="w-full">
                Log in
              </NavbarButton>
              <NavbarButton 
                href="/auth/signup" 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              >
                Sign up free
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero section with spotlight */}
      <section className="relative min-h-screen pt-40 pb-20 flex flex-col items-center justify-center px-4 overflow-hidden">
        <Spotlight
          className="top-0 left-0 md:-top-40 md:-left-40 opacity-20"
          fill="white"
        />
        
        <div className="container relative z-10 mx-auto text-center max-w-5xl">
         
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Your Centralized Hub for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Competitive Programming
            </span>
          </h1>
          
          <TextGenerateEffect 
            className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
            words="Get timely notifications for all your favorite coding platforms. Track contests from Codeforces, LeetCode, CodeChef, HackerRank and more - all in one dashboard."
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/auth/signup"
              className={cn(
                "group relative text-white px-8 py-3 rounded-full font-medium text-lg shadow-lg",
                "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
                "transition-all duration-300"
              )}
            >
              <span className="relative z-10 inline-block group-hover:animate-pulse">Get Started — It&apos;s Free</span>
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-md group-hover:blur-xl transition-all duration-500"></span>
              </span>
              
            </Link>
            <Link
              href="#features"
              className={cn(
                "px-8 py-3 rounded-full font-medium text-lg",
                "border border-foreground/20 hover:bg-foreground/5 transition-all"
              )}
            >
              See features
            </Link>
          </div>
          
          {/* Preview image */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/50 shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-blue-500/5" />
            <Image
              src="https://i.pinimg.com/736x/00/15/06/001506c53199495488b7445405ef5f60.jpg"
              alt="ContestNotify Dashboard Preview"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 dark:to-background/90" />
          </div>
        </div>
        
        <BackgroundBeams className="opacity-10" />
      </section>

      {/* Features section */}
      <section id="features" className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Powerful{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Features
              </span>{" "}
              for Competitive Programmers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay on top of your competitive programming game.
            </p>
          </div>
          
          <FeaturesSectionDemo />
          
        </div>
      </section>
      
      {/* Testimonials section */}
      <section id="testimonials" className="py-20 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Loved by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Programmers
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of competitive programmers who never miss a contest.
          </p>
        </div>
        
        <div className="overflow-hidden w-full">
          <div className="flex overflow-hidden space-x-4 group">
            <div className="flex space-x-4 animate-scroll">
              {testimonials.concat(testimonials).map((item, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-[350px] rounded-2xl border border-border bg-background px-8 py-6 shadow-sm"
                >
                  <div className="flex items-end justify-between mb-4">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground opacity-50">
                      <path d="M14.0171 10.8276C14.2918 9.15352 15.3091 7.55448 16.9674 6.16896C17.6664 5.58342 17.8741 4.62335 17.3937 3.90933C16.9172 3.20177 15.9538 2.98516 15.243 3.46298C12.0922 5.71634 10.0481 8.68298 10.0481 12.2322C10.0481 15.7814 12.5231 18.5625 15.7417 18.5625C17.8662 18.5625 19.5882 16.8405 19.5882 14.7159C19.5882 12.3485 17.4635 10.5567 14.0171 10.8276Z" fill="currentColor"/>
                      <path d="M4.97586 10.8276C5.25059 9.15352 6.26781 7.55448 7.92617 6.16896C8.62511 5.58342 8.83279 4.62335 8.35241 3.90933C7.87587 3.20177 6.91248 2.98516 6.20172 3.46298C3.05094 5.71634 1.00684 8.68298 1.00684 12.2322C1.00684 15.7814 3.48176 18.5625 6.7004 18.5625C8.82492 18.5625 10.5469 16.8405 10.5469 14.7159C10.5469 12.3485 8.42235 10.5567 4.97586 10.8276Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <blockquote className="text-foreground mb-4 min-h-[80px]">
                    {item.quote}
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-muted-foreground text-xs">{item.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden w-full mt-8">
          <div className="flex overflow-hidden space-x-4 group">
            <div className="flex space-x-4" style={{ animationDirection: 'reverse', animation: 'scroll 60s linear infinite' }}>
              {testimonials.concat(testimonials).reverse().map((item, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-[350px] rounded-2xl border border-border bg-background px-8 py-6 shadow-sm"
                >
                  <div className="flex items-end justify-between mb-4">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground opacity-50">
                      <path d="M14.0171 10.8276C14.2918 9.15352 15.3091 7.55448 16.9674 6.16896C17.6664 5.58342 17.8741 4.62335 17.3937 3.90933C16.9172 3.20177 15.9538 2.98516 15.243 3.46298C12.0922 5.71634 10.0481 8.68298 10.0481 12.2322C10.0481 15.7814 12.5231 18.5625 15.7417 18.5625C17.8662 18.5625 19.5882 16.8405 19.5882 14.7159C19.5882 12.3485 17.4635 10.5567 14.0171 10.8276Z" fill="currentColor"/>
                      <path d="M4.97586 10.8276C5.25059 9.15352 6.26781 7.55448 7.92617 6.16896C8.62511 5.58342 8.83279 4.62335 8.35241 3.90933C7.87587 3.20177 6.91248 2.98516 6.20172 3.46298C3.05094 5.71634 1.00684 8.68298 1.00684 12.2322C1.00684 15.7814 3.48176 18.5625 6.7004 18.5625C8.82492 18.5625 10.5469 16.8405 10.5469 14.7159C10.5469 12.3485 8.42235 10.5567 4.97586 10.8276Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <blockquote className="text-foreground mb-4 min-h-[80px]">
                    {item.quote}
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-muted-foreground text-xs">{item.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Pricing
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start with our free tier and upgrade as you grow.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free tier */}
            <div className="bg-background rounded-2xl border border-border p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Up to 3 platform integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Basic notification settings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Contest dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Community support</span>
                  </li>
                </ul>
                
                <Link
                  href="/auth/signup"
                  className={cn(
                    "block text-center py-3 rounded-lg font-medium w-full",
                    "bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  )}
                >
                  Get Started
                </Link>
              </div>
            </div>
            
            {/* Pro tier */}
            <div className="bg-background rounded-2xl border border-purple-500/40 p-8 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
              <div className="absolute -top-1 -right-1 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-bl-lg">
                POPULAR
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold">$5</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Unlimited platform integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Advanced notification settings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Calendar integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span>Priority support</span>
                  </li>
                </ul>
                
                <Link
                  href="/auth/signup?plan=pro"
                  className={cn(
                    "block text-center py-3 rounded-lg font-medium text-white w-full",
                    "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
                    "transition-all shadow-lg"
                  )}
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 relative overflow-hidden">
        <BackgroundBeams className="opacity-20" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 max-w-3xl mx-auto">
            Ready to elevate your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              competitive programming
            </span>{" "}
            experience?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of developers who never miss a contest. Get started with ContestNotify in less than 60 seconds.
          </p>
          <Link
            href="/auth/signup"
            className={cn(
              "inline-flex items-center text-white px-8 py-3 rounded-full font-medium text-lg shadow-lg",
              "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
              "transition-all duration-300 transform hover:scale-105"
            )}
          >
            Start for free
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                  <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
                    <span className="text-sm font-bold">CN</span>
                  </div>
                </div>
                <span className="font-display font-bold text-lg">ContestNotify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your centralized hub for competitive programming contests.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ContestNotify. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}