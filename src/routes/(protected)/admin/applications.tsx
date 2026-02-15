import { createFileRoute } from "@tanstack/react-router";
import { ApplicationManagement } from "@/components/admin";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateProtectedPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(protected)/admin/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.adminApplications.title,
    description: PAGE_SEO_CONFIG.adminApplications.description,
    path: '/admin/applications',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <ApplicationManagement />
    </>
  );
}