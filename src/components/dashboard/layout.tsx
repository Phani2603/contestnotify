'use client';

import { Toaster } from "sonner";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ModeToggle } from "@/components/mode-toggle";

function DashboardTopBar() {
  const { setOpenMobile } = useSidebar();
  
  return (
    <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
      <button
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
        onClick={() => setOpenMobile(true)}
        aria-label="Open Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Toaster richColors position="top-right" />
      <DashboardSidebar />
      <SidebarInset>
        <div className="relative flex flex-1 flex-col p-4 md:p-6">
          <DashboardTopBar />
          <div className="pb-10">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}