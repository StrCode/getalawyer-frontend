import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLawyerBooking } from '@/lib/api/bookings';
import { useUpdateLawyerBooking } from '@/lib/hooks/useBookings';
import { queryClient } from '@/lib/query-client';
import type { Booking, BookingStatus } from '@/types/booking';

export const Route = createFileRoute('/(protected)/lawyer/bookings/$id')({
  component: BookingDetailsPage,
  loader: async ({ params }) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: ['bookings', params.id],
        queryFn: () => getLawyerBooking(params.id),
      });
    } catch {
      throw new Error('Failed to load booking');
    }
  },
});

const statusColors: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function BookingDetailsPage() {
  const booking = Route.useLoaderData() as Booking;
  const updateBooking = useUpdateLawyerBooking();

  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const isUpdating = updateBooking.isPending;

  const handleStatusChange = async (newStatus: BookingStatus) => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">Booking Details</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage this booking
          </p>
        </div>
        <Link to="/lawyer/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{booking.client?.name || 'Unknown Client'}</CardTitle>
                <Badge variant={statusColors[booking.status]}>
                  {statusLabels[booking.status]}
                </Badge>
              </div>
              <CardDescription>
                {booking.consultationType?.name || 'Unknown Consultation Type'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="gap-4 grid grid-cols-2">
            <div>
              <span className="font-medium">Date:</span>
              <p className="text-muted-foreground">{format(startTime, 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <span className="font-medium">Time:</span>
              <p className="text-muted-foreground">
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </p>
            </div>
            <div>
              <span className="font-medium">Duration:</span>
              <p className="text-muted-foreground">
                {booking.consultationType?.duration || 0} minutes
              </p>
            </div>
            <div>
              <span className="font-medium">Price:</span>
              <p className="text-muted-foreground">
                ${booking.consultationType?.price.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {booking.client && (
            <div>
              <span className="font-medium">Client Email:</span>
              <p className="text-muted-foreground">{booking.client.email}</p>
            </div>
          )}

          {booking.clientNotes && (
            <div>
              <span className="font-medium">Client Notes:</span>
              <p className="mt-2 text-muted-foreground">{booking.clientNotes}</p>
            </div>
          )}

          {booking.lawyerNotes && (
            <div>
              <span className="font-medium">Your Notes:</span>
              <p className="mt-2 text-muted-foreground">{booking.lawyerNotes}</p>
            </div>
          )}

          {booking.meetingLink && (
            <div>
              <span className="font-medium">Meeting Link:</span>
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-primary hover:underline"
              >
                {booking.meetingLink}
              </a>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {booking.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Confirm Booking'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Cancel Booking'}
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('completed')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Complete'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Cancel Booking'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
