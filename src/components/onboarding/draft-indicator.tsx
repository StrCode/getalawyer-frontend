import { useDraftIndicator } from '@/hooks/use-draft-manager';
import { cn } from '@/lib/utils';
import { type OnboardingStep } from '@/stores/enhanced-onboarding-store';

interface DraftIndicatorProps {
  stepId: OnboardingStep;
  className?: string;
  showIcon?: boolean;
  showMessage?: boolean;
  compact?: boolean;
}

/**
 * Component for displaying draft status and unsaved changes indicators
 */
export function DraftIndicator({ 
  stepId, 
  className,
  showIcon = true,
  showMessage = true,
  compact = false
}: DraftIndicatorProps) {
  const { status, message, color, isDraftAvailable, hasUnsavedChanges } = useDraftIndicator(stepId);

  // Don't show indicator if there's nothing to indicate
  if (status === 'clean' && !isDraftAvailable && !hasUnsavedChanges) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Error">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Offline">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clipRule="evenodd" />
          </svg>
        );
      case 'unsaved':
        return (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        );
      case 'draft':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Draft saved">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs",
        color,
        className
      )}>
        {showIcon && getStatusIcon()}
        {showMessage && (
          <span className="truncate">{message}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 text-xs rounded-md border",
      "bg-gray-50 border-gray-200",
      color,
      className
    )}>
      {showIcon && getStatusIcon()}
      {showMessage && (
        <span>{message}</span>
      )}
    </div>
  );
}

/**
 * Compact version of the draft indicator for use in form headers
 */
export function CompactDraftIndicator({ 
  stepId, 
  className 
}: { 
  stepId: OnboardingStep; 
  className?: string; 
}) {
  return (
    <DraftIndicator 
      stepId={stepId} 
      className={className}
      compact={true}
      showIcon={true}
      showMessage={true}
    />
  );
}

/**
 * Icon-only draft indicator for minimal space usage
 */
export function IconDraftIndicator({ 
  stepId, 
  className 
}: { 
  stepId: OnboardingStep; 
  className?: string; 
}) {
  return (
    <DraftIndicator 
      stepId={stepId} 
      className={className}
      compact={true}
      showIcon={true}
      showMessage={false}
    />
  );
}

/**
 * Global draft status indicator that shows status across all steps
 */
export function GlobalDraftIndicator({ className }: { className?: string }) {
  const practiceInfoStatus = useDraftIndicator('practice_info');
  const documentsStatus = useDraftIndicator('documents');
  const specializationsStatus = useDraftIndicator('specializations');
  
  const stepStatuses = [
    { step: 'practice_info' as const, ...practiceInfoStatus },
    { step: 'documents' as const, ...documentsStatus },
    { step: 'specializations' as const, ...specializationsStatus }
  ];

  // Determine overall status
  const hasAnyUnsaved = stepStatuses.some(s => s.hasUnsavedChanges);
  const hasAnyDrafts = stepStatuses.some(s => s.isDraftAvailable);
  const hasAnySaving = stepStatuses.some(s => s.status === 'saving');
  const hasAnyErrors = stepStatuses.some(s => s.status === 'error');
  const hasAnyOffline = stepStatuses.some(s => s.status === 'offline');

  let globalStatus: string;
  let globalMessage: string;
  let globalColor: string;

  if (hasAnySaving) {
    globalStatus = 'saving';
    globalMessage = 'Saving changes...';
    globalColor = 'text-blue-600';
  } else if (hasAnyErrors) {
    globalStatus = 'error';
    globalMessage = 'Some changes failed to save';
    globalColor = 'text-red-600';
  } else if (hasAnyOffline) {
    globalStatus = 'offline';
    globalMessage = 'Working offline';
    globalColor = 'text-amber-600';
  } else if (hasAnyUnsaved) {
    globalStatus = 'unsaved';
    globalMessage = 'You have unsaved changes';
    globalColor = 'text-orange-600';
  } else if (hasAnyDrafts) {
    globalStatus = 'draft';
    globalMessage = 'All changes saved';
    globalColor = 'text-green-600';
  } else {
    return null; // Nothing to show
  }

  const getGlobalIcon = () => {
    switch (globalStatus) {
      case 'saving':
        return (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Error">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Offline">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 11a1 1 0 100 2h8a1 1 0 100-2H4z" />
          </svg>
        );
      case 'unsaved':
        return (
          <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
        );
      case 'draft':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Draft saved">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border",
      "bg-white border-gray-200 shadow-sm",
      globalColor,
      className
    )}>
      {getGlobalIcon()}
      <span>{globalMessage}</span>
    </div>
  );
}