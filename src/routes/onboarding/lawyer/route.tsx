import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { authClient, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/onboarding/lawyer")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession();
  return (
    <div className="min-h-screen bg-stone-50/10 flex flex-col">
      <header className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className="h-8" />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="link"
            onClick={() =>
              signOut({}, { onSuccess: () => navigate({ to: "/" }) })
            }
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

      <div className="flex justify-center">
        <main className="w-full max-w-4xl">
          <Outlet />
        </main>
      </div>
    </div>

  );
}
