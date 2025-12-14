import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from "motion/react"
import { AccountSidebarNav } from '@/components/settings/settings-nav'

export const Route = createFileRoute('/(protected)/dashboard/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex items-center justify-center space-y-6 rounded-md md:block">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0">
        <aside className="lg:w-1/4 lg:flex-shrink-0 px-6 py-4">
          <AccountSidebarNav />
        </aside>
        <div className="flex-1 rounded-l-lg lg:max-w-2xl min-w-0 px-4 py-6 lg:px-4 lg:py-3">
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div >
  )
}
