import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { LawyerDashboard } from "@/components/dashboard/LawyerDashboard";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, error, isPending } = authClient.useSession();

  // Redirect admins to admin panel
  useEffect(() => {
    if (session?.user?.role && ['reviewer', 'admin', 'super_admin'].includes(session.user.role)) {
      navigate({ to: "/admin", replace: true });
    }
  }, [session?.user?.role, navigate]);

  if (isPending) {
    return <div>Loading session...</div>;
  }

  // Safety guard: If no session exists, return null
  if (!session?.user) return null;

  // Render dashboard based on user role
  switch (session.user.role) {
    case 'lawyer':
      return <LawyerDashboard />;
    case 'client':
      return <ClientDashboard />;
    default:
      // Default to client dashboard for any other role
      return <ClientDashboard />;
  }
}
