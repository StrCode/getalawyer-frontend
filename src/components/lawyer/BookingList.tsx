import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLawyerBookings } from '@/lib/hooks/useBookings';
import type { Booking, BookingStatus } from '@/types/booking';
import { BookingCard } from './BookingCard';

const statusOrder: Record<BookingStatus, number> = {
  pending: 0,
  confirmed: 1,
  completed: 2,
  cancelled: 3,
};

const statusTitles: Record<BookingStatus, string> = {
  pending: 'Pending Requests',
  confirmed: 'Confirmed Bookings',
  completed: 'Completed Consultations',
  cancelled: 'Cancelled Bookings',
};

export function BookingList() {
  const { data: bookings, isLoading, error } = useLawyerBookings();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load bookings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Bookings</CardTitle>
          <CardDescription>
            You don't have any bookings yet. Once clients book consultations with you, they will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group bookings by status
  const groupedBookings = bookings.reduce(
    (acc, booking) => {
      if (!acc[booking.status]) {
        acc[booking.status] = [];
      }
      acc[booking.status].push(booking);
      return acc;
    },
    {} as Record<BookingStatus, Booking[]>
  );

  // Sort statuses by order
  const sortedStatuses = (Object.keys(groupedBookings) as BookingStatus[]).sort(
    (a, b) => statusOrder[a] - statusOrder[b]
  );

  return (
    <div className="space-y-6">
      {sortedStatuses.map((status) => (
        <div key={status} className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{statusTitles[status]}</h2>
            <span className="text-muted-foreground text-sm">
              {groupedBookings[status].length} booking{groupedBookings[status].length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {groupedBookings[status].map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
