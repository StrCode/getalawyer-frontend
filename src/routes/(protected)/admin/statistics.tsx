import { createFileRoute } from "@tanstack/react-router";
import { StatisticsPage } from "@/components/admin/StatisticsPage";

export const Route = createFileRoute("/(protected)/admin/statistics")({
  component: AdminStatistics,
});

function AdminStatistics() {
  return <StatisticsPage />;
}
