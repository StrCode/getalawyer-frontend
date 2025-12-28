import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Award, Calendar, FileText, Mail, MapPin, Phone, Scale, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";

interface LawyerUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  banned: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  lawyer?: {
    id: string;
    phoneNumber?: string;
    country?: string;
    state?: string;
    yearsOfExperience: number;
    barLicenseNumber: string;
    barAssociation: string;
    licenseStatus: string;
    applicationStatus: 'pending' | 'approved' | 'rejected';
    experienceDescription?: string;
    specializations?: Array<{
      id: string;
      name: string;
      description?: string;
      yearsOfExperience?: number;
    }>;
    documents?: Array<{
      id: string;
      type: string;
      url: string;
      originalName?: string;
      createdAt: string;
    }>;
  };
}

export const Route = createFileRoute("/(protected)/admin/lawyers/$id")({
  component: LawyerDetailPage,
});

function LawyerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch lawyer details
  const { data: lawyerData, isLoading, error } = useQuery({
    queryKey: ["admin", "lawyer", id],
    queryFn: () => api.admin.getLawyer(id),
  });

  const lawyer = lawyerData?.data as LawyerUser;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lawyer Not Found</h2>
        <p className="text-gray-600 mb-6">The lawyer you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate({ to: "/admin/lawyers" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lawyers
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/admin/lawyers" })}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lawyers
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lawyer.name}</h1>
            <p className="text-gray-600 mt-2">Lawyer Profile</p>
          </div>
          <div className="flex space-x-2">
            <StatusBadge status={lawyer.banned ? 'banned' : 'active'} />
            {lawyer.lawyer?.applicationStatus && (
              <ApplicationStatusBadge status={lawyer.lawyer.applicationStatus} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{lawyer.email}</p>
                  </div>
                </div>
                {lawyer.lawyer?.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{lawyer.lawyer.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {lawyer.lawyer?.country && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900">
                        {lawyer.lawyer.state ? `${lawyer.lawyer.state}, ` : ''}{lawyer.lawyer.country}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-gray-900">{formatDate(lawyer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {lawyer.lawyer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                    <p className="text-gray-900">{lawyer.lawyer.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bar License Number</p>
                    <p className="text-gray-900">{lawyer.lawyer.barLicenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bar Association</p>
                    <p className="text-gray-900">{lawyer.lawyer.barAssociation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">License Status</p>
                    <p className="text-gray-900">{lawyer.lawyer.licenseStatus}</p>
                  </div>
                  {lawyer.lawyer.experienceDescription && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Experience Description</p>
                      <p className="text-gray-900 mt-1">{lawyer.lawyer.experienceDescription}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specializations */}
          {lawyer.lawyer?.specializations && lawyer.lawyer.specializations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lawyer.lawyer.specializations.map((spec) => (
                    <div key={spec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{spec.name}</h4>
                        {spec.description && (
                          <p className="text-sm text-gray-600">{spec.description}</p>
                        )}
                      </div>
                      {spec.yearsOfExperience && (
                        <Badge variant="secondary">
                          {spec.yearsOfExperience} years
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {lawyer.lawyer?.documents && lawyer.lawyer.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lawyer.lawyer.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.originalName || `${doc.type.replace('_', ' ').toUpperCase()}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Uploaded {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {lawyer.image ? (
                  <img
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                    src={lawyer.image}
                    alt={lawyer.name}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                    <span className="text-gray-600 font-medium text-4xl">
                      {lawyer.name?.charAt(0)?.toUpperCase() || 'L'}
                    </span>
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-gray-900">{lawyer.name}</h3>
                <p className="text-gray-600">Lawyer</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <StatusBadge status={lawyer.banned ? 'banned' : 'active'} />
                </div>
                {lawyer.lawyer?.applicationStatus && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Application</span>
                    <ApplicationStatusBadge status={lawyer.lawyer.applicationStatus} />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Onboarding</span>
                  <Badge variant={lawyer.onboardingCompleted ? "default" : "secondary"}>
                    {lawyer.onboardingCompleted ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Role</span>
                  <Badge variant="outline">{lawyer.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lawyer.lawyer?.applicationStatus === 'pending' && (
                  <>
                    <Button variant="default" size="sm" className="w-full">
                      Approve Application
                    </Button>
                    <Button variant="destructive" size="sm" className="w-full">
                      Reject Application
                    </Button>
                  </>
                )}
                {!lawyer.banned ? (
                  <Button variant="destructive" size="sm" className="w-full">
                    Suspend Account
                  </Button>
                ) : (
                  <Button variant="default" size="sm" className="w-full">
                    Reactivate Account
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  Send Message
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    banned: { color: 'bg-red-100 text-red-800', label: 'Banned' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
