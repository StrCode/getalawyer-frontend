import { useCallback, useEffect, useRef, useState } from 'react';
import { type OnboardingStep, useEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';
import { useNetworkStatus, useOnlineDetection } from './use-network-status';
import { useQueuedSave } from './use-offline-queue';

export interface DraftSyncOptions {
  syncOnStepCompletion?: boolean;
  syncOnConnectivity?: boolean;
  clearDraftOnSync?: boolean;
}

export interface DraftSyncStatus {
  isSyncing: boolean;
  lastSyncAttempt: Date | null;
  lastSuccessfulSync: Date | null;
  syncError: string | null;
  pendingSyncCount: number;
  hasPendingChanges: boolean;
}

export interface DraftSyncReturn {
  syncStatus: DraftSyncStatus;
  syncNow: (stepId?: OnboardingStep) => Promise<void>;
  syncAllSteps: () => Promise<void>;
  clearSyncError: () => void;
  retryFailedSyncs: () => Promise<void>;
  markStepCompleted: (stepId: OnboardingStep) => Promise<void>;
}

/**
 * Hook for managing draft synchronization with backend and cleanup logic
 */
export function useDraftSync(options: DraftSyncOptions = {}): DraftSyncReturn {
  const {
    syncOnStepCompletion = true,
    syncOnConnectivity = true,
    clearDraftOnSync = true
  } = options;

  const store = useEnhancedOnboardingStore();
  const { isOnline } = useNetworkStatus();
  const { queueSave, hasPendingSaves, isProcessingSaves } = useQueuedSave();

  const [syncStatus, setSyncStatus] = useState<DraftSyncStatus>({
    isSyncing: false,
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
    syncError: null,
    pendingSyncCount: 0,
    hasPendingChanges: false
  });

  const syncInProgressRef = useRef(false);
  const failedSyncsRef = useRef<Set<OnboardingStep>>(new Set());

  // Update sync status based on store state
  useEffect(() => {
    setSyncStatus(prev => ({
      ...prev,
      hasPendingChanges: store.hasUnsavedChanges,
      isSyncing: isProcessingSaves || syncInProgressRef.current,
      pendingSyncCount: hasPendingSaves ? 1 : 0 // Simplified count
    }));
  }, [store.hasUnsavedChanges, isProcessingSaves, hasPendingSaves]);

  // Get current form data for a step
  const getCurrentStepData = useCallback((stepId: OnboardingStep) => {
    switch (stepId) {
      case 'practice_info':
        return store.practiceInfo;
      case 'documents':
        return store.documents;
      case 'specializations':
        return store.specializations;
      case 'review':
        return {
          practiceInfo: store.practiceInfo,
          documents: store.documents,
          specializations: store.specializations
        };
      default:
        return null;
    }
  }, [store]);

  // Sync a specific step with backend
  const syncStep = useCallback(async (stepId: OnboardingStep): Promise<void> => {
    if (!isOnline || syncInProgressRef.current) {
      return;
    }

    const stepData = getCurrentStepData(stepId);
    if (!stepData) {
      return;
    }

    // Check if there's a draft to sync
    const draftData = store.restoreDraft(stepId);
    const dataToSync = draftData || stepData;

    setSyncStatus(prev => ({
      ...prev,
      lastSyncAttempt: new Date()
    }));

    try {
      // Create the sync operation
      const syncOperation = async () => {
        // Simulate API call - replace with actual API integration
        console.log(`Syncing step ${stepId}:`, dataToSync);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate potential failure (5% chance)
        if (Math.random() < 0.05) {
          throw new Error(`Failed to sync ${stepId} data`);
        }
        
        return { success: true, stepId, data: dataToSync };
      };

      // Queue the sync operation
      await queueSave(
        syncOperation,
        dataToSync,
        `Sync ${stepId} data`,
        {
          onSuccess: (_result) => {
            setSyncStatus(prev => ({
              ...prev,
              lastSuccessfulSync: new Date(),
              syncError: null
            }));
            
            // Clear draft after successful sync if enabled
            if (clearDraftOnSync) {
              store.clearDraft(stepId);
            }
            
            // Remove from failed syncs
            failedSyncsRef.current.delete(stepId);
            
            // Update last saved timestamp
            store.updateLastSaved();
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Sync failed';
            setSyncStatus(prev => ({
              ...prev,
              syncError: errorMessage
            }));
            
            // Add to failed syncs for retry
            failedSyncsRef.current.add(stepId);
          }
        }
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setSyncStatus(prev => ({
        ...prev,
        syncError: errorMessage
      }));
      
      failedSyncsRef.current.add(stepId);
    }
  }, [isOnline, getCurrentStepData, store, queueSave, clearDraftOnSync]);

  // Sync all steps that have drafts or unsaved changes
  const syncAllSteps = useCallback(async (): Promise<void> => {
    if (!isOnline || syncInProgressRef.current) {
      return;
    }

    syncInProgressRef.current = true;
    
    try {
      const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations'];
      
      for (const stepId of steps) {
        const draftData = store.restoreDraft(stepId);
        if (draftData) {
          await syncStep(stepId);
        }
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isOnline, store, syncStep]);

  // Manual sync trigger
  const syncNow = useCallback(async (stepId?: OnboardingStep): Promise<void> => {
    if (stepId) {
      await syncStep(stepId);
    } else {
      await syncAllSteps();
    }
  }, [syncStep, syncAllSteps]);

  // Mark step as completed and sync
  const markStepCompleted = useCallback(async (stepId: OnboardingStep): Promise<void> => {
    // Mark step as completed in store
    store.markStepCompleted(stepId);
    
    // Sync if enabled
    if (syncOnStepCompletion && isOnline) {
      await syncStep(stepId);
    }
    
    // Clear draft after completion
    store.clearDraft(stepId);
  }, [store, syncOnStepCompletion, isOnline, syncStep]);

  // Retry failed syncs
  const retryFailedSyncs = useCallback(async (): Promise<void> => {
    if (!isOnline || failedSyncsRef.current.size === 0) {
      return;
    }

    const failedSteps = Array.from(failedSyncsRef.current);
    failedSyncsRef.current.clear();
    
    for (const stepId of failedSteps) {
      await syncStep(stepId);
    }
  }, [isOnline, syncStep]);

  // Clear sync error
  const clearSyncError = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      syncError: null
    }));
  }, []);

  // Auto-sync when coming back online
  useOnlineDetection(async () => {
    if (syncOnConnectivity) {
      // Retry failed syncs first
      if (failedSyncsRef.current.size > 0) {
        await retryFailedSyncs();
      }
      
      // Sync any pending changes
      if (store.hasUnsavedChanges) {
        await syncAllSteps();
      }
    }
  });

  // Periodic cleanup of old drafts (every 5 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Clean up drafts for completed steps
      const completedSteps = store.completedSteps;
      completedSteps.forEach(stepId => {
        const draftData = store.restoreDraft(stepId);
        if (draftData && clearDraftOnSync) {
          // Only clear if the step was completed more than 5 minutes ago
          // This prevents accidental data loss
          const stepCompletionTime = store.lastSaved;
          if (stepCompletionTime && Date.now() - stepCompletionTime.getTime() > 5 * 60 * 1000) {
            store.clearDraft(stepId);
          }
        }
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [store, clearDraftOnSync]);

  return {
    syncStatus,
    syncNow,
    syncAllSteps,
    clearSyncError,
    retryFailedSyncs,
    markStepCompleted,
  };
}

/**
 * Hook for step completion with automatic draft cleanup
 */
export function useStepCompletion() {
  const { markStepCompleted, syncStatus } = useDraftSync();
  const store = useEnhancedOnboardingStore();

  const completeStep = useCallback(async (stepId: OnboardingStep): Promise<boolean> => {
    try {
      // Validate step before completion
      const validation = store.validateStep(stepId);
      if (!validation.isValid) {
        console.warn(`Cannot complete step ${stepId}: validation failed`, validation.errors);
        return false;
      }

      // Mark as completed and sync
      await markStepCompleted(stepId);
      return true;
    } catch (error) {
      console.error(`Failed to complete step ${stepId}:`, error);
      return false;
    }
  }, [markStepCompleted, store]);

  const canCompleteStep = useCallback((stepId: OnboardingStep): boolean => {
    const validation = store.validateStep(stepId);
    return validation.isValid;
  }, [store]);

  return {
    completeStep,
    canCompleteStep,
    isCompleting: syncStatus.isSyncing,
    completionError: syncStatus.syncError,
  };
}

/**
 * Hook for monitoring draft cleanup status
 */
export function useDraftCleanupStatus() {
  const store = useEnhancedOnboardingStore();
  const [cleanupStatus, setCleanupStatus] = useState({
    totalDrafts: 0,
    staledrafts: 0,
    lastCleanup: null as Date | null,
  });

  useEffect(() => {
    const updateStatus = () => {
      const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations', 'review'];
      let totalDrafts = 0;
      let staledrafts = 0;

      steps.forEach(stepId => {
        const draftData = store.restoreDraft(stepId);
        if (draftData) {
          totalDrafts++;
          
          // Check if step is completed (making draft stale)
          if (store.completedSteps.includes(stepId)) {
            staledrafts++;
          }
        }
      });

      setCleanupStatus(prev => ({
        ...prev,
        totalDrafts,
        staledrafts,
      }));
    };

    updateStatus();
    
    // Update every minute
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [store]);

  const cleanupStaleDrafts = useCallback(() => {
    const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations', 'review'];
    let cleaned = 0;

    steps.forEach(stepId => {
      if (store.completedSteps.includes(stepId)) {
        const draftData = store.restoreDraft(stepId);
        if (draftData) {
          store.clearDraft(stepId);
          cleaned++;
        }
      }
    });

    setCleanupStatus(prev => ({
      ...prev,
      lastCleanup: new Date(),
      staledrafts: 0,
    }));

    return cleaned;
  }, [store]);

  return {
    ...cleanupStatus,
    cleanupStaleDrafts,
    hasStaleData: cleanupStatus.staledrafts > 0,
  };
}