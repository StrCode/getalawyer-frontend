import { 
  AlertCircle, 
  Briefcase, 
  DollarSign, 
  Eye, 
  Shield,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    pendingInquiries: number;
    activeCases: number;
    monthlyEarnings: number;
    earningsChange: number;
    profileViews: number;
    profileStrength: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
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
  );
}
