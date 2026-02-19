import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EarningOverview() {
  return (
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
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100" aria-label="Earnings progress chart">
              <title>Monthly earnings progress</title>
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
  );
}
