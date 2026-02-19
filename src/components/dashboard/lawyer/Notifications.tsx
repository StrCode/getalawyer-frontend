import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
}

export function Notifications({ notifications }: NotificationsProps) {
  return (
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
            <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8 shrink-0">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-3 leading-relaxed">{notification.message}</p>
              <p className="mt-1 text-gray-500 text-xs">{notification.time}</p>
            </div>
            {!notification.read && (
              <div className="bg-green-500 mt-2 rounded-full w-2 h-2 shrink-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
