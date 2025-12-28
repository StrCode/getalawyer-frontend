import { createFileRoute } from "@tanstack/react-router";
import { ApplicationManagement } from "@/components/admin";

export const Route = createFileRoute("/(protected)/admin/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return <ApplicationManagement />;
}