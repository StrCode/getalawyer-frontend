import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ConsultationTypeForm } from '@/components/lawyer/ConsultationTypeForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateConsultationType } from '@/lib/hooks/useConsultationTypes';

export const Route = createFileRoute('/(protected)/lawyer/consultation-types/new')({
  component: NewConsultationTypePage,
});

function NewConsultationTypePage() {
  const navigate = useNavigate();
  const createConsultationType = useCreateConsultationType();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
  }) => {
    try {
      await createConsultationType.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Consultation type created successfully',
      });
      navigate({ to: '/lawyer/consultation-types' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create consultation type. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

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
        <h1 className="font-bold text-3xl">Create Consultation Type</h1>
        <p className="mt-2 text-muted-foreground">
          Define a new consultation type for your practice
        </p>
      </div>
      <ConsultationTypeForm
        onSubmit={handleSubmit}
        isLoading={createConsultationType.isPending}
      />
    </div>
  );
}
