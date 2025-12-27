"use client";

import { 
  AlertCircleIcon, 
  Cancel01Icon, 
  ClockIcon, 
  FileIcon,
  RefreshIcon,
  Tick01Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { type ApplicationStatus as ApiApplicationStatus, api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { type ApplicationStatus, useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

// Map API status to store status
const mapApiStatusToStoreStatus = (apiStatus: ApiApplicationStatus): ApplicationStatus => {
  switch (apiStatus) {
    case 'pending':
      return 'submitted';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return 'submitted';
  }
};

interface ApplicationStatusTrackerProps {
  className?: string;
  variant?: 'default' | 'compact' | 'dashboard';
  showActions?: boolean;
  onStatusChange?: (status: ApplicationStatus) => void;
}

interface StatusStep {
  id: ApplicationStatus;
  title: string;
  description: string;
  icon: unknown; // Icon data from @hugeicons/core-free-icons
  color: string;
  bgColor: string;
}

const STATUS_STEPS: Array<StatusStep> = [
  {
    id: 'draft',
    title: 'Draft',
    description: 'Application in progress',
    icon: FileIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    description: 'Completing application',
    icon: ClockIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'submitted',
    title: 'Submitted',
    description: 'Application submitted for review',
    icon: Tick01Icon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'under_review',
    title: 'Under Review',
    description: 'Being reviewed by our team',
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'approved',
    title: 'Approved',
    description: 'Application approved - welcome!',
    icon: Tick01Icon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'rejected',
    title: 'Rejected',
    description: 'Application needs revision',
    icon: Cancel01Icon,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
];

export function ApplicationStatusTracker({
  className,
  variant = 'default',
  showActions = true,
  onStatusChange
}: ApplicationStatusTrackerProps) {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Store state
  const {
    applicationStatus,
    submissionDate,
    referenceNumber,
    setApplicationStatus
  } = useEnhancedOnboardingStore();

  // Fetch current application status
  const { 
    data: statusData,
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.lawyer.getOnboardingStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Handle status data changes
  useEffect(() => {
    if (statusData?.lawyer) {
      const apiStatus = statusData.lawyer.applicationStatus;
      const newStatus = mapApiStatusToStoreStatus(apiStatus);
      if (newStatus !== applicationStatus) {
        setApplicationStatus(newStatus);
        onStatusChange?.(newStatus);
        
        // Show notification for status changes
        if (applicationStatus && newStatus !== applicationStatus) {
          const statusStep = STATUS_STEPS.find(step => step.id === newStatus);
          toastManager.add({
            title: "Application Status Updated",
            description: `Your application is now ${statusStep?.title.toLowerCase()}`,
            type: newStatus === 'approved' ? 'success' : 
                  newStatus === 'rejected' ? 'error' : 'info',
          });
        }
      }
      setLastUpdated(new Date());
    }
  }, [statusData, applicationStatus, setApplicationStatus, onStatusChange]);

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () => api.lawyer.getOnboardingStatus(),
    onSuccess: (data) => {
      queryClient.setQueryData(['onboarding-status'], data);
      setLastUpdated(new Date());
      toastManager.add({
        title: "Status refreshed",
        description: "Application status has been updated",
        type: "success",
      });
    },
    onError: (error: Error) => {
      toastManager.add({
        title: "Refresh failed",
        description: error.message || "Failed to refresh status",
        type: "error",
      });
    }
  });

  // Resubmission mutation for rejected applications
  const resubmitMutation = useMutation({
    mutationFn: () => {
      // This would typically reset the application status and allow re-editing
      // For now, we'll just update the status to in_progress
      setApplicationStatus('in_progress');
      return Promise.resolve();
    },
    onSuccess: () => {
      toastManager.add({
        title: "Application reopened",
        description: "You can now edit and resubmit your application",
        type: "success",
      });
    }
  });

  // Get current status step
  const currentStatusStep = STATUS_STEPS.find(step => step.id === applicationStatus);
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.id === applicationStatus);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    switch (applicationStatus) {
      case 'draft': return 10;
      case 'in_progress': return 25;
      case 'submitted': return 50;
      case 'under_review': return 75;
      case 'approved': return 100;
      case 'rejected': return 40; // Partial progress, needs resubmission
      default: return 0;
    }
  };

  // Get estimated timeline
  const getEstimatedTimeline = () => {
    switch (applicationStatus) {
      case 'submitted':
      case 'under_review':
        return "2-3 business days";
      case 'approved':
      case 'rejected':
        return "Complete";
      default:
        return "Pending submission";
    }
  };

  if (isLoading && variant !== 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Loading application status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && variant !== 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
            <AlertDescription>
              Failed to load application status. Please try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Compact variant for dashboard
  if (variant === 'compact') {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              currentStatusStep?.bgColor
            )}>
              <HugeiconsIcon 
                icon={currentStatusStep?.icon || ClockIcon} 
                className={cn("w-5 h-5", currentStatusStep?.color)} 
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{currentStatusStep?.title}</p>
              <p className="text-sm text-muted-foreground">
                {currentStatusStep?.description}
              </p>
            </div>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={refreshMutation.isPending}
              >
                <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dashboard variant
  if (variant === 'dashboard') {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Track your lawyer application progress
              </CardDescription>
            </div>
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              currentStatusStep?.bgColor
            )}>
              <HugeiconsIcon 
                icon={currentStatusStep?.icon || ClockIcon} 
                className={cn("w-6 h-6", currentStatusStep?.color)} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentStatusStep?.title}</h3>
              <p className="text-muted-foreground">{currentStatusStep?.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Application Details */}
          {(referenceNumber || submissionDate) && (
            <div className="space-y-2">
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {referenceNumber && (
                  <div>
                    <div className="font-medium text-muted-foreground">Reference Number</div>
                    <p className="font-mono">{referenceNumber}</p>
                  </div>
                )}
                {submissionDate && (
                  <div>
                    <div className="font-medium text-muted-foreground">Submitted</div>
                    <p>{new Date(submissionDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimated Timeline */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={ClockIcon} className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estimated Timeline:</span>
              <span className="text-sm">{getEstimatedTimeline()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && applicationStatus === 'rejected' && (
            <Button
              onClick={() => resubmitMutation.mutate()}
              disabled={resubmitMutation.isPending}
              className="w-full"
            >
              Resubmit Application
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - full status tracker
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Track your lawyer application progress
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdated && lastUpdated instanceof Date && !Number.isNaN(lastUpdated.getTime()) ? lastUpdated.toLocaleTimeString() : 'Unknown'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="space-y-4">
          {STATUS_STEPS.filter(step => step.id !== 'draft').map((step, _index) => {
            const isCompleted = currentStepIndex > STATUS_STEPS.findIndex(s => s.id === step.id);
            const isCurrent = step.id === applicationStatus;
            const isRejected = applicationStatus === 'rejected' && step.id === 'rejected';
            
            return (
              <div key={step.id} className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  isCompleted && "bg-green-100 border-green-500",
                  isCurrent && !isRejected && "bg-blue-100 border-blue-500",
                  isRejected && "bg-red-100 border-red-500",
                  !isCompleted && !isCurrent && !isRejected && "bg-gray-100 border-gray-300"
                )}>
                  <HugeiconsIcon 
                    icon={step.icon} 
                    className={cn(
                      "w-5 h-5",
                      isCompleted && "text-green-600",
                      isCurrent && !isRejected && "text-blue-600",
                      isRejected && "text-red-600",
                      !isCompleted && !isCurrent && !isRejected && "text-gray-400"
                    )} 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      isCompleted && "text-green-700",
                      isCurrent && !isRejected && "text-blue-700",
                      isRejected && "text-red-700",
                      !isCompleted && !isCurrent && !isRejected && "text-gray-500"
                    )}>
                      {step.title}
                    </h4>
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Complete
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant={isRejected ? "destructive" : "default"}>
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm",
                    isCompleted && "text-green-600",
                    isCurrent && !isRejected && "text-blue-600",
                    isRejected && "text-red-600",
                    !isCompleted && !isCurrent && !isRejected && "text-gray-500"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Application Details */}
        {(referenceNumber || submissionDate) && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceNumber && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reference Number</div>
                  <p className="font-mono text-lg">{referenceNumber}</p>
                </div>
              )}
              {submissionDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Submission Date</div>
                  <p className="text-lg">{new Date(submissionDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Status-specific Messages */}
        {applicationStatus === 'submitted' && (
          <Alert className="border-blue-200 bg-blue-50">
            <HugeiconsIcon icon={ClockIcon} className="w-4 h-4" />
            <AlertDescription>
              Your application has been submitted and is in the review queue. 
              You'll receive an email notification once the review is complete.
            </AlertDescription>
          </Alert>
        )}

        {applicationStatus === 'under_review' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <HugeiconsIcon icon={ClockIcon} className="w-4 h-4" />
            <AlertDescription>
              Our team is currently reviewing your application. 
              This process typically takes 2-3 business days.
            </AlertDescription>
          </Alert>
        )}

        {applicationStatus === 'approved' && (
          <Alert className="border-green-200 bg-green-50">
            <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
            <AlertDescription>
              Congratulations! Your application has been approved. 
              You can now access your lawyer dashboard and start receiving client requests.
            </AlertDescription>
          </Alert>
        )}

        {applicationStatus === 'rejected' && (
          <Alert className="border-red-200 bg-red-50">
            <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
            <AlertDescription>
              Your application needs some revisions before it can be approved. 
              Please review the feedback and resubmit your application.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {showActions && applicationStatus === 'rejected' && (
          <div className="flex gap-3">
            <Button
              onClick={() => resubmitMutation.mutate()}
              disabled={resubmitMutation.isPending}
              className="flex-1"
            >
              Edit & Resubmit Application
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for application status utilities
export function useApplicationStatus() {
  const {
    applicationStatus,
    submissionDate,
    referenceNumber,
    setApplicationStatus
  } = useEnhancedOnboardingStore();

  const getStatusInfo = () => {
    const statusStep = STATUS_STEPS.find(step => step.id === applicationStatus);
    return {
      status: applicationStatus,
      title: statusStep?.title || 'Unknown',
      description: statusStep?.description || 'Status unknown',
      icon: statusStep?.icon || ClockIcon,
      color: statusStep?.color || 'text-gray-600',
      bgColor: statusStep?.bgColor || 'bg-gray-100'
    };
  };

  const canResubmit = () => {
    return applicationStatus === 'rejected';
  };

  const isComplete = () => {
    return applicationStatus === 'approved';
  };

  const isPending = () => {
    return ['submitted', 'under_review'].includes(applicationStatus);
  };

  return {
    applicationStatus,
    submissionDate,
    referenceNumber,
    setApplicationStatus,
    getStatusInfo,
    canResubmit,
    isComplete,
    isPending
  };
}