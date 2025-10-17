'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AuthStatus() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div className="text-sm text-white/70">Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/signin">
          <Button variant="ghost" className="text-white hover:text-white/70">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button className="bg-white text-black hover:bg-white/90">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span className="font-medium">{session?.user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                className="rounded-full"
                width={28}
                height={28}
              />
            ) : (
              <span>{session?.user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            Dashboard
          </DropdownMenuItem>
        </Link>
        <Link href="/api/auth/signout">
          <DropdownMenuItem className="cursor-pointer">
            Sign Out
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}