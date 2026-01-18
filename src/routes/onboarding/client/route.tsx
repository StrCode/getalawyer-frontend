import { Logout01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate
} from '@tanstack/react-router'
import { Logo } from '@/components/logo';
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";
import { clearEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";


export const Route = createFileRoute('/onboarding/client')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession();

  // Custom signOut function that also clears onboarding data
  const handleSignOut = () => {
    // Clear onboarding store data before signing out
    clearEnhancedOnboardingStore();
    localStorage.removeItem('onboarding-form-draft');
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('offline-operation-queue');
    
    // Then sign out
    signOut({}, { onSuccess: () => navigate({ to: "/" }) });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-4 md:px-11 py-3 md:py-8">
        <div className="flex justify-center md:justify-start gap-2">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className='h-8' />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-gray-600 text-sm">
          <Button
            variant="link"
            onClick={handleSignOut}
            className="pr-0 text-black text-sm" // Adjusted padding slightly
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
            Sign out
          </Button>
          <span className="hidden md:inline text-neutral-500">
            ({session?.user.email})
          </span>
        </div>
      </header>

      <main className="md:min-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
