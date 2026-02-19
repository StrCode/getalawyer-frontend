import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LawyerDashboard } from "@/components/dashboard/LawyerDashboard";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(protected)/dashboard/lawyer")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  // Redirect if not a lawyer
  if (session?.user && session.user.role !== 'lawyer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl">Lawyer Dashboard</h1>
        <p className="text-gray-600">Manage your consultations and bookings.</p>
      </div>

      <LawyerDashboard />
    </>
  );
}
