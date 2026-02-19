import { createFileRoute, Link } from '@tanstack/react-router';
import { ConsultationTypeList } from '@/components/lawyer/ConsultationTypeList';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(protected)/lawyer/consultation-types/')({
  component: ConsultationTypesPage,
});

function ConsultationTypesPage() {
  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">Consultation Types</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your consultation offerings and pricing
          </p>
        </div>
        <Link to="/lawyer/consultation-types/new">
          <Button>Create New Type</Button>
        </Link>
      </div>
      <ConsultationTypeList />
    </div>
  );
}
