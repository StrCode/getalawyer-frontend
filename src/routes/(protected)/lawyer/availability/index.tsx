import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AvailabilitySchedule } from '@/components/lawyer/AvailabilitySchedule';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAvailabilitySchedule, useUpdateAvailabilitySchedule } from '@/lib/hooks/useAvailability';
import type { WeeklySchedule } from '@/types/availability';

export const Route = createFileRoute('/(protected)/lawyer/availability/')({
  component: AvailabilityPage,
});

function AvailabilityPage() {
  const { data: schedule, isLoading, error } = useAvailabilitySchedule();
  const updateSchedule = useUpdateAvailabilitySchedule();
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (newSchedule: WeeklySchedule) => {
    try {
      await updateSchedule.mutateAsync(newSchedule);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to update schedule:', error);
    }
  };

  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">Availability Management</h1>
          <p className="mt-2 text-muted-foreground">
            Set your weekly schedule and manage exceptions
          </p>
        </div>
        <Link to="/lawyer/availability/exceptions">
          <Button variant="outline">Manage Exceptions</Button>
        </Link>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-500">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertTitle className="text-green-600">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            Your availability schedule has been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your availability schedule. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="mr-2 w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading your schedule...</p>
        </div>
      ) : (
        <AvailabilitySchedule
          initialSchedule={schedule}
          onSubmit={handleSubmit}
          isLoading={updateSchedule.isPending}
        />
      )}

      {updateSchedule.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to update your schedule. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
