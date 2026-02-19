import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceHighlights() {
  return (
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
  );
}
