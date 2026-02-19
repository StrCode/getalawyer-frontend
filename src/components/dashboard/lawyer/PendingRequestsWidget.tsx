import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AlertCircle, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLawyerBookings } from "@/lib/hooks/useBookings";
import type { Booking } from "@/types/booking";

export function PendingRequestsWidget() {
  const { data: bookings, isLoading } = useLawyerBookings();

  // Filter pending bookings
  const pendingBookings = bookings?.filter((booking) => booking.status === 'pending') || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
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
        <div className="flex items-center gap-2">
          <CardTitle>Pending Requests</CardTitle>
          {pendingBookings.length > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {pendingBookings.length}
            </Badge>
          )}
        </div>
        <Button variant="link" size="sm" asChild>
          <Link to="/lawyer/bookings">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {pendingBookings.length === 0 ? (
          <div className="py-8 text-gray-500 text-center">
            <AlertCircle className="mx-auto mb-2 w-12 h-12 text-gray-400" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <PendingRequestItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingRequestItem({ booking }: { booking: Booking }) {
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
            <User className="flex-shrink-0 w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm truncate">
              {booking.client?.name || 'Unknown Client'}
            </span>
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
              Pending
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-1 text-gray-600 text-sm">
            <Calendar className="flex-shrink-0 w-4 h-4" />
            <span>{format(startTime, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="flex-shrink-0 w-4 h-4" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
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
