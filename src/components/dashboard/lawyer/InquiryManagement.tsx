import { ChevronRight, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Inquiry {
  id: number;
  clientName: string;
  issue: string;
  dateRange: string;
  status: string;
}

interface InquiryManagementProps {
  inquiries: Inquiry[];
}

export function InquiryManagement({ inquiries }: InquiryManagementProps) {
  return (
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
  );
}
