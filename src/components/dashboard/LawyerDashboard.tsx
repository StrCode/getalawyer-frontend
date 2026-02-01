import { 
  AlertCircle, 
  ArrowRight,
  Bell,
  Briefcase, 
  ChevronRight, 
  Clock,
  DollarSign, 
  Eye, 
  MoreVertical,
  Shield,
  TrendingUp
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";

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
    <div className="flex-1 overflow-auto">
      <div className="space-y-6 p-4 md:p-6">
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
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Pending inquiries</p>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-3xl">{stats.pendingInquiries}</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                    view all
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Active cases</p>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-3xl">{stats.activeCases}</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-green-600">
                    manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">This month's earnings</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-2xl">${stats.monthlyEarnings.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.earningsChange}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Profile views</p>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-3xl">{stats.profileViews}</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                    view all
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">Profile strength</p>
                <span className="font-bold text-3xl">{stats.profileStrength}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          {/* Active Cases */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <CardTitle className="font-semibold text-lg">Active Cases</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                See All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCases.map((case_) => (
                <div key={case_.id} className="hover:bg-gray-50 p-3 border rounded-lg transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="destructive" className="text-xs">{case_.priority}</Badge>
                    <Badge variant="secondary" className="bg-green-100 border-green-200 text-green-700">
                      {case_.status}
                    </Badge>
                  </div>
                  <p className="mb-2 font-medium">{case_.title}</p>
                  <p className="mb-3 text-gray-500 text-xs">{case_.date}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs">
                          {case_.client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{case_.client.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 border-orange-200 text-orange-700 text-xs">
                      {case_.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Earning Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <CardTitle className="font-semibold text-lg">Earning Overview</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Earning
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                {/* Circular Progress */}
                <div className="relative mb-6 w-40 h-40">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
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
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <span className="font-medium text-gray-500 text-xs">THIS MONTH</span>
                    <span className="font-bold text-2xl">$1,800.00</span>
                  </div>
                </div>
                
                {/* Transactions */}
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center bg-pink-50 hover:bg-pink-100 p-3 border border-pink-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-pink-200 rounded-lg w-10 h-10 text-xl">
                        💝
                      </div>
                      <div>
                        <p className="font-medium text-sm">Donation to TEMA</p>
                        <p className="text-gray-500 text-xs">In the name of our family</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">$100.00</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-red-50 hover:bg-red-100 p-3 border border-red-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-red-200 rounded-lg w-10 h-10 text-xl">
                        🔥
                      </div>
                      <div>
                        <p className="font-medium text-sm">Gas Bill Payment</p>
                        <p className="text-gray-500 text-xs">Monthly gas bill</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">$20.00</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Notifications & Performance */}
          <div className="space-y-6 lg:col-span-1">
            {/* Notifications */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <CardTitle className="font-semibold text-lg">Notifications</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  See All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <div className="flex flex-shrink-0 justify-center items-center bg-blue-100 rounded-full w-8 h-8">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-3 leading-relaxed">{notification.message}</p>
                      <p className="mt-1 text-gray-500 text-xs">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 bg-green-500 mt-2 rounded-full w-2 h-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-semibold text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="gap-2 grid grid-cols-2">
                <Button variant="outline" className="py-3 h-auto text-sm">
                  View Inquiries
                </Button>
                <Button variant="outline" className="py-3 h-auto text-sm">
                  Manage Cases
                </Button>
                <Button variant="outline" className="py-3 h-auto text-sm">
                  View Earnings
                </Button>
                <Button variant="outline" className="py-3 h-auto text-sm">
                  Message Clients
                </Button>
                <Button variant="outline" className="col-span-2 py-3 h-auto text-sm">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Performance Highlights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                  Performance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Profile views this week: 10</p>
                  <p className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +8.92% increase
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Your response time: 2 hours</p>
                  <p className="flex items-center gap-1 text-green-600 text-sm">
                    • fast
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Client satisfaction: 4.8/5</p>
                  <p className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +8.92% increase
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inquiry Management Widget */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="font-semibold text-lg">Inquiry Management</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              See All <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Client Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Issue/Date Created</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Status</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50 last:border-0 border-b transition-colors">
                      <td className="px-4 py-4 font-medium">{inquiry.clientName}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-sm">{inquiry.issue}</p>
                          <p className="text-gray-500 text-xs">{inquiry.dateRange}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="secondary" className="bg-orange-100 border-orange-200 text-orange-700">
                          {inquiry.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" size="sm" className="p-0 w-8 h-8">
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
    </div>
  );
}
