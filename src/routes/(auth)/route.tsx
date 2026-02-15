import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async () => {
    // Check if user is already authenticated
    const session = await getUser();
    
    if (session?.user) {
      // If authenticated, redirect to dashboard
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className="flex flex-col gap-6 bg-background p-2 md:p-2 min-h-svh">
        <div className="flex justify-between items-center px-4 md:px-11 py-3 md:py-8">
          <div className="flex justify-center md:justify-start gap-2">
            <Link to="/" className="flex items-center gap-2 font-medium">
              <Logo className="mr-auto h-5" />
            </Link>
          </div>
          <div className="space-x-2 text-gray-600 text-sm">
            Changed your mind?
            <Button
              variant="link"
              className="text-green-600 text-sm"
            >
              <Link to="/">
                Login
              </Link>
            </Button>
          </div>
        </div>
        <div className="">
          <Outlet />
          {/* <SignupForm /> */}
        </div>
      </div>
    </div>

  )
}

