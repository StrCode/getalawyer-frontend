import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ScheduleCalendar() {
  const [currentMonth] = useState('January 2024');
  const [selectedDate, setSelectedDate] = useState(2);

  const daysOfWeek = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
  const dates = [31, 1, 2, 3, 4];

  return (
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
  );
}
