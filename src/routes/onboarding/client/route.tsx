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
    
    // Then sign out
    signOut({}, { onSuccess: () => navigate({ to: "/" }) });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className='h-8' />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="link"
            onClick={handleSignOut}
            className="text-sm text-black pr-0" // Adjusted padding slightly
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
            Sign out
          </Button>
          <span className="text-neutral-500 hidden md:inline">
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
