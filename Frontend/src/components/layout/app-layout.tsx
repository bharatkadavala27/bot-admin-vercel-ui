import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { useAuth } from "@/hooks/use-auth";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isMounted, isAuthenticated, navigate]);



  return (
    <div className="h-screen flex w-full overflow-hidden bg-muted/20 selection:bg-primary/20 selection:text-primary fixed inset-0">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-background relative">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-5 sm:px-6 py-5 sm:py-6 max-w-[1440px] w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
