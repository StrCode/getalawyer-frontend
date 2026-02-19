import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppSidebar } from '@/components/dashboard/app-sidebar'

import {
  SidebarProvider,
} from '@/components/ui/sidebar'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout
})

function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex bg-[#F1F3F5] h-screen">
        <AppSidebar collapsible="icon" className="border-r-0" />
        
        <div className="flex flex-col bg-white my-2 mr-2 border border-gray-200 rounded-2xl w-full">
          <div className="px-8 py-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
