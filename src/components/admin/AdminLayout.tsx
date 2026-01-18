import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { signOut, useSession } from '@/lib/auth-client';
import { clearEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user has admin privileges
  const hasAdminAccess = session?.user?.role && 
    ['reviewer', 'admin', 'super_admin'].includes(session.user.role);

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="space-y-2 text-center">
          <h2 className="font-semibold text-xl">Loading...</h2>
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!hasAdminAccess) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="space-y-4 text-center">
          <h2 className="font-semibold text-xl">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const userRole = session.user.role as 'reviewer' | 'admin' | 'super_admin';

  const handleLogout = async () => {
    try {
      // Clear all onboarding-related cache before signing out
      clearEnhancedOnboardingStore();
      localStorage.removeItem('onboarding-form-draft');
      localStorage.removeItem('onboarding-progress');
      localStorage.removeItem('offline-operation-queue');
      
      await signOut();
      navigate({ to: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback to redirect
      window.location.href = '/';
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex bg-background w-full min-h-screen">
        <AdminSidebar 
          currentPath={location.pathname} 
          userRole={userRole}
        />
        
        <SidebarInset className="flex flex-col">
          <AdminHeader 
            user={session.user}
            onLogout={handleLogout}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}