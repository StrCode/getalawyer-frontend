"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Github, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { clearEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export function Header() {
  const navigate = useNavigate();
  const { data: session, error, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    // Clear all onboarding-related cache before signing out
    clearEnhancedOnboardingStore();
    localStorage.removeItem('onboarding-form-draft');
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('offline-operation-queue');
    
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login" }),
      },
    });
  };

  return (
    <div className="top-0 z-10 sticky flex justify-between items-center bg-background px-3 sm:px-4 md:px-7 py-2.5 sm:py-3 border-border border-b w-full">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <h1 className="font-medium text-foreground text-base truncate">
          Welcome back, {session?.user.name.split(" ")[0]} 👋
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        <Button size="lg" variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>

        {/* <div className="hidden lg:flex items-center gap-3"> */}
        {/*   <Button variant="outline" size="sm" className="gap-2"> */}
        {/*     <Download className="size-4" /> */}
        {/*     <span className="hidden xl:inline">Export</span> */}
        {/*   </Button> */}
        {/*   <Button size="sm" className="gap-2"> */}
        {/*     <Plus className="size-4" /> */}
        {/*     <span className="hidden xl:inline">New Project</span> */}
        {/*   </Button> */}
        {/* </div> */}
        {/* <Button variant="ghost" size="icon-sm" className="shrink-0"> */}
        {/*   <Link */}
        {/*     to="https://github.com/ln-dev7/square-ui/tree/master/templates/dashboard-1" */}
        {/*     target="_blank" */}
        {/*     rel="noopener noreferrer" */}
        {/*   > */}
        {/*     <Github className="size-4" /> */}
        {/*   </Link> */}
        {/* </Button> */}
        {/* {/* <ThemeToggle /> */}
      </div>
    </div>
  );
}
