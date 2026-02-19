import { Link } from "@tanstack/react-router";
import { SubscriptionBanner } from "@/components/dashboard/subscription-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import { ActiveCases } from "./lawyer/ActiveCases";
import { EarningOverview } from "./lawyer/EarningOverview";
import { InquiryManagement } from "./lawyer/InquiryManagement";
import { Notifications } from "./lawyer/Notifications";
import { PendingRequestsWidget } from "./lawyer/PendingRequestsWidget";
import { PerformanceHighlights } from "./lawyer/PerformanceHighlights";
import { QuickActions } from "./lawyer/QuickActions";
import { StatsCards } from "./lawyer/StatsCards";
import { UpcomingBookingsWidget } from "./lawyer/UpcomingBookingsWidget";

export function LawyerDashboard() {
  const { data: session } = authClient.useSession();

  if (!session?.user) return null;

  // Mock data - replace with actual API calls
  const stats = {
    pendingInquiries: 5,
    activeCases: 5,
    monthlyEarnings: 88723.00,
    earningsChange: 8.92,
    profileViews: 5,
    profileStrength: 100,
    profileProgress: 30
  };

  const activeCases = [
    {
      id: 1,
      priority: "HIGH PRIORITY",
      title: "To go over documents",
      status: "Confirmed",
      date: "Apr 17",
      client: { name: "Amélie Laurent", avatar: "" },
      category: "Estate Planning"
    },
    {
      id: 2,
      priority: "HIGH PRIORITY",
      title: "To go over documents",
      status: "Confirmed",
      date: "Apr 17",
      client: { name: "Amélie Laurent", avatar: "" },
      category: "Estate Planning"
    }
  ];

  const inquiries = [
    {
      id: 1,
      clientName: "Nuray Aksoy",
      issue: "Litigation",
      dateRange: "Aug 21 - Sep 04",
      status: "In Progress"
    },
    {
      id: 2,
      clientName: "Nuray Aksoy",
      issue: "Litigation",
      dateRange: "Aug 21 - Sep 04",
      status: "In Progress"
    },
    {
      id: 3,
      clientName: "Nuray Aksoy",
      issue: "Litigation",
      dateRange: "Aug 21 - Sep 04",
      status: "In Progress"
    },
    {
      id: 4,
      clientName: "Nuray Aksoy",
      issue: "Litigation",
      dateRange: "Aug 21 - Sep 04",
      status: "In Progress"
    }
  ];

  const notifications = [
    {
      id: 1,
      message: "Congratulations! You have just created a new savings account. It's time to start setting aside money and achieve your financial goals!",
      time: "Today - 2:18 PM",
      read: false
    },
    {
      id: 2,
      message: "Congratulations! You have just created a new savings account. It's time to start setting aside money and achieve your financial goals!",
      time: "Today - 2:18 PM",
      read: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Subscription Banner - Only shows if not subscribed (handled internally) */}
      <SubscriptionBanner showOnlyIfNotSubscribed />

      {/* Profile Progress Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex md:flex-row flex-col md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-lg">Profile Management</span>
                <Badge variant="secondary" className="bg-orange-100 border-orange-200 text-orange-700">
                  In Progress
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={stats.profileProgress} className="flex-1 max-w-md h-2" />
                <span className="font-medium text-gray-600 text-sm">{stats.profileProgress}%</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <StatsCards stats={stats} />

      {/* Booking Widgets - New widgets for booking system */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <UpcomingBookingsWidget />
        <PendingRequestsWidget />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold text-lg">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/lawyer/consultation-types" 
              className="inline-flex justify-center items-center bg-primary hover:bg-primary/80 px-2.5 rounded-3xl h-9 font-medium text-primary-foreground text-sm transition-all"
            >
              Manage Consultation Types
            </Link>
            <Link 
              to="/lawyer/availability" 
              className="inline-flex justify-center items-center bg-background hover:bg-muted shadow-xs px-2.5 border border-border rounded-3xl h-9 font-medium hover:text-foreground text-sm transition-all"
            >
              Set Availability
            </Link>
            <Link 
              to="/lawyer/bookings" 
              className="inline-flex justify-center items-center bg-background hover:bg-muted shadow-xs px-2.5 border border-border rounded-3xl h-9 font-medium hover:text-foreground text-sm transition-all"
            >
              View All Bookings
            </Link>
            <Link 
              to="/lawyer/calendar" 
              className="inline-flex justify-center items-center bg-background hover:bg-muted shadow-xs px-2.5 border border-border rounded-3xl h-9 font-medium hover:text-foreground text-sm transition-all"
            >
              Calendar Integration
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Active Cases */}
        <ActiveCases cases={activeCases} />

        {/* Earning Overview */}
        <EarningOverview />

        {/* Right Column - Notifications & Performance */}
        <div className="space-y-6 lg:col-span-1">
          <Notifications notifications={notifications} />
          <QuickActions />
          <PerformanceHighlights />
        </div>
      </div>

      {/* Inquiry Management Widget */}
      <InquiryManagement inquiries={inquiries} />
    </div>
  );
}
