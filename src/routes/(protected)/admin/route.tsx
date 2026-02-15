import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(protected)/admin")({
  ssr: false,
  beforeLoad: async () => {
    // Check if user is authenticated
    const session = await getUser();
    
    if (!session?.user) {
      throw redirect({ to: "/login" });
    } 
 
    // Check if user has admin role
    const isAdmin = ['reviewer', 'admin', 'super_admin'].includes(session.user.role || '');
    
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