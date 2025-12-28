import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building, Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  banned: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  client?: {
    id: string;
    company?: string;
    country?: string;
    state?: string;
    phoneNumber?: string;
    specializations?: Array<{
      id: string;
      name: string;
    }>;
  };
}

export const Route = createFileRoute("/(protected)/admin/clients/$id")({
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch client details
  const { data: clientData, isLoading, error } = useQuery({
    queryKey: ["admin", "client", id],
    queryFn: () => api.admin.getClient(id),
  });

  const client = clientData?.data as ClientUser;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h2>
        <p className="text-gray-600 mb-6">The client you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate({ to: "/admin/clients" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
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
          onClick={() => navigate({ to: "/admin/clients" })}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-2">Client Profile</p>
          </div>
          <StatusBadge status={client.banned ? 'banned' : 'active'} />
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
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                </div>
                {client.client?.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{client.client.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {client.client?.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company</p>
                      <p className="text-gray-900">{client.client.company}</p>
                    </div>
                  </div>
                )}
                {client.client?.country && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900">
                        {client.client.state ? `${client.client.state}, ` : ''}{client.client.country}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-gray-900">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          {client.client?.specializations && client.client.specializations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Legal Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.client.specializations.map((spec) => (
                    <Badge key={spec.id} variant="secondary">
                      {spec.name}
                    </Badge>
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
                {client.image ? (
                  <img
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                    src={client.image}
                    alt={client.name}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                    <span className="text-gray-600 font-medium text-4xl">
                      {client.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-gray-900">{client.name}</h3>
                <p className="text-gray-600">Client</p>
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
                  <StatusBadge status={client.banned ? 'banned' : 'active'} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Onboarding</span>
                  <Badge variant={client.onboardingCompleted ? "default" : "secondary"}>
                    {client.onboardingCompleted ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Role</span>
                  <Badge variant="outline">{client.role}</Badge>
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
                {!client.banned ? (
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
