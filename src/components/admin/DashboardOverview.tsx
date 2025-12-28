import { AlertCircle, RefreshCw } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboard } from '@/hooks/use-admin-queries';
import { ActivityFeed } from './ActivityFeed';
import { MetricsCard } from './MetricsCard';

export interface DashboardMetrics {
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardOverviewProps {
  metrics?: DashboardMetrics;
  recentActivity?: ActivityItem[];
  isLoading?: boolean;
}

export function DashboardOverview({ 
  metrics: propMetrics, 
  recentActivity: propActivity, 
  isLoading: propLoading 
}: DashboardOverviewProps) {
  const { 
    data: dashboardData, 
    isLoading: queryLoading, 
    error,
    isRefetching 
  } = useAdminDashboard();

  // Use props if provided, otherwise use query data
  const isLoading = propLoading ?? queryLoading;
  const metrics = propMetrics ?? dashboardData?.data;
  const recentActivity = propActivity ?? dashboardData?.data?.recentActivity;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Monitor platform activity and manage applications</p>
        </div>
        {isRefetching && (
          <div className="flex items-center text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Refreshing...
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <MetricsCard
              title="Total Users"
              value={metrics?.totalUsers || 0}
              icon="Users"
              color="blue"
            />
            <MetricsCard
              title="Total Applications"
              value={metrics?.totalApplications || 0}
              icon="FileText"
              color="green"
            />
            <MetricsCard
              title="Pending Applications"
              value={metrics?.pendingApplications || 0}
              icon="Clock"
              color="yellow"
            />
            <MetricsCard
              title="Approved Applications"
              value={metrics?.approvedApplications || 0}
              icon="CheckCircle"
              color="green"
            />
          </>
        )}
      </div>

      {/* Activity Feed */}
      <ActivityFeed 
        activities={recentActivity || []} 
        isLoading={isLoading}
      />
    </div>
  );
}