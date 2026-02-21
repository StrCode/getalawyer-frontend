"use client";

import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Clear registration-related cache before signing out
    localStorage.removeItem('registration-draft');
    localStorage.removeItem('offline-operation-queue');
    
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login" }),
      },
    });
  };

  return (
    <div className="top-0 z-10 sticky flex justify-between items-center bg-gray-100 px-6 py-4 w-full">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <SidebarTrigger className="text-gray-600 hover:text-gray-900 shrink-0" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button size="sm" variant="outline" onClick={handleSignOut} className="hover:bg-gray-200 border-gray-300 text-gray-700">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
