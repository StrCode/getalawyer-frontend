import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function PropertyDashboard() {
  const { data: session } = authClient.useSession();

  if (!session?.user) return null;

  // Mock data - replace with actual API calls
  const stats = {
    totalRevenue: 480000000,
    revenueChange: 12.5,
    totalBookings: 156,
    bookingsChange: 4.5,
    avgNightlyRate: 4000000,
    rateChange: -2.1,
    occupancyRate: 1,
    occupancyChange: 2.1,
  };

  const financialSnapshot = {
    totalEarnings: 48000000,
    pendingPayouts: 8000000,
    netIncome: 18000000,
    serviceFees: 100000,
  };

  // Revenue data for the chart (6 months)
  const revenueData = [
    { month: "Apr", value: 50 },
    { month: "May", value: 55 },
    { month: "Jun", value: 52 },
    { month: "Jul", value: 60 },
    { month: "Aug", value: 65 },
    { month: "Sep", value: 70 },
    { month: "Oct", value: 80 },
    { month: "Nov", value: 95 },
  ];

  // Generate smooth curve path using quadratic bezier curves
  const generateSmoothPath = (data: typeof revenueData) => {
    if (data.length === 0) return "";
    
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - d.value
    }));

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  const generateAreaPath = (data: typeof revenueData) => {
    const linePath = generateSmoothPath(data);
    return `${linePath} L 100,100 L 0,100 Z`;
  };

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}${amount >= 1000000 ? "M" : "K"}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value}%`;
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="space-y-6 mx-auto max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="mb-1 font-semibold text-gray-900 text-2xl">Overview</h1>
          <p className="text-gray-600 text-sm">Welcome back! Here's what's happening with your properties</p>
        </div>

        {/* Stats Grid */}
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-2xl">
                    ₦{(stats.totalRevenue / 1000000).toFixed(3)}
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPercentage(stats.revenueChange)} vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bookings */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-2xl">{stats.totalBookings}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPercentage(stats.bookingsChange)} vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Nightly Rate */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Avg Nightly Rate</p>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-2xl">{formatCurrency(stats.avgNightlyRate)}</p>
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <TrendingDown className="w-3 h-3" />
                    <span>{formatPercentage(stats.rateChange)} vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Occupancy Rate</p>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-2xl">{stats.occupancyRate}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPercentage(stats.occupancyChange)} vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Snapshot */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="font-semibold text-gray-900 text-lg">
              Financial Snapshot (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="font-bold text-gray-900 text-2xl">{formatCurrency(financialSnapshot.totalEarnings)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Pending Payouts</p>
                <p className="font-bold text-gray-900 text-2xl">{formatCurrency(financialSnapshot.pendingPayouts)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Net Income</p>
                <p className="font-bold text-gray-900 text-2xl">{formatCurrency(financialSnapshot.netIncome)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Service Fees</p>
                <p className="font-bold text-gray-900 text-2xl">{formatCurrency(financialSnapshot.serviceFees)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="font-semibold text-gray-900 text-lg">Revenue Trends</CardTitle>
            <p className="text-gray-600 text-sm">6-month performance overview</p>
          </CardHeader>
          <CardContent>
            <div className="relative pt-4 w-full h-80">
              {/* Y-axis labels */}
              <div className="left-0 absolute inset-y-0 flex flex-col justify-between py-4 text-gray-500 text-xs">
                <span>100k</span>
                <span>50k</span>
                <span>20k</span>
                <span>10k</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="relative ml-12 w-full h-full">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={`grid-${i}`} className="border-gray-200 border-t w-full" />
                  ))}
                </div>

                {/* SVG Chart */}
                <svg className="z-10 relative w-full h-full" preserveAspectRatio="none">
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <title>Revenue trends over 6 months</title>
                  
                  {/* Generate smooth curved path for area */}
                  <path
                    d={generateAreaPath(revenueData)}
                    fill="url(#areaGradient)"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Smooth curved line */}
                  <path
                    d={generateSmoothPath(revenueData)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="-bottom-6 left-0 absolute flex justify-between w-full text-gray-500 text-xs">
                  {revenueData.map((d) => (
                    <span key={d.month}>{d.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
