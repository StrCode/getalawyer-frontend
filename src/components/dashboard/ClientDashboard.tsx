import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual API calls
const recommendedLawyers = [
  {
    id: '1',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
  {
    id: '2',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
  {
    id: '3',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
];

const activeCases = [
  {
    id: '1',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
  {
    id: '2',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
  {
    id: '3',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
];

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

export function ClientDashboard() {
  const [currentMonth] = useState('January 2024');
  const [selectedDate, setSelectedDate] = useState(2);

  const daysOfWeek = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
  const dates = [31, 1, 2, 3, 4];

  return (
    <div className="bg-background p-6 min-h-screen">
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recommended Lawyers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Lawyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recommendedLawyers.map((lawyer) => (
                  <div key={lawyer.id} className="space-y-3">
                    <div className="bg-muted rounded-lg w-full h-48" />
                    <div>
                      <h3 className="font-semibold">{lawyer.name}</h3>
                      <p className="text-muted-foreground text-sm">{lawyer.title}</p>
                      <p className="mt-2 text-muted-foreground text-xs">{lawyer.description}</p>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        View profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Cases and Notifications */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {/* Active Cases */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Active Cases</CardTitle>
                <Button variant="link" className="p-0 h-auto text-sm">
                  See All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCases.map((case_) => (
                  <div key={case_.id} className="space-y-2 pb-4 last:border-0 border-b">
                    <div className="flex items-start gap-2">
                      <span className="text-destructive text-xs">↑ {case_.priority}</span>
                    </div>
                    <h4 className="font-medium">{case_.title}</h4>
                    <p className="text-muted-foreground text-sm">{case_.date}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6" />
                        <span className="text-sm">{case_.client}</span>
                      </div>
                      <Badge variant="secondary">{case_.category}</Badge>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{case_.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
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
          </div>
        </div>

        {/* Right Column - Schedule & Meetings */}
        <div className="space-y-6">
          {/* Schedule Calendar */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <CardTitle className="text-lg">Schedule</CardTitle>
              </div>
              <Button variant="link" className="p-0 h-auto text-sm">
                See All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Month Navigation */}
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-sm">{currentMonth}</span>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Days of Week */}
              <div className="gap-2 grid grid-cols-5">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="mb-2 text-muted-foreground text-xs">{day}</div>
                    <Button
                      variant={dates[index] === selectedDate ? 'default' : 'outline'}
                      className="rounded-lg w-full h-12"
                      onClick={() => setSelectedDate(dates[index])}
                    >
                      {dates[index]}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {/* Meetings */}
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
        </div>
      </div>
    </div>
  );
}
