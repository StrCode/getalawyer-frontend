import { createFileRoute } from '@tanstack/react-router';
import { CalendarIntegration } from '@/components/lawyer/CalendarIntegration';

export const Route = createFileRoute('/(protected)/lawyer/calendar/')({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div>
        <h1 className="font-bold text-3xl">Calendar Integration</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your Google Calendar to sync bookings automatically
        </p>
      </div>

      <CalendarIntegration />
    </div>
  );
}
