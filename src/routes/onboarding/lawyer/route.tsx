import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";
import { clearEnhancedOnboardingStore, useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer")({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    // Redirect to current incomplete step when accessing base onboarding route
    const store = useEnhancedOnboardingStore.getState();
    const currentPath = location.pathname;
    
    // Only redirect if we're on the exact base route
    if (currentPath === '/onboarding/lawyer' || currentPath === '/onboarding/lawyer/') {
      const targetRoute = getCurrentStepRoute(store);
      
      if (targetRoute !== currentPath) {
        throw redirect({
          to: targetRoute,
        });
      }
    }
  },
});

/**
 * Determine which route the user should be on based on their progress
 */
function getCurrentStepRoute(store: ReturnType<typeof useEnhancedOnboardingStore.getState>): string {
  // If application is submitted, go to pending page
  if (store.applicationStatus === 'submitted' || store.currentStep === 'pending_approval') {
    return '/onboarding/lawyer/pending';
  }
  
  // If credentials step is completed, go to pending
  if (store.completedSteps.includes('credentials')) {
    return '/onboarding/lawyer/pending';
  }
  
  // If basic_info is completed, go to credentials
  if (store.completedSteps.includes('basic_info')) {
    return '/onboarding/lawyer/credentials';
  }
  
  // Default: start at basics
  return '/onboarding/lawyer/basics';
}

function RouteComponent() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession();

  // Custom signOut function that also clears onboarding data
  const handleSignOut = () => {
    // Clear all onboarding-related cache before signing out
    clearEnhancedOnboardingStore();
    localStorage.removeItem('onboarding-form-draft');
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('offline-operation-queue');
    
    // Then sign out
    signOut({}, { onSuccess: () => navigate({ to: "/" }) });
  };

  return (
    <div className="flex flex-col bg-stone-50/10 min-h-screen">
      <header className="flex justify-between items-center px-4 md:px-11 py-3 md:py-8" role="banner">
        <div className="flex justify-center md:justify-start gap-2">
          <Link to="/" className="flex items-center gap-2 font-medium" aria-label="Go to homepage">
            <Logo className="h-8" />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-gray-600 text-sm">
          <Button
            variant="link"
            onClick={handleSignOut}
            className="pr-0 text-black text-sm"
            aria-label="Sign out of your account"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" aria-hidden="true" />
            Sign out
          </Button>
          <span className="hidden md:inline text-neutral-500" aria-label={`Signed in as ${session?.user.email}`}>
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
