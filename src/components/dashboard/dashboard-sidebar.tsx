'use client';

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Code,
  Trophy,
  ChevronRight,
  X,
  Calendar
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  // Navigation items
  const navItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard"
    },
    {
      title: "Platforms",
      href: "/dashboard/platforms",
      icon: Code,
      isActive: pathname === "/dashboard/platforms"
    },
    {
      title: "Contests",
      href: "/dashboard/contests",
      icon: Trophy,
      isActive: pathname === "/dashboard/contests"
    },
    {
      title: "Scheduler",
      href: "/dashboard/scheduler",
      icon: Calendar,
      isActive: pathname === "/dashboard/scheduler" 
    }
  ];
  
  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  // Handle sidebar toggle button click
  useEffect(() => {
    const toggleBtn = document.querySelector('[data-toggle-sidebar]');
    
    const handleToggle = () => {
      toggleSidebar();
    };
    
    toggleBtn?.addEventListener('click', handleToggle);
    return () => toggleBtn?.removeEventListener('click', handleToggle);
  }, [toggleSidebar]);
  
  // Close mobile sidebar on resize if needed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobile) {
        setOpenMobile(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar 
      collapsible="icon"
      className="border-r transition-all duration-300 shadow-sm z-50 lg:z-0" 
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <SidebarMenuButton size="lg" asChild>
            <Link href="/">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">ContestNotify</span>
                <span className="truncate text-xs">Dashboard</span>
              </div>
            </Link>
          </SidebarMenuButton>

          {/* Desktop: Sidebar collapse button */}
          <button
            className="h-8 w-8 rounded-md hover:bg-accent items-center justify-center hidden md:flex"
            aria-label="Toggle sidebar"
            data-toggle-sidebar
          >
            <ChevronRight className="size-4 transition-transform ui-expanded:rotate-180 group-data-[state=expanded]:rotate-0 group-data-[state=collapsed]:rotate-180" />
          </button>
          
          {/* Mobile: Close sidebar button */}
          <button
            className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center md:hidden"
            aria-label="Close sidebar"
            onClick={() => setOpenMobile(false)}
          >
            <X className="size-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href} onClick={handleNavigation}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto size-4 opacity-50" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserNav 
          user={{
            name: session?.user?.name || "User",
            email: session?.user?.email || "",
            avatar: session?.user?.image || "",  // Using image from session
          }}
          onSignOut={() => signOut({ redirect: true, callbackUrl: '/' })}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}