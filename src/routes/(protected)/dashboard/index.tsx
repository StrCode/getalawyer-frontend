import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LawyerDashboard } from "@/components/dashboard/LawyerDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { authClient } from "@/lib/auth-client";
import { generateProtectedPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.dashboard.title,
    description: PAGE_SEO_CONFIG.dashboard.description,
    path: '/dashboard',
  });

  // Redirect admins to admin panel
  useEffect(() => {
    if (session?.user.role && ['reviewer', 'admin', 'super_admin'].includes(session.user.role)) {
      navigate({ to: "/admin", replace: true });
    }
  }, [session?.user.role, navigate]);

  if (isPending) {
    return <div>Loading session...</div>;
  }

  // Safety guard: If no session exists, return null
  if (!session?.user) return null;

  // Determine which dashboard to show based on user role
  const isLawyer = session.user.role === 'lawyer';

  // Render appropriate dashboard based on user role
  return (
    <>
      <SEOHead metadata={seoMetadata} />
      {isLawyer ? <LawyerDashboard /> : <ClientDashboard />}
    </>
  );
}
