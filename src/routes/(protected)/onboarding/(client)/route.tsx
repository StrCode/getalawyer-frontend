import { Logout01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate
} from '@tanstack/react-router'
import { useEffect } from 'react';
import { Logo } from '@/components/logo';
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";


export const Route = createFileRoute('/(protected)/onboarding/(client)')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession();

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (!isPending && session?.user?.onboarding_completed) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [session, isPending, navigate]);

  // Redirect lawyers to lawyer registration
  useEffect(() => {
    if (!isPending && session?.user?.role === "lawyer") {
      navigate({ to: "/register/step2", replace: true });
    }
  }, [session, isPending, navigate]);

  // Custom signOut function that also clears onboarding data
  const handleSignOut = () => {
    // Clear onboarding data from localStorage
    localStorage.removeItem('client-onboarding-data');
    
    // Then sign out
    signOut({}, { onSuccess: () => navigate({ to: "/" }) });
  };

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-full w-12 h-12">
            <svg
              className="w-5 h-5 text-primary animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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
