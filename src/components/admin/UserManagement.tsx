import { ColumnDef } from '@tanstack/react-table';
import { Building, Calendar, Edit, Eye, Flag, Mail, MapPin, Phone, Scale, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminUser, useAdminUsers } from '@/hooks/use-admin-queries';
import { AdminDataTable, createActionColumn, createSortableHeader } from './AdminDataTable';
import { SuperAdminProfileForm } from './SuperAdminProfileForm';
import { UserStatusForm } from './UserStatusForm';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'reviewer' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  lastLoginAt?: string;
  client?: {
    id: string;
    company?: string;
    country?: string;
    state?: string;
    phoneNumber?: string;
    specializations?: Array<{ id: string; name: string }>;
  };
  lawyer?: {
    id: string;
    country?: string;
    state?: string;
    phoneNumber?: string;
    yearsOfExperience?: number;
    barLicenseNumber?: string;
    barAssociation?: string;
    licenseStatus?: string;
    specializations?: Array<{ id: string; name: string; yearsOfExperience: number }>;
  };
}

export interface UserManagementProps {
  userType?: 'all' | 'lawyers' | 'clients';
  initialFilters?: Record<string, any>;
  currentUserRole?: string;
}

export function UserManagement({ userType = 'all', initialFilters = {}, currentUserRole = 'admin' }: UserManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    query: '',
    status: '',
    country: '',
    userType: userType === 'all' ? '' : userType === 'lawyers' ? 'lawyer' : 'client',
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Fetch users with current filters
  const { data: usersData, isLoading } = useAdminUsers({
    page: currentPage,
    limit: 20,
    ...filters,
  });

  // Fetch detailed user data when viewing details
  const { data: userDetailData } = useAdminUser(selectedUser?.id || '', {
    enabled: !!selectedUser?.id && showUserDetail,
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleManageStatus = (user: User) => {
    setSelectedUser(user);
    setShowStatusForm(true);
  };

  const handleEditProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfileForm(true);
  };

  const handleStatusUpdate = () => {
    setShowStatusForm(false);
    setSelectedUser(null);
    // Refetch will happen automatically due to query invalidation
  };

  const handleProfileUpdate = () => {
    setShowProfileForm(false);
    setSelectedUser(null);
    // Refetch will happen automatically due to query invalidation
  };

  // Define table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: createSortableHeader('Name'),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'userType',
      header: 'Type',
      cell: ({ row }) => {
        const user = row.original;
        const type = user.client ? 'Client' : user.lawyer ? 'Lawyer' : 'User';
        const variant = user.client ? 'default' : user.lawyer ? 'secondary' : 'outline';
        return <Badge variant={variant}>{type}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge variant={user.banned ? 'destructive' : 'default'}>
            {user.banned ? 'Banned' : 'Active'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const user = row.original;
        const country = user.client?.country || user.lawyer?.country;
        const state = user.client?.state || user.lawyer?.state;
        return (
          <div className="text-sm">
            {country && state ? `${state}, ${country}` : country || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: createSortableHeader('Joined'),
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    createActionColumn([
      {
        label: 'View Details',
        onClick: handleViewUser,
      },
      {
        label: 'Manage Status',
        onClick: handleManageStatus,
      },
      ...(currentUserRole === 'super_admin' ? [{
        label: 'Edit Profile',
        onClick: handleEditProfile,
      }] : []),
    ]),
  ];

  // Filter fields for advanced filtering
  const filterFields = [
    {
      key: 'query',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by name, email, company, or phone...',
    },
    {
      key: 'userType',
      label: 'User Type',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Types' },
        { value: 'client', label: 'Clients' },
        { value: 'lawyer', label: 'Lawyers' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'banned', label: 'Banned' },
      ],
    },
    {
      key: 'country',
      label: 'Country',
      type: 'text' as const,
      placeholder: 'Filter by country...',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {userType === 'lawyers' ? 'Lawyers' : userType === 'clients' ? 'Clients' : 'Users'} Management
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage {userType === 'all' ? 'user' : userType} accounts and profiles
        </p>
      </div>

      {/* User Type Filter (only show for 'all' userType) */}
      {userType === 'all' && (
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filters.userType === '' ? 'default' : 'outline'}
            onClick={() => handleFilterChange({ userType: '' })}
          >
            All Users
          </Button>
          <Button
            variant={filters.userType === 'lawyer' ? 'default' : 'outline'}
            onClick={() => handleFilterChange({ userType: 'lawyer' })}
          >
            Lawyers Only
          </Button>
          <Button
            variant={filters.userType === 'client' ? 'default' : 'outline'}
            onClick={() => handleFilterChange({ userType: 'client' })}
          >
            Clients Only
          </Button>
        </div>
      )}

      {/* Data Table */}
      <AdminDataTable
        data={users}
        columns={columns}
        pagination={pagination}
        isLoading={isLoading}
        enableAdvancedFiltering={true}
        filterFields={filterFields}
        advancedFilters={filters}
        onAdvancedFiltersChange={handleFilterChange}
        onPaginationChange={(newPagination) => setCurrentPage(newPagination.page)}
        searchPlaceholder="Search users..."
        emptyMessage={`No ${userType === 'all' ? 'users' : userType} found`}
      />

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserDetailView user={userDetailData?.data || selectedUser} />
          )}
        </DialogContent>
      </Dialog>

      {/* User Status Form Dialog */}
      <Dialog open={showStatusForm} onOpenChange={setShowStatusForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Status</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserStatusForm
              user={selectedUser}
              onSuccess={handleStatusUpdate}
              onCancel={() => setShowStatusForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Super Admin Profile Edit Dialog */}
      <Dialog open={showProfileForm} onOpenChange={setShowProfileForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <SuperAdminProfileForm
              user={selectedUser}
              currentUserRole={currentUserRole}
              onSuccess={handleProfileUpdate}
              onCancel={() => setShowProfileForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// User Detail View Component
function UserDetailView({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="text-lg">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <Badge variant={user.banned ? 'destructive' : 'default'}>
              {user.banned ? 'Banned' : 'Active'}
            </Badge>
            <Badge variant={user.client ? 'default' : user.lawyer ? 'secondary' : 'outline'}>
              {user.client ? 'Client' : user.lawyer ? 'Lawyer' : 'User'}
            </Badge>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            {user.lastLoginAt && (
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ban Information */}
      {user.banned && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <UserX className="h-5 w-5" />
              <span>Account Banned</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.banReason && (
              <p className="text-red-700 mb-2">
                <strong>Reason:</strong> {user.banReason}
              </p>
            )}
            {user.banExpires && (
              <p className="text-red-700">
                <strong>Expires:</strong> {new Date(user.banExpires).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Profile */}
        {user.client && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Client Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.client.company && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p>{user.client.company}</p>
                </div>
              )}
              {user.client.phoneNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.client.phoneNumber}</span>
                  </div>
                </div>
              )}
              {(user.client.country || user.client.state) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {user.client.state && user.client.country
                        ? `${user.client.state}, ${user.client.country}`
                        : user.client.country || user.client.state}
                    </span>
                  </div>
                </div>
              )}
              {user.client.specializations && user.client.specializations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Specializations</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.client.specializations.map((spec) => (
                      <Badge key={spec.id} variant="outline">
                        {spec.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lawyer Profile */}
        {user.lawyer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Lawyer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.lawyer.phoneNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.lawyer.phoneNumber}</span>
                  </div>
                </div>
              )}
              {(user.lawyer.country || user.lawyer.state) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {user.lawyer.state && user.lawyer.country
                        ? `${user.lawyer.state}, ${user.lawyer.country}`
                        : user.lawyer.country || user.lawyer.state}
                    </span>
                  </div>
                </div>
              )}
              {user.lawyer.yearsOfExperience !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p>{user.lawyer.yearsOfExperience} years</p>
                </div>
              )}
              {user.lawyer.barLicenseNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bar License</label>
                  <p>{user.lawyer.barLicenseNumber}</p>
                </div>
              )}
              {user.lawyer.barAssociation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bar Association</label>
                  <p>{user.lawyer.barAssociation}</p>
                </div>
              )}
              {user.lawyer.licenseStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-500">License Status</label>
                  <Badge variant={user.lawyer.licenseStatus === 'active' ? 'default' : 'secondary'}>
                    {user.lawyer.licenseStatus}
                  </Badge>
                </div>
              )}
              {user.lawyer.specializations && user.lawyer.specializations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Specializations</label>
                  <div className="space-y-2 mt-1">
                    {user.lawyer.specializations.map((spec) => (
                      <div key={spec.id} className="flex items-center justify-between">
                        <Badge variant="outline">{spec.name}</Badge>
                        <span className="text-sm text-gray-500">
                          {spec.yearsOfExperience} years
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}