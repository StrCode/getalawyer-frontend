import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api/client";

interface ClientsSearch {
  page?: number;
  query?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const Route = createFileRoute("/(protected)/admin/clients")({
  validateSearch: (search: Record<string, unknown>): ClientsSearch => ({
    page: Number(search.page) || 1,
    query: (search.query as string) || '',
    status: (search.status as string) || '',
    country: (search.country as string) || '',
    sortBy: (search.sortBy as string) || 'name',
    sortOrder: (search.sortOrder as string) || 'asc',
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/(protected)/admin/clients" });

  // Fetch clients
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ["admin", "clients", search],
    queryFn: () => api.admin.getClients({
      page: search.page,
      query: search.query,
      status: search.status,
      country: search.country,
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
      limit: 20,
    }),
  });

  const clients = clientsData?.data?.users || [];
  const pagination = clientsData?.data?.pagination;

  const handleSearch = (newSearch: Partial<ClientsSearch>) => {
    navigate({
      search: { ...search, ...newSearch, page: 1 },
    });
  };

  const handlePageChange = (page: number) => {
    navigate({
      search: { ...search, page },
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
        <p className="text-gray-600 mt-2">View and manage client profiles</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              placeholder="Search by name, email, or company..."
              value={search.query}
              onChange={(e) => handleSearch({ query: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={search.status}
              onValueChange={(value) => handleSearch({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <Input
              placeholder="Filter by country..."
              value={search.country}
              onChange={(e) => handleSearch({ country: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <Select
              value={search.sortBy}
              onValueChange={(value) => handleSearch({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="createdAt">Join Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Clients ({pagination?.total || 0})
          </h2>
        </div>
        
        {clients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {clients.map((client: any) => (
              <div key={client.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {client.image ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={client.image}
                          alt={client.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-lg">
                            {client.name?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {client.name}
                        </h3>
                        <StatusBadge status={client.banned ? 'banned' : 'active'} />
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {client.email}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {client.client?.company || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Country:</span> {client.client?.country || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {formatDate(client.createdAt)}
                        </div>
                      </div>
                      {client.client?.phoneNumber && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {client.client.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: `/admin/clients/${client.id}` })}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No clients found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
    month: 'short',
    day: 'numeric',
  });
}