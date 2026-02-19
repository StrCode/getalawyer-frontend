import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { AvailabilityExceptions } from '@/components/lawyer/AvailabilityExceptions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  useAvailabilityExceptions,
  useCreateAvailabilityException,
  useDeleteAvailabilityException,
} from '@/lib/hooks/useAvailability';
import type { CreateExceptionInput } from '@/types/availability';

export const Route = createFileRoute('/(protected)/lawyer/availability/exceptions')({
  component: AvailabilityExceptionsPage,
});

function AvailabilityExceptionsPage() {
  const { data: exceptions = [], isLoading, error } = useAvailabilityExceptions();
  const createException = useCreateAvailabilityException();
  const deleteException = useDeleteAvailabilityException();

  const handleCreateException = async (data: CreateExceptionInput) => {
    try {
      await createException.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to create exception:', error);
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      await deleteException.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to delete exception:', error);
    }
  };

  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/lawyer/availability">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Schedule
            </Button>
          </Link>
          <h1 className="font-bold text-3xl">Availability Exceptions</h1>
          <p className="mt-2 text-muted-foreground">
            Block out dates when you're unavailable
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your exceptions. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {createException.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to create exception. Please check your dates and try again.
          </AlertDescription>
        </Alert>
      )}

      {deleteException.isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to delete exception. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="mr-2 w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading exceptions...</p>
        </div>
      ) : (
        <AvailabilityExceptions
          exceptions={exceptions}
          onCreateException={handleCreateException}
          onDeleteException={handleDeleteException}
          isLoading={isLoading}
          isCreating={createException.isPending}
          isDeleting={deleteException.isPending}
        />
      )}
    </div>
  );
}
