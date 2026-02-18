import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const meetings = [
  {
    id: '1',
    title: 'Meeting with James Brown',
    time: '8:00 - 8:45 AM (UTC)',
    platform: 'On Google Meet',
    category: 'Estate Planning',
    avatar: '/placeholder-avatar.jpg',
  },
  {
    id: '2',
    title: 'Meeting with Laura Perez',
    time: '9:00 - 8:45 AM (UTC)',
    platform: 'On Zoom',
    category: 'Litigation',
    avatar: '/placeholder-avatar.jpg',
  },
  {
    id: '3',
    title: 'Meeting with Arthur Taylor',
    time: '10:00 - 11:00 AM (UTC)',
    platform: 'On Slack',
    category: 'Family Law',
    avatar: '/placeholder-avatar.jpg',
  },
];

export function Meetings() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-lg">💼</span>
          <CardTitle className="text-lg">Meetings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="space-y-2 pb-4 last:border-0 border-b">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm">{meeting.title}</h4>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{meeting.time}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6" />
                <span className="text-muted-foreground text-xs">{meeting.platform}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {meeting.category}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
