import { useNavigate } from "@tanstack/react-router";
import { 
  AlertCircle, 
  ArrowRight,
  Bell,
  Briefcase, 
  Clock,
  DollarSign, 
  Eye, 
  MoreVertical,
  Settings, 
  Shield,
  TrendingUp
} from "lucide-react";
import { SubscriptionBanner } from "@/components/dashboard/subscription-banner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import { clearEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export function LawyerDashboard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    clearEnhancedOnboardingStore();
    localStorage.removeItem('onboarding-form-draft');
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('offline-operation-queue');
    
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login" }),
      },
    });
  };

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
    <div className="bg-gray-50 p-6 min-h-screen">
      <SubscriptionBanner />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-4 font-bold text-3xl">Welcome back, {session.user.name || "Bello"}</h1>
        
        {/* Profile Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-1 items-center gap-4">
                <span className="font-medium">Profile Management</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                  In Progress
                </Badge>
                <Progress value={stats.profileProgress} className="w-48" />
                <span className="text-gray-600 text-sm">{stats.profileProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Pending inquiries</span>
              <AlertCircle className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-2xl">{stats.pendingInquiries}</span>
              <Button variant="link" size="sm" className="text-blue-600">view all</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Active cases</span>
              <Briefcase className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-2xl">{stats.activeCases}</span>
              <Button variant="link" size="sm" className="text-green-600">manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">This month's earnings</span>
              <DollarSign className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl">${stats.monthlyEarnings.toLocaleString()}</span>
              <span className="flex items-center text-green-600 text-sm">
                <TrendingUp className="mr-1 w-3 h-3" />
                +{stats.earningsChange}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Profile views</span>
              <Eye className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-2xl">{stats.profileViews}</span>
              <Button variant="link" size="sm" className="text-blue-600">view all</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Profile strength score</span>
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-bold text-2xl">{stats.profileStrength}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Active Cases */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Active Cases</CardTitle>
            <Button variant="link" size="sm">See All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCases.map((case_) => (
              <div key={case_.id} className="pb-4 last:border-0 border-b">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="destructive" className="text-xs">{case_.priority}</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">{case_.status}</Badge>
                </div>
                <p className="mb-1 font-medium">{case_.title}</p>
                <p className="mb-2 text-gray-500 text-sm">{case_.date}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{case_.client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{case_.client.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">{case_.category}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Earning Overview */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <CardTitle>Earning Overview</CardTitle>
            </div>
            <Button variant="link" size="sm">View Earning</Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-center items-center py-8">
              <div className="relative mb-6 w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-gray-500 text-xs">THIS MONTH</span>
                  <span className="font-bold text-2xl">$1,800.00</span>
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <div className="flex justify-between items-center bg-pink-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center bg-pink-200 rounded w-8 h-8">💝</div>
                    <div>
                      <p className="font-medium text-sm">Donation to TEMA</p>
                      <p className="text-gray-500 text-xs">In the name of our family.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">$100.00</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center bg-red-200 rounded w-8 h-8">🔥</div>
                    <div>
                      <p className="font-medium text-sm">Gas Bill Payment</p>
                      <p className="text-gray-500 text-xs">Monthly gas bill payment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">$20.00</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <Button variant="link" size="sm">See All</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 pb-3 last:border-0 border-b">
                  <div className="flex flex-shrink-0 justify-center items-center bg-gray-100 rounded-full w-8 h-8">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-sm">{notification.message}</p>
                    <p className="text-gray-500 text-xs">{notification.time}</p>
                  </div>
                  {!notification.read && <div className="flex-shrink-0 bg-green-500 mt-2 rounded-full w-2 h-2" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="gap-3 grid grid-cols-2">
              <Button variant="outline" className="py-3 h-auto">View Inquiries</Button>
              <Button variant="outline" className="py-3 h-auto">Manage Cases</Button>
              <Button variant="outline" className="py-3 h-auto">View Earnings</Button>
              <Button variant="outline" className="py-3 h-auto">Message Clients</Button>
              <Button variant="outline" className="col-span-2 py-3 h-auto">Edit Profile</Button>
            </CardContent>
          </Card>

          {/* Performance Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-500 text-sm">PERFORMANCE HIGHLIGHTS:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Profile views this week: 10</p>
                <p className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  +8.92%
                </p>
              </div>
              <div>
                <p className="font-medium">Your response time: 2 hours</p>
                <p className="text-green-600 text-sm">• fast</p>
              </div>
              <div>
                <p className="font-medium">Client satisfaction: 4.8/5</p>
                <p className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  +8.92%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inquiry Management Widget */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Inquiry Management Widget</CardTitle>
          <Button variant="link" size="sm">See All</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 font-medium text-gray-600 text-left">Client Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-left">Issue/Date Created</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-left">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 border-b">
                    <td className="px-4 py-4">{inquiry.clientName}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{inquiry.issue}</p>
                        <p className="text-gray-500 text-sm">{inquiry.dateRange}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {inquiry.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
