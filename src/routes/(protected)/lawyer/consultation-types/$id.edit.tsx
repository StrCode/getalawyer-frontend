import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ConsultationTypeForm } from '@/components/lawyer/ConsultationTypeForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useConsultationType,
  useUpdateConsultationType,
} from '@/lib/hooks/useConsultationTypes';

export const Route = createFileRoute('/(protected)/lawyer/consultation-types/$id/edit')({
  component: EditConsultationTypePage,
});

function EditConsultationTypePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: consultationType, isLoading, error } = useConsultationType(id);
  const updateConsultationType = useUpdateConsultationType();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
  }) => {
    try {
      await updateConsultationType.mutateAsync({ id, data });
      toast({
        title: 'Success',
        description: 'Consultation type updated successfully',
      });
      navigate({ to: '/lawyer/consultation-types' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update consultation type. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mx-auto py-8 max-w-2xl container">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  if (error || !consultationType) {
    return (
      <div className="mx-auto py-8 max-w-2xl container">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load consultation type. Please try again later.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/lawyer/consultation-types' })}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Consultation Types
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto py-8 max-w-2xl container">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/lawyer/consultation-types' })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Consultation Types
        </Button>
        <h1 className="font-bold text-3xl">Edit Consultation Type</h1>
        <p className="mt-2 text-muted-foreground">
          Update the details of your consultation type
        </p>
      </div>
      <ConsultationTypeForm
        initialData={consultationType}
        onSubmit={handleSubmit}
        isLoading={updateConsultationType.isPending}
      />
    </div>
  );
}
