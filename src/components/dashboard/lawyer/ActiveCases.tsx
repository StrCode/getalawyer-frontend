import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Case {
  id: number;
  priority: string;
  title: string;
  status: string;
  date: string;
  client: { name: string; avatar: string };
  category: string;
}

interface ActiveCasesProps {
  cases: Case[];
}

export function ActiveCases({ cases }: ActiveCasesProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row justify-between items-center pb-3">
        <CardTitle className="font-semibold text-lg">Active Cases</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600">
          See All <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.map((case_) => (
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
  );
}
