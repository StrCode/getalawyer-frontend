import { createFileRoute } from "@tanstack/react-router";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { LawyerDashboard } from "@/components/dashboard/LawyerDashboard";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { authClient } from "@/lib/auth-client";
import { generateProtectedPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();

  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.dashboard.title,
    description: PAGE_SEO_CONFIG.dashboard.description,
    path: '/dashboard',
  });

  if (isPending) {
    return (
      <>
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-2xl">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((id) => (
            <Card key={id}>
              <CardContent className="p-4">
                <Skeleton className="mb-3 rounded-lg w-10 h-10" />
                <Skeleton className="mb-2 w-24 h-4" />
                <Skeleton className="w-16 h-8" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="lg:col-span-1">
              <CardHeader>
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="w-40 h-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((id) => (
                <Skeleton key={id} className="w-full h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Safety guard: If no session exists, return null
  if (!session?.user) return null;

  // Determine which dashboard to show based on user role
  const isLawyer = session.user.role === 'lawyer';

  // Render appropriate dashboard based on user role
  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {isLawyer ? <LawyerDashboard /> : <ClientDashboard />}
    </>
  );
}
