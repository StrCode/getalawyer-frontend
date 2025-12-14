import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import {
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from "@/components/dashboard/app-header"

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout
})

function DashboardLayout() {

  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col justify-start bg-container h-full w-full bg-background">
          <Header />
          <Outlet />
        </div>
      </div>
    </SidebarProvider >
  )
}
