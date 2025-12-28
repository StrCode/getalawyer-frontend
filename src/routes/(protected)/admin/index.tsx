import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/components/admin";

export const Route = createFileRoute("/(protected)/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return <DashboardOverview />;
}