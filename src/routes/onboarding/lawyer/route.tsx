import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";
import { checkAndRedirectToCurrentStep, onboardingSyncService } from "@/lib/onboarding-sync";
import { clearEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session } = authClient.useSession();

  // Custom signOut function that also clears onboarding data
  const handleSignOut = () => {
    // Clear onboarding store data before signing out
    clearEnhancedOnboardingStore();
    
    // Then sign out
    signOut({}, { onSuccess: () => navigate({ to: "/" }) });
  };

  // Initialize sync service and handle redirection when entering onboarding flow
  useEffect(() => {
    console.log('Lawyer onboarding layout mounted, initializing sync...');
    
    const initializeAndRedirect = async () => {
      try {
        // First initialize the sync service
        await onboardingSyncService.initializeSync();
        console.log('Sync service initialized in onboarding layout');
        
        // Only redirect if we're on the base onboarding route
        if (location.pathname === '/onboarding/lawyer' || location.pathname === '/onboarding/lawyer/') {
          const targetRoute = await checkAndRedirectToCurrentStep();
          if (targetRoute && targetRoute !== location.pathname) {
            console.log(`Redirecting from ${location.pathname} to ${targetRoute}`);
            navigate({ to: targetRoute });
          }
        }
      } catch (error) {
        console.warn('Failed to initialize sync service or redirect in onboarding layout:', error);
      }
    };

    initializeAndRedirect();
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-stone-50/10 flex flex-col">
      <header className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between" role="banner">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium" aria-label="Go to homepage">
            <Logo className="h-8" />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="link"
            onClick={handleSignOut}
            className="text-sm text-black pr-0"
            aria-label="Sign out of your account"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" aria-hidden="true" />
            Sign out
          </Button>
          <span className="text-neutral-500 hidden md:inline" aria-label={`Signed in as ${session?.user.email}`}>
            ({session?.user.email})
          </span>
        </div>
      </header>

      <div className="flex justify-center">
        <main className="w-full max-w-4xl" role="main" aria-label="Lawyer onboarding form">
          <Outlet />
        </main>
      </div>
    </div>

  );
}
