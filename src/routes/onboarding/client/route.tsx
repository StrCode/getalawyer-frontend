import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'

export const Route = createFileRoute('/onboarding/client')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session, error, isPending } = authClient.useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <img src="/logo.png" alt="GetaLawyer Logo" className="h-6" />
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="link"
            //onClick={handleSignOut}
            className="text-sm text-black pr-0" // Adjusted padding slightly
          >
            <LogOutIcon className="w-4 h-4" />
            Sign out
          </Button>
          <span className="text-neutral-500 hidden md:inline">
            ({session?.user.email})
          </span>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA (This is where the child route component renders) */}
      <main className="flex justify-around px-20">
        <Outlet />
      </main>
    </div>
  )
}
