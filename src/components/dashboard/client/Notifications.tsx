import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const notifications = [
  {
    id: '1',
    message: "Congratulations! You have just created a new savings account. It's time to start setting aside money and achieve your financial goals!",
    time: 'Today - 2:18 PM',
    unread: true,
  },
  {
    id: '2',
    message: "Congratulations! You have just created a new savings account. It's time to start setting aside money and achieve your financial goals!",
    time: 'Today - 2:18 PM',
    unread: true,
  },
  {
    id: '3',
    message: "Congratulations! You have just created a new savings account. It's time to start setting aside money and achieve your financial goals!",
    time: 'Today - 2:18 PM',
    unread: false,
  },
];

export function Notifications() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </div>
        <Button variant="link" className="p-0 h-auto text-sm">
          See All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex gap-3 pb-4 last:border-0 border-b">
            <div className="mt-1 shrink-0">
              <span className="text-lg">🔔</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">{notification.message}</p>
              <p className="mt-1 text-muted-foreground text-xs">{notification.time}</p>
            </div>
            {notification.unread && (
              <div className="shrink-0">
                <div className="bg-primary rounded-full w-2 h-2" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
