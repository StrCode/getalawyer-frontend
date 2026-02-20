import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLawyerBookings } from "@/lib/hooks/useBookings";
import type { Booking } from "@/types/booking";

export function UpcomingBookingsWidget() {
  const { data: bookings, isLoading } = useLawyerBookings();

  // Filter and sort upcoming confirmed bookings
  const upcomingBookings = bookings
    ?.filter((booking) => {
      const isConfirmed = booking.status === 'confirmed';
      const isFuture = new Date(booking.startTime) > new Date();
      return isConfirmed && isFuture;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg w-full h-20 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Upcoming Bookings</CardTitle>
        <Button variant="link" size="sm" asChild>
          <Link to="/lawyer/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingBookings.length === 0 ? (
          <div className="py-8 text-gray-500 text-center">
            <Calendar className="mx-auto mb-2 w-12 h-12 text-gray-400" />
            <p>No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingItem({ booking }: { booking: Booking }) {
  const startTime = parseISO(booking.startTime);
  const endTime = parseISO(booking.endTime);

  return (
    <Link
      to="/lawyer/bookings/$id"
      params={{ id: booking.id }}
      className="block hover:bg-gray-50 p-3 border rounded-lg transition-colors"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="shrink-0 w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm truncate">
              {booking.client?.name || 'Unknown Client'}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-gray-600 text-sm">
            <Calendar className="shrink-0 w-4 h-4" />
            <span>{format(startTime, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="shrink-0 w-4 h-4" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="max-w-[120px] font-medium text-sm truncate">
            {booking.consultationType?.name || 'Consultation'}
          </div>
          <div className="text-gray-500 text-xs">
            {booking.consultationType?.duration || 0} min
          </div>
        </div>
      </div>
    </Link>
  );
}
