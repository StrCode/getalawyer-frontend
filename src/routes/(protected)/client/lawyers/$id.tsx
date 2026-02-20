import { createFileRoute } from '@tanstack/react-router';
import { Award, Briefcase } from 'lucide-react';
import { ConsultationTypeCard } from '@/components/client/ConsultationTypeCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLawyer } from '@/lib/hooks/useLawyers';

export const Route = createFileRoute('/(protected)/client/lawyers/$id')({
  component: LawyerProfilePage,
});

function LawyerProfilePage() {
  const { id } = Route.useParams();
  const { data: lawyer, isLoading, error } = useLawyer(id);

  if (isLoading) {
    return (
      <div className="space-y-6 mx-auto py-8 container">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto py-8 container">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load lawyer profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="mx-auto py-8 container">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The lawyer profile you're looking for could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const initials = lawyer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Filter to show only active consultation types
  const activeConsultationTypes = lawyer.consultationTypes?.filter((type) => type.isActive) || [];

  return (
    <div className="space-y-6 mx-auto py-8 container">
      {/* Lawyer Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-3xl">{lawyer.name}</CardTitle>
              {lawyer.specialty && (
                <CardDescription className="flex items-center gap-2 text-base">
                  <Award className="w-4 h-4" />
                  <span>{lawyer.specialty}</span>
                </CardDescription>
              )}
              {lawyer.experience !== undefined && (
                <CardDescription className="flex items-center gap-2 text-base">
                  <Briefcase className="w-4 h-4" />
                  <span>{lawyer.experience} years of experience</span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {lawyer.bio && (
          <CardContent>
            <p className="text-muted-foreground">{lawyer.bio}</p>
          </CardContent>
        )}
      </Card>

      {/* Consultation Types Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-2xl">Available Consultations</h2>
          <p className="mt-1 text-muted-foreground">
            Choose a consultation type to book an appointment
          </p>
        </div>

        {activeConsultationTypes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Consultations Available</CardTitle>
              <CardDescription>
                This lawyer is not currently offering any consultation types.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeConsultationTypes.map((type) => (
              <ConsultationTypeCard key={type.id} consultationType={type} lawyerId={lawyer.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
