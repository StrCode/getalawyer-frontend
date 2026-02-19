import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateLawyerBooking } from '@/lib/hooks/useBookings';
import type { Booking, BookingStatus } from '@/types/booking';

interface BookingCardProps {
  booking: Booking;
}

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

export function BookingCard({ booking }: BookingCardProps) {
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
    <Card data-testid="booking-card">
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
      <CardContent className="space-y-4">
        <div className="gap-4 grid grid-cols-2 text-sm">
          <div>
            <span className="font-medium">Date:</span>{' '}
            {format(startTime, 'MMM dd, yyyy')}
          </div>
          <div>
            <span className="font-medium">Time:</span>{' '}
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </div>
          <div>
            <span className="font-medium">Duration:</span>{' '}
            {booking.consultationType?.duration || 0} minutes
          </div>
          <div>
            <span className="font-medium">Price:</span> $
            {booking.consultationType?.price.toFixed(2) || '0.00'}
          </div>
        </div>

        {booking.clientNotes && (
          <div className="text-sm">
            <span className="font-medium">Client Notes:</span>
            <p className="mt-1 text-muted-foreground">{booking.clientNotes}</p>
          </div>
        )}

        {booking.meetingLink && (
          <div className="text-sm">
            <span className="font-medium">Meeting Link:</span>
            <a
              href={booking.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-primary hover:underline"
            >
              {booking.meetingLink}
            </a>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange('confirmed')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Cancel'}
              </Button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Mark Complete'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
