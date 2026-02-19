import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
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
  );
}
