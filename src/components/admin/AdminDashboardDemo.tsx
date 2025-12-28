import { useAdminDashboard } from '@/hooks/use-admin-queries';

/**
 * Demo component showing TanStack Query integration for admin API calls
 * This demonstrates the enhanced admin dashboard foundation with:
 * - Better Auth role-based access control
 * - TanStack Query configuration for admin operations
 * - Proper error handling and loading states
 */
export function AdminDashboardDemo() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`skeleton-card-${i + 1}`} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalApplications}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Applications</h3>
            <p className="text-3xl font-bold text-yellow-600">{metrics.pendingApplications}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Approved Applications</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.approvedApplications}</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {metrics.recentActivity.slice(0, 5).map((activity: { description?: string; createdAt?: string; id?: string }, index: number) => (
              <div key={activity.id || `activity-${Date.now()}-${index}`} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  {activity.description || `Activity ${index + 1}`}
                </span>
                <span className="text-gray-400 text-xs">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>✅ Enhanced admin route structure with improved layout</p>
        <p>✅ Better Auth integration for role-based access control</p>
        <p>✅ TanStack Query configuration for admin API calls</p>
        <p>✅ Auto-refresh every 5 minutes</p>
        <p>✅ Proper error handling and loading states</p>
      </div>
    </div>
  );
}