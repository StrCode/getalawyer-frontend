import { createFileRoute } from "@tanstack/react-router";
import { StatisticsPage } from "@/components/admin/StatisticsPage";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateProtectedPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(protected)/admin/statistics")({
  component: AdminStatistics,
});

function AdminStatistics() {
  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.adminStatistics.title,
    description: PAGE_SEO_CONFIG.adminStatistics.description,
    path: '/admin/statistics',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <StatisticsPage />
    </>
  );
}
