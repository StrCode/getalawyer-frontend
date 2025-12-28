import { format, subDays, subMonths, subWeeks } from 'date-fns';
import { AlertCircle, Calendar, Download, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStatistics } from '@/hooks/use-admin-queries';
import { DataExport } from './DataExport';
import { MetricsCard } from './MetricsCard';

export interface StatisticsPageProps {
  className?: string;
}

interface DateRangeOption {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

interface GroupByOption {
  label: string;
  value: 'day' | 'week' | 'month';
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    label: 'Last 7 days',
    value: '7d',
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  },
  {
    label: 'Last 30 days',
    value: '30d',
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  },
  {
    label: 'Last 3 months',
    value: '3m',
    startDate: subMonths(new Date(), 3),
    endDate: new Date(),
  },
  {
    label: 'Last 6 months',
    value: '6m',
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  },
  {
    label: 'Last year',
    value: '1y',
    startDate: subMonths(new Date(), 12),
    endDate: new Date(),
  },
];

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
];

const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.danger];

export function StatisticsPage({ className }: StatisticsPageProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30d');
  const [selectedGroupBy, setSelectedGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const currentDateRange = DATE_RANGE_OPTIONS.find(option => option.value === selectedDateRange);
  
  const { 
    data: statisticsData, 
    isLoading, 
    error,
    isRefetching,
    refetch 
  } = useAdminStatistics({
    startDate: currentDateRange?.startDate.toISOString(),
    endDate: currentDateRange?.endDate.toISOString(),
    groupBy: selectedGroupBy,
    metrics: 'all',
  });

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
  };

  const handleGroupByChange = (value: 'day' | 'week' | 'month') => {
    setSelectedGroupBy(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
            <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load statistics data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = statisticsData?.data;
  const platformStats = stats?.platformStatistics;
  const userTrends = stats?.userRegistrationTrends || [];
  const applicationPatterns = stats?.applicationSubmissionPatterns || [];
  const approvalRates = stats?.approvalRejectionRates;
  const activityMetrics = stats?.activityMetrics;

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isRefetching && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </div>
          )}
          
          <DataExport 
            defaultType="statistics"
            dateRange={currentDateRange ? {
              startDate: currentDateRange.startDate.toISOString(),
              endDate: currentDateRange.endDate.toISOString(),
            } : undefined}
            filters={{ groupBy: selectedGroupBy }}
          />
          
          <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
          <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Group by:</span>
          <Select value={selectedGroupBy} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUP_BY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
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
              value={platformStats?.totalUsers || 0}
              icon="Users"
              color="blue"
            />
            <MetricsCard
              title="Active Users"
              value={platformStats?.activeUsers || 0}
              icon="Users"
              color="green"
            />
            <MetricsCard
              title="Total Applications"
              value={platformStats?.totalApplications || 0}
              icon="FileText"
              color="purple"
            />
            <MetricsCard
              title="Approval Rate"
              value={Math.round((approvalRates?.approvalRate || 0) * 100)}
              icon="CheckCircle"
              color="green"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trends</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={CHART_COLORS.primary} 
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Application Submission Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Application Submissions</CardTitle>
            <CardDescription>
              Lawyer application submissions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={CHART_COLORS.secondary} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: approvalRates?.approved || 0 },
                      { name: 'Rejected', value: approvalRates?.rejected || 0 },
                      { name: 'Pending', value: approvalRates?.pending || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {PIE_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>
              Daily platform activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityMetrics?.dailyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Bar dataKey="logins" fill={CHART_COLORS.primary} name="Logins" />
                  <Bar dataKey="registrations" fill={CHART_COLORS.secondary} name="Registrations" />
                  <Bar dataKey="applications" fill={CHART_COLORS.accent} name="Applications" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-sm font-medium">
                    {((activityMetrics?.userGrowthRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Users</span>
                  <span className="text-sm font-medium">
                    {activityMetrics?.newUsersCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention Rate</span>
                  <span className="text-sm font-medium">
                    {((activityMetrics?.retentionRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Review Time</span>
                  <span className="text-sm font-medium">
                    {approvalRates?.averageReviewTime || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium">
                    {((approvalRates?.approvalRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Processed</span>
                  <span className="text-sm font-medium">
                    {(approvalRates?.approved || 0) + (approvalRates?.rejected || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-sm font-medium">
                    {activityMetrics?.activeSessions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">0.1%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}