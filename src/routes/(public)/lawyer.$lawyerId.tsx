import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Award, Briefcase, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { httpClient } from '@/lib/api/client';
import type { LawyerDocument, LawyerProfileResponse, LawyerProfileSpecialization } from '@/types/lawyer-search';
import { generateLawyerProfileSEO } from '@/utils/seo';

export const Route = createFileRoute('/(public)/lawyer/$lawyerId')({
  component: LawyerProfilePage,
});

function LawyerProfilePage() {
  const { lawyerId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['lawyer-profile', lawyerId],
    queryFn: () => httpClient.get<LawyerProfileResponse>(`/api/lawyers/${lawyerId}/profile`),
  });

  // Generate SEO metadata
  const seoMetadata = data?.lawyer ? generateLawyerProfileSEO(data.lawyer) : {
    title: 'Lawyer Profile',
    description: 'View lawyer profile and credentials',
  };

  if (isLoading) {
    return (
      <>
        <SEOHead metadata={seoMetadata} />
        <div className="bg-background min-h-screen">
          <div className="mx-auto px-4 py-8 max-w-5xl container">
            <Skeleton className="mb-6 w-32 h-10" />
            <div className="gap-6 grid md:grid-cols-3">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Skeleton className="mb-4 rounded-full w-32 h-32" />
                      <Skeleton className="mb-2 w-40 h-6" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6 md:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="w-32 h-6" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data?.lawyer) {
    return (
      <>
        <SEOHead metadata={seoMetadata} />
        <div className="flex justify-center items-center bg-background min-h-screen">
          <div className="text-center">
            <h1 className="mb-2 font-bold text-2xl">Lawyer Not Found</h1>
            <p className="mb-4 text-muted-foreground">The lawyer profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate({ to: '/search-lawyer' })}>
              Back to Search
            </Button>
          </div>
        </div>
      </>
    );
  }

  const lawyer = data.lawyer;
  const initials = lawyer.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      
      <div className="bg-background min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-5xl container">
          {/* Back Button */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/search-lawyer' })}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Search
            </Button>
          </nav>

          <article className="gap-6 grid md:grid-cols-3">
            {/* Sidebar */}
            <aside className="space-y-6 md:col-span-1">
              {/* Profile Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="mb-4 w-32 h-32">
                      <AvatarImage src={lawyer.profileImage} alt={`${lawyer.name} - Lawyer`} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <h1 className="mb-1 font-bold text-2xl">{lawyer.name}</h1>
                    <p className="mb-4 text-muted-foreground text-sm">
                      {lawyer.yearsOfExperience} years of experience
                    </p>
                    <Button className="mb-2 w-full" aria-label={`Contact ${lawyer.name}`}>
                      Contact Lawyer
                    </Button>
                    <Button variant="outline" className="w-full" aria-label={`Save ${lawyer.name}'s profile`}>
                      Save Profile
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  {/* Contact Info */}
                  <address className="space-y-3 not-italic">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <a href={`tel:${lawyer.phoneNumber}`} className="hover:underline">
                        {lawyer.phoneNumber}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <a href={`mailto:${lawyer.email}`} className="hover:underline truncate">
                        {lawyer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span>{lawyer.state}, {lawyer.country}</span>
                    </div>
                  </address>
                </CardContent>
              </Card>

              {/* Bar License */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bar License</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">License Number:</span>
                    <p className="font-medium">{lawyer.barLicenseNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bar Association:</span>
                    <p className="font-medium">{lawyer.barAssociation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default" className="ml-2">
                      {lawyer.licenseStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="space-y-6 md:col-span-2">
              {/* About */}
              {lawyer.bio && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{lawyer.bio}</p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Specializations */}
              {lawyer.specializations?.length > 0 && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" aria-hidden="true" />
                        Specializations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="gap-4 grid sm:grid-cols-2">
                        {lawyer.specializations.map((spec: LawyerProfileSpecialization) => (
                          <div key={spec.id} className="p-4 border rounded-lg">
                            <h3 className="mb-1 font-semibold">{spec.name}</h3>
                            <p className="text-muted-foreground text-sm">
                              {spec.yearsOfExperience} years of experience
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Experience Description */}
              {lawyer.experienceDescription && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" aria-hidden="true" />
                        Professional Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {lawyer.experienceDescription}
                      </p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Documents */}
              {lawyer.documents?.length > 0 && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                        Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lawyer.documents.map((doc: LawyerDocument) => (
                          <li key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                              <div>
                                <p className="font-medium text-sm">{doc.originalName || doc.type}</p>
                                <time className="text-muted-foreground text-xs" dateTime={doc.createdAt}>
                                  Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label={`View ${doc.originalName || doc.type}`}
                              >
                                View
                              </a>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
