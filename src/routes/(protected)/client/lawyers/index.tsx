import { createFileRoute } from '@tanstack/react-router';
import { LawyerList } from '@/components/client/LawyerList';

export const Route = createFileRoute('/(protected)/client/lawyers/')({
  component: LawyersPage,
});

function LawyersPage() {
  return (
    <div className="space-y-6 mx-auto py-8 container">
      <div>
        <h1 className="font-bold text-3xl">Find a Lawyer</h1>
        <p className="mt-2 text-muted-foreground">
          Browse lawyers and book consultations
        </p>
      </div>
      <LawyerList />
    </div>
  );
}
