import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin";

export const Route = createFileRoute("/(protected)/admin")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    // Get session from parent route context
    const { session } = context;
    
    // Check if user has admin role
    const isAdmin = ['reviewer', 'admin', 'super_admin'].includes(session?.user?.role || '');
    
    if (!isAdmin) {
      throw redirect({ to: "/dashboard" });
    }

    return {
      user: session.user,
      isAdmin: true,
    };
  },
  component: AdminLayout,
});