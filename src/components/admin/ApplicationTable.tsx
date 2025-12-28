import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { CheckCircle, Eye, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminDataTable, createSortableHeader, type PaginationInfo } from './AdminDataTable';
import type { Application } from './ApplicationManagement';
import { ApplicationReviewForm } from './ApplicationReviewForm';
import type { FilterField } from './TableFilters';

interface ApplicationTableProps {
  applications: Application[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  filters?: Record<string, unknown>;
  filterFields?: FilterField[];
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  onPaginationChange?: (pagination: PaginationInfo) => void;
  onViewDetails?: (applicationId: string) => void;
  onApprove?: (applicationId: string, notes: string) => void;
  onReject?: (applicationId: string, reason: string, feedback: string) => void;
}

export function ApplicationTable({
  applications,
  isLoading = false,
  pagination,
  filters = {},
  filterFields = [],
  onFiltersChange,
  onPaginationChange,
  onViewDetails,
  onApprove,
  onReject,
}: ApplicationTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject' | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'submittedAt', desc: true }
  ]);

  // Table columns with inline actions
  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: 'lawyerName',
      header: createSortableHeader('Lawyer'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {row.original.lawyerName}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {row.original.lawyerEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: createSortableHeader('Status'),
      cell: ({ row }) => (
        <div className="flex items-center">
          <StatusBadge status={row.original.status} />
          {row.original.status === 'pending' && (
            <div className="ml-2 flex items-center space-x-1">
              <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Awaiting Review</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'country',
      header: createSortableHeader('Location'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.country}</div>
          {row.original.state && (
            <div className="text-sm text-gray-500">{row.original.state}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'yearsOfExperience',
      header: createSortableHeader('Experience'),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {row.original.yearsOfExperience}
          </div>
          <div className="text-xs text-gray-500">years</div>
        </div>
      ),
    },
    {
      accessorKey: 'barLicenseNumber',
      header: 'Bar License',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-sm text-gray-900">
            {row.original.barLicenseNumber}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[120px]">
            {row.original.barAssociation}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: createSortableHeader('Submitted'),
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {formatDate(row.original.submittedAt)}
          </div>
          <div className="text-gray-500">
            {formatTimeAgo(row.original.submittedAt)}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const application = row.original;
        const isPending = application.status === 'pending';
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(application.id)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
            
            {isPending && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application);
                    setReviewMode('approve');
                  }}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Approve</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application);
                    setReviewMode('reject');
                  }}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Reject</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    
    // Convert TanStack sorting to API format
    if (newSorting.length > 0) {
      const sort = newSorting[0];
      onFiltersChange?.({
        ...filters,
        sortBy: sort.id,
        sortOrder: sort.desc ? 'desc' : 'asc',
      });
    }
  };

  const handleReviewComplete = () => {
    setSelectedApplication(null);
    setReviewMode(null);
  };

  const handleApprove = (notes: string) => {
    if (selectedApplication) {
      onApprove?.(selectedApplication.id, notes);
      handleReviewComplete();
    }
  };

  const handleReject = (reason: string, feedback: string) => {
    if (selectedApplication) {
      onReject?.(selectedApplication.id, reason, feedback);
      handleReviewComplete();
    }
  };

  return (
    <>
      <AdminDataTable
        data={applications}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        searchPlaceholder="Search by lawyer name, email, or bar license number..."
        emptyMessage="No applications found. Applications will appear here once lawyers submit their onboarding."
        enableAdvancedFiltering={filterFields.length > 0}
        filterFields={filterFields}
        advancedFilters={filters}
        onAdvancedFiltersChange={onFiltersChange}
        enableRowSelection={false}
        enableColumnVisibility={true}
      />

      {/* Review Form Modal */}
      {selectedApplication && reviewMode && (
        <ApplicationReviewForm
          application={selectedApplication}
          mode={reviewMode}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleReviewComplete}
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Pending Review',
      icon: <div className="h-2 w-2 bg-yellow-500 rounded-full" />,
    },
    approved: {
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Approved',
      icon: <CheckCircle className="h-3 w-3 text-green-600" />,
    },
    rejected: {
      className: 'bg-red-100 text-red-800 border-red-200',
      label: 'Rejected',
      icon: <XCircle className="h-3 w-3 text-red-600" />,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center space-x-1`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}