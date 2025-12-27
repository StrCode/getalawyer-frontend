import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDraftManager } from '@/hooks/use-draft-manager';
import { useDraftCleanupStatus, useDraftSync } from '@/hooks/use-draft-sync';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';
import { type OnboardingStep } from '@/stores/enhanced-onboarding-store';

interface DraftManagerProps {
  stepId?: OnboardingStep;
  className?: string;
  showCleanupControls?: boolean;
  showSyncControls?: boolean;
}

/**
 * Comprehensive draft management component with sync and cleanup controls
 */
export function DraftManager({ 
  stepId, 
  className,
  showCleanupControls = true,
  showSyncControls = true
}: DraftManagerProps) {
  const { isOnline } = useNetworkStatus();
  const { syncStatus, syncNow, syncAllSteps, clearSyncError, retryFailedSyncs } = useDraftSync();
  const { totalDrafts, staledrafts, cleanupStaleDrafts, hasStaleData } = useDraftCleanupStatus();
  
  const [isOperating, setIsOperating] = useState(false);

  const handleSyncNow = async () => {
    setIsOperating(true);
    try {
      if (stepId) {
        await syncNow(stepId);
      } else {
        await syncAllSteps();
      }
    } finally {
      setIsOperating(false);
    }
  };

  const handleRetrySync = async () => {
    setIsOperating(true);
    try {
      await retryFailedSyncs();
    } finally {
      setIsOperating(false);
    }
  };

  const handleCleanupStale = () => {
    const cleaned = cleanupStaleDrafts();
    console.log(`Cleaned up ${cleaned} stale drafts`);
  };

  const getSyncStatusBadge = () => {
    if (syncStatus.isSyncing || isOperating) {
      return <Badge variant="secondary" className="animate-pulse">Syncing...</Badge>;
    }
    
    if (syncStatus.syncError) {
      return <Badge variant="destructive">Sync Error</Badge>;
    }
    
    if (!isOnline) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Offline</Badge>;
    }
    
    if (syncStatus.hasPendingChanges) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending Sync</Badge>;
    }
    
    if (syncStatus.lastSuccessfulSync) {
      return <Badge variant="outline" className="text-green-600 border-green-600">Synced</Badge>;
    }
    
    return <Badge variant="outline">Ready</Badge>;
  };

  const getLastSyncTime = () => {
    if (syncStatus.lastSuccessfulSync) {
      return syncStatus.lastSuccessfulSync.toLocaleString();
    }
    return 'Never';
  };

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Draft Management</h3>
        {getSyncStatusBadge()}
      </div>

      {/* Sync Status Information */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Network Status:</span>
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Last Sync:</span>
          <span>{getLastSyncTime()}</span>
        </div>
        
        {syncStatus.pendingSyncCount > 0 && (
          <div className="flex justify-between">
            <span>Pending Operations:</span>
            <span className="text-orange-600">{syncStatus.pendingSyncCount}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Total Drafts:</span>
          <span>{totalDrafts}</span>
        </div>
        
        {hasStaleData && (
          <div className="flex justify-between">
            <span>Stale Drafts:</span>
            <span className="text-amber-600">{staledrafts}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {syncStatus.syncError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Sync Error</p>
              <p className="text-sm text-red-600 mt-1">{syncStatus.syncError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSyncError}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Sync Controls */}
      {showSyncControls && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncNow}
              disabled={!isOnline || syncStatus.isSyncing || isOperating}
              className="flex-1"
            >
              {syncStatus.isSyncing || isOperating ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                `Sync ${stepId ? 'Step' : 'All'}`
              )}
            </Button>
            
            {syncStatus.syncError && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetrySync}
                disabled={!isOnline || syncStatus.isSyncing || isOperating}
              >
                Retry
              </Button>
            )}
          </div>
          
          {!isOnline && syncStatus.hasPendingChanges && (
            <p className="text-xs text-amber-600">
              Changes will sync automatically when connection is restored
            </p>
          )}
        </div>
      )}

      {/* Cleanup Controls */}
      {showCleanupControls && hasStaleData && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cleanup Stale Drafts</p>
              <p className="text-xs text-gray-500">
                Remove drafts for completed steps
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupStale}
              disabled={isOperating}
            >
              Clean Up
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Step-specific draft manager for individual steps
 */
export function StepDraftManager({ 
  stepId, 
  className 
}: { 
  stepId: OnboardingStep; 
  className?: string; 
}) {
  const { 
    hasUnsavedChanges, 
    isDraftAvailable, 
    lastSaved, 
    clearDraft,
    autoSaveStatus 
  } = useDraftManager({ stepId });
  
  const { syncNow, syncStatus } = useDraftSync();
  const [isOperating, setIsOperating] = useState(false);

  const handleSyncStep = async () => {
    setIsOperating(true);
    try {
      await syncNow(stepId);
    } finally {
      setIsOperating(false);
    }
  };

  const handleClearDraft = () => {
    clearDraft();
  };

  if (!isDraftAvailable && !hasUnsavedChanges) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm",
      className
    )}>
      <div className="flex-1">
        {autoSaveStatus === 'saving' && (
          <span className="text-blue-600">Saving draft...</span>
        )}
        {autoSaveStatus === 'saved' && (
          <span className="text-green-600">Draft saved</span>
        )}
        {autoSaveStatus === 'error' && (
          <span className="text-red-600">Save failed</span>
        )}
        {autoSaveStatus === 'idle' && hasUnsavedChanges && (
          <span className="text-orange-600">Unsaved changes</span>
        )}
        {autoSaveStatus === 'idle' && !hasUnsavedChanges && isDraftAvailable && (
          <span className="text-gray-600">
            Draft saved {lastSaved && lastSaved instanceof Date && !isNaN(lastSaved.getTime()) ? `at ${lastSaved.toLocaleTimeString()}` : ''}
          </span>
        )}
      </div>
      
      <div className="flex gap-1">
        {hasUnsavedChanges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncStep}
            disabled={syncStatus.isSyncing || isOperating}
            className="h-6 px-2 text-xs"
          >
            {syncStatus.isSyncing || isOperating ? 'Syncing...' : 'Sync'}
          </Button>
        )}
        
        {isDraftAvailable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDraft}
            disabled={isOperating}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact draft status indicator for form headers
 */
export function DraftStatusBadge({ 
  stepId, 
  className 
}: { 
  stepId: OnboardingStep; 
  className?: string; 
}) {
  const { hasUnsavedChanges, isDraftAvailable, autoSaveStatus } = useDraftManager({ stepId });
  const { isOnline } = useNetworkStatus();

  if (!isDraftAvailable && !hasUnsavedChanges) {
    return null;
  }

  const getBadgeContent = () => {
    if (autoSaveStatus === 'saving') {
      return { text: 'Saving...', variant: 'secondary' as const, animate: true };
    }
    
    if (autoSaveStatus === 'error') {
      return { text: 'Save Error', variant: 'destructive' as const, animate: false };
    }
    
    if (!isOnline && hasUnsavedChanges) {
      return { text: 'Offline', variant: 'outline' as const, animate: false };
    }
    
    if (hasUnsavedChanges) {
      return { text: 'Unsaved', variant: 'outline' as const, animate: true };
    }
    
    if (isDraftAvailable) {
      return { text: 'Draft', variant: 'outline' as const, animate: false };
    }
    
    return null;
  };

  const badgeContent = getBadgeContent();
  if (!badgeContent) return null;

  return (
    <Badge 
      variant={badgeContent.variant}
      className={cn(
        badgeContent.animate && 'animate-pulse',
        className
      )}
    >
      {badgeContent.text}
    </Badge>
  );
}