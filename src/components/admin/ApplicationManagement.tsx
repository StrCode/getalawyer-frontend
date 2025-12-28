import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminApplication, useAdminApplications } from '@/hooks/use-admin-queries';
import type { PaginationInfo } from './AdminDataTable';
import { ApplicationTable } from './ApplicationTable';
import type { FilterField } from './TableFilters';

export interface Application {
  id: string;
  lawyerName: string;
  lawyerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  country: string;
  state?: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectionFeedback?: string;
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    originalName: string;
  }>;
  specializations?: Array<{
    id: string;
    name: string;
    yearsOfExperience: number;
  }>;
}

interface ApplicationFilters extends Record<string, unknown> {
  query?: string;
  status?: string;
  country?: string;
  state?: string;
  reviewerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ApplicationManagementProps {
  className?: string;
}

export function ApplicationManagement({ className }: ApplicationManagementProps) {
  const [filters, setFilters] = useState<ApplicationFilters>({
    sortBy: 'submittedAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Fetch applications with current filters
  const { data: applicationsData, isLoading } = useAdminApplications({
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
  });

  // Fetch detailed application data when one is selected
  const { data: applicationDetailData, isLoading: isLoadingDetail, error: detailError } = useAdminApplication(selectedApplicationId || '');

  const applications = applicationsData?.data?.applications || [];
  const paginationData = applicationsData?.data?.pagination;

  // Transform applications data to match the Application interface
  const transformedApplications = applications.map((app: any) => ({
    id: app.id,
    lawyerName: app.lawyer?.user?.name || 'N/A',
    lawyerEmail: app.lawyer?.user?.email || 'N/A', 
    status: app.applicationStatus || 'pending', // applicationStatus is at root level
    country: app.lawyer?.country || 'N/A',
    state: app.lawyer?.state || null,
    yearsOfExperience: app.lawyer?.yearsOfExperience || 0,
    barLicenseNumber: app.lawyer?.barLicenseNumber || 'N/A',
    barAssociation: app.lawyer?.barAssociation || 'N/A',
    submittedAt: app.submittedAt || new Date().toISOString(),
    reviewedAt: app.reviewedAt || null,
    reviewerId: app.reviewerId || null,
    reviewerName: app.reviewer?.name || null,
    reviewNotes: app.reviewNotes || null,
    rejectionReason: app.rejectionReason || null,
    rejectionFeedback: app.rejectionFeedback || null,
    documents: app.documents || [],
    specializations: app.specializations || [],
  }));

  // Update pagination when data changes
  if (paginationData && paginationData !== pagination) {
    setPagination(paginationData);
  }

  // Filter fields for advanced filtering
  const filterFields: Array<FilterField> = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      id: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Filter by country...',
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Filter by state...',
    },
    {
      id: 'dateFrom',
      label: 'From Date',
      type: 'date',
    },
    {
      id: 'dateTo',
      label: 'To Date',
      type: 'date',
    },
    {
      id: 'sortBy',
      label: 'Sort By',
      type: 'select',
      options: [
        { label: 'Submitted Date', value: 'submittedAt' },
        { label: 'Lawyer Name', value: 'lawyerName' },
        { label: 'Country', value: 'country' },
        { label: 'Experience', value: 'yearsOfExperience' },
        { label: 'Status', value: 'applicationStatus' },
      ],
    },
    {
      id: 'sortOrder',
      label: 'Sort Order',
      type: 'select',
      options: [
        { label: 'Newest First', value: 'desc' },
        { label: 'Oldest First', value: 'asc' },
      ],
    },
  ];

  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePaginationChange = (newPagination: PaginationInfo) => {
    setPagination(newPagination);
  };

  const handleApprove = (applicationId: string, notes: string) => {
    // The ApplicationReviewForm handles the actual API call
    console.log(`Approving application ${applicationId} with notes: ${notes}`);
    // Refresh the applications list after approval
    // The useApproveApplication hook in ApplicationReviewForm will invalidate queries
  };

  const handleReject = (applicationId: string, reason: string, feedback: string) => {
    // The ApplicationReviewForm handles the actual API call
    console.log(`Rejecting application ${applicationId} with reason: ${reason}, feedback: ${feedback}`);
    // Refresh the applications list after rejection
    // The useRejectApplication hook in ApplicationReviewForm will invalidate queries
  };

  return (
    <div className={className}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
        <p className="text-gray-600 mt-2">
          Review and manage lawyer applications with advanced filtering and search capabilities
        </p>
      </div>

      {/* Use ApplicationTable for specialized application display */}
      <ApplicationTable
        applications={transformedApplications}
        isLoading={isLoading}
        pagination={paginationData}
        filters={filters}
        filterFields={filterFields}
        onFiltersChange={handleFiltersChange}
        onPaginationChange={handlePaginationChange}
        onViewDetails={setSelectedApplicationId}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Application Detail Modal */}
      <Dialog 
        open={!!selectedApplicationId} 
        onOpenChange={(open) => !open && setSelectedApplicationId(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Application Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetail && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading application details...</span>
            </div>
          )}
          
          {detailError && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading application details: {detailError.message}</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedApplicationId(null)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
          
          {applicationDetailData?.data && !isLoadingDetail && (
            <ApplicationDetailView 
              application={applicationDetailData.data}
              onClose={() => setSelectedApplicationId(null)}
            />
          )}
          
          {!applicationDetailData?.data && !isLoadingDetail && !detailError && selectedApplicationId && (
            <div className="text-center py-8">
              <p className="text-gray-600">Application details not found.</p>
              <p className="text-sm text-gray-500 mt-2">The application may have been deleted or you may not have permission to view it.</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedApplicationId(null)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationDetailView({ 
  application, 
  onClose 
}: { 
  application: any; // Using any since the API structure is different from our Application interface
  onClose: () => void;
}) {
  // Transform the API response to match the expected structure
  const transformedApplication = {
    id: application.id,
    lawyerName: application.lawyer?.user?.name || 'N/A',
    lawyerEmail: application.lawyer?.user?.email || 'N/A',
    status: application.applicationStatus || 'pending',
    country: application.lawyer?.country || 'N/A',
    state: application.lawyer?.state || null,
    yearsOfExperience: application.lawyer?.yearsOfExperience || 0,
    submittedAt: application.submittedAt || new Date().toISOString(),
    barLicenseNumber: application.lawyer?.barLicenseNumber || 'N/A',
    barAssociation: application.lawyer?.barAssociation || 'N/A',
    licenseStatus: application.lawyer?.licenseStatus || 'N/A',
    experienceDescription: application.lawyer?.experienceDescription || null,
    documents: application.documents || [],
    specializations: application.specializations || [],
    reviewNotes: application.reviewNotes || null,
    rejectionReason: application.rejectionReason || null,
    rejectionFeedback: application.rejectionFeedback || null,
    reviewedAt: application.reviewedAt || null,
    reviewerName: application.reviewer?.name || null,
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Lawyer Name</div>
            <p className="text-lg font-semibold text-gray-900">{transformedApplication.lawyerName}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <p className="text-gray-900">{transformedApplication.lawyerEmail}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div className="mt-1">
              <StatusBadge status={transformedApplication.status} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Location</div>
            <p className="text-gray-900">
              {transformedApplication.country}
              {transformedApplication.state && `, ${transformedApplication.state}`}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Years of Experience</div>
            <p className="text-gray-900">{transformedApplication.yearsOfExperience} years</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Submitted</div>
            <p className="text-gray-900">{formatDate(transformedApplication.submittedAt)}</p>
          </div>
        </div>
      </div>

      {/* Bar Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bar Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Bar License Number</div>
            <p className="text-gray-900 font-mono">{transformedApplication.barLicenseNumber}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Bar Association</div>
            <p className="text-gray-900">{transformedApplication.barAssociation}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">License Status</div>
            <p className="text-gray-900 capitalize">{transformedApplication.licenseStatus}</p>
          </div>
          {application.lawyer?.phoneNumber && (
            <div>
              <div className="text-sm font-medium text-gray-500">Phone Number</div>
              <p className="text-gray-900">{application.lawyer.phoneNumber}</p>
            </div>
          )}
        </div>
        {transformedApplication.experienceDescription && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-500">Experience Description</div>
            <p className="text-gray-900 mt-1">{transformedApplication.experienceDescription}</p>
          </div>
        )}
      </div>

      {/* Documents */}
      {transformedApplication.documents && transformedApplication.documents.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
          <div className="space-y-2">
            {transformedApplication.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.originalName || 'Document'}</p>
                    <p className="text-sm text-gray-500 capitalize">{doc.type?.replace('_', ' ') || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">Uploaded {formatDate(doc.createdAt)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                  View Document
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specializations */}
      {transformedApplication.specializations && transformedApplication.specializations.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transformedApplication.specializations.map((spec: any) => (
              <div key={spec.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{spec.name}</p>
                {spec.description && (
                  <p className="text-sm text-gray-600 mt-1">{spec.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">{spec.yearsOfExperience || 0} years experience</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Information */}
      {(transformedApplication.reviewNotes || transformedApplication.rejectionReason) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
          {transformedApplication.reviewNotes && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500">Review Notes</div>
              <p className="text-gray-900 mt-1">{transformedApplication.reviewNotes}</p>
            </div>
          )}
          {transformedApplication.rejectionReason && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500">Rejection Reason</div>
              <p className="text-gray-900 mt-1">{transformedApplication.rejectionReason}</p>
            </div>
          )}
          {transformedApplication.rejectionFeedback && (
            <div>
              <div className="text-sm font-medium text-gray-500">Rejection Feedback</div>
              <p className="text-gray-900 mt-1">{transformedApplication.rejectionFeedback}</p>
            </div>
          )}
          {transformedApplication.reviewedAt && (
            <div className="mt-4 text-sm text-gray-500">
              Reviewed on {formatDate(transformedApplication.reviewedAt)}
              {transformedApplication.reviewerName && ` by ${transformedApplication.reviewerName}`}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      label: 'Pending Review' 
    },
    approved: { 
      className: 'bg-green-100 text-green-800 border-green-200', 
      label: 'Approved' 
    },
    rejected: { 
      className: 'bg-red-100 text-red-800 border-red-200', 
      label: 'Rejected' 
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}