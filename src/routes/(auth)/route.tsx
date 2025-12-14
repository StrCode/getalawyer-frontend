import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className="bg-background flex min-h-svh flex-col gap-6 p-2 md:p-2">
        <div className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link to="/" className="flex items-center gap-2 font-medium">
              <Logo className="mr-auto h-5" />
            </Link>
          </div>
          <div className="space-x-2 text-sm text-gray-600">
            Changed your mind?
            <Button
              variant="link"
              className="text-sm text-green-600"
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

