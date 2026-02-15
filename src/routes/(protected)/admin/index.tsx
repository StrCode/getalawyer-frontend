import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/components/admin";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateProtectedPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(protected)/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.adminDashboard.title,
    description: PAGE_SEO_CONFIG.adminDashboard.description,
    path: '/admin',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <DashboardOverview />
    </>
  );
}