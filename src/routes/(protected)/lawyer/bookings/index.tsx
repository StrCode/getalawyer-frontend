import { createFileRoute } from '@tanstack/react-router';
import { BookingList } from '@/components/lawyer/BookingList';

export const Route = createFileRoute('/(protected)/lawyer/bookings/')({
  component: LawyerBookingsPage,
});

function LawyerBookingsPage() {
  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div>
        <h1 className="font-bold text-3xl">Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your consultation bookings and appointments
        </p>
      </div>
      <BookingList />
    </div>
  );
}
