import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  type OnboardingStep, 
  useEnhancedOnboardingStore 
} from '@/stores/enhanced-onboarding-store';
import { useNetworkStatus, useOnlineDetection } from './use-network-status';
import { useQueuedSave } from './use-offline-queue';

/**
 * Offline form state
 */
export interface OfflineFormState {
  isOffline: boolean;
  hasUnsyncedChanges: boolean;
  lastSyncAttempt: Date | null;
  lastSuccessfulSync: Date | null;
  syncInProgress: boolean;
  syncError: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  pendingSaveCount: number;
}

/**
 * Form sync status
 */
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

/**
 * Hook for offline-capable form management
 */
export function useOfflineForm(step: OnboardingStep) {
  const store = useEnhancedOnboardingStore();
  const { isOnline, isOffline } = useNetworkStatus();
  const { queueSave, hasPendingSaves, isProcessingSaves } = useQueuedSave();
  
  const [offlineState, setOfflineState] = useState<OfflineFormState>({
    isOffline,
    hasUnsyncedChanges: false,
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
    syncInProgress: false,
    syncError: null,
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    pendingSaveCount: 0
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormDataRef = useRef<any>(null);
  const syncInProgressRef = useRef(false);

  // Update offline status
  useEffect(() => {
    setOfflineState(prev => ({
      ...prev,
      isOffline,
      pendingSaveCount: hasPendingSaves ? 1 : 0 // Simplified count
    }));
  }, [isOffline, hasPendingSaves]);

  // Get current form data for the step
  const getCurrentFormData = useCallback(() => {
    switch (step) {
      case 'practice_info':
        return store.practiceInfo;
      case 'documents':
        return store.documents;
      case 'specializations':
        return store.specializations;
      default:
        return {};
    }
  }, [step, store]);

  // Save form data locally (draft)
  const saveLocally = useCallback((data: any) => {
    store.saveDraft(step, data);
    store.updateLastSaved();
    
    setOfflineState(prev => ({
      ...prev,
      hasUnsyncedChanges: isOffline,
      lastSuccessfulSync: isOnline ? new Date() : prev.lastSuccessfulSync
    }));
  }, [step, store, isOffline, isOnline]);

  // Queue save operation for when online
  const queueSaveOperation = useCallback((data: any) => {
    const saveOperation = async () => {
      // This would be replaced with actual API call
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Syncing form data:', data);
          resolve(data);
        }, 1000);
      });
    };

    return queueSave(
      saveOperation,
      data,
      `Save ${step} form data`,
      {
        onSuccess: (result) => {
          setOfflineState(prev => ({
            ...prev,
            hasUnsyncedChanges: false,
            lastSuccessfulSync: new Date(),
            syncError: null
          }));
          
          // Clear draft after successful sync
          store.clearDraft(step);
        },
        onError: (error) => {
          setOfflineState(prev => ({
            ...prev,
            syncError: error instanceof Error ? error.message : 'Sync failed',
            lastSyncAttempt: new Date()
          }));
        }
      }
    );
  }, [queueSave, step, store]);

  // Save form data (local + queue for sync)
  const saveFormData = useCallback((data: any, immediate = false) => {
    // Always save locally first
    saveLocally(data);
    
    // Queue for sync if offline or immediate sync if online
    if (isOffline || immediate) {
      queueSaveOperation(data);
      setOfflineState(prev => ({
        ...prev,
        hasUnsyncedChanges: true,
        lastSyncAttempt: new Date()
      }));
    }
  }, [saveLocally, queueSaveOperation, isOffline]);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!offlineState.autoSaveEnabled) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentData = getCurrentFormData();
      
      // Only save if data has changed
      if (JSON.stringify(currentData) !== JSON.stringify(lastFormDataRef.current)) {
        saveFormData(currentData);
        lastFormDataRef.current = currentData;
      }
    }, offlineState.autoSaveInterval);
  }, [offlineState.autoSaveEnabled, offlineState.autoSaveInterval, getCurrentFormData, saveFormData]);

  // Trigger auto-save when form data changes
  useEffect(() => {
    const currentData = getCurrentFormData();
    
    if (JSON.stringify(currentData) !== JSON.stringify(lastFormDataRef.current)) {
      scheduleAutoSave();
    }
  }, [getCurrentFormData, scheduleAutoSave]);

  // Sync when coming back online
  useOnlineDetection(() => {
    if (offlineState.hasUnsyncedChanges && !syncInProgressRef.current) {
      const currentData = getCurrentFormData();
      queueSaveOperation(currentData);
    }
  });

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    if (syncInProgressRef.current || isOffline) return;

    syncInProgressRef.current = true;
    setOfflineState(prev => ({
      ...prev,
      syncInProgress: true,
      lastSyncAttempt: new Date()
    }));

    try {
      const currentData = getCurrentFormData();
      await queueSaveOperation(currentData);
    } finally {
      syncInProgressRef.current = false;
      setOfflineState(prev => ({
        ...prev,
        syncInProgress: false
      }));
    }
  }, [isOffline, getCurrentFormData, queueSaveOperation]);

  // Get sync status
  const getSyncStatus = useCallback((): SyncStatus => {
    if (isOffline) return 'offline';
    if (offlineState.syncInProgress || isProcessingSaves) return 'syncing';
    if (offlineState.syncError) return 'error';
    if (offlineState.hasUnsyncedChanges || hasPendingSaves) return 'pending';
    return 'synced';
  }, [isOffline, offlineState.syncInProgress, offlineState.syncError, offlineState.hasUnsyncedChanges, isProcessingSaves, hasPendingSaves]);

  // Restore draft data
  const restoreDraft = useCallback(() => {
    const draftData = store.restoreDraft(step);
    if (draftData) {
      // Update store with draft data
      switch (step) {
        case 'practice_info':
          store.updatePracticeInfo(draftData);
          break;
        case 'documents':
          // Handle document restoration
          break;
        case 'specializations':
          // Handle specialization restoration
          break;
      }
      
      setOfflineState(prev => ({
        ...prev,
        hasUnsyncedChanges: true
      }));
    }
    return draftData;
  }, [store, step]);

  // Toggle auto-save
  const toggleAutoSave = useCallback((enabled: boolean) => {
    setOfflineState(prev => ({
      ...prev,
      autoSaveEnabled: enabled
    }));
    
    store.setAutoSave(enabled);
    
    if (!enabled && autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [store]);

  // Set auto-save interval
  const setAutoSaveInterval = useCallback((interval: number) => {
    setOfflineState(prev => ({
      ...prev,
      autoSaveInterval: Math.max(5000, interval) // Minimum 5 seconds
    }));
  }, []);

  // Clear sync error
  const clearSyncError = useCallback(() => {
    setOfflineState(prev => ({
      ...prev,
      syncError: null
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    offlineState,
    syncStatus: getSyncStatus(),
    
    // Status checks
    isOffline: offlineState.isOffline,
    hasUnsyncedChanges: offlineState.hasUnsyncedChanges,
    isSyncing: offlineState.syncInProgress || isProcessingSaves,
    hasSyncError: !!offlineState.syncError,
    canSync: isOnline && !offlineState.syncInProgress,
    
    // Operations
    saveFormData,
    syncNow,
    restoreDraft,
    
    // Configuration
    toggleAutoSave,
    setAutoSaveInterval,
    clearSyncError,
    
    // Utilities
    getCurrentFormData,
    lastSyncTime: offlineState.lastSuccessfulSync,
    syncError: offlineState.syncError
  };
}

/**
 * Hook for offline form field management
 */
export function useOfflineField(step: OnboardingStep, fieldName: string) {
  const { saveFormData, isOffline, hasUnsyncedChanges } = useOfflineForm(step);
  const [fieldValue, setFieldValue] = useState<any>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Update field value and trigger save
  const updateField = useCallback((value: any) => {
    setFieldValue(value);
    setHasLocalChanges(true);
    
    // Debounced save
    const timeoutId = setTimeout(() => {
      saveFormData({ [fieldName]: value });
      setHasLocalChanges(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [saveFormData, fieldName]);

  return {
    fieldValue,
    updateField,
    hasLocalChanges,
    isOffline,
    hasUnsyncedChanges
  };
}

/**
 * Component for displaying offline status and sync controls
 */
export function OfflineStatusIndicator({ 
  step, 
  className 
}: { 
  step: OnboardingStep;
  className?: string;
}) {
  const {
    isOffline,
    hasUnsyncedChanges,
    isSyncing,
    hasSyncError,
    canSync,
    syncNow,
    syncStatus,
    syncError,
    clearSyncError,
    lastSyncTime
  } = useOfflineForm(step);

  if (!isOffline && !hasUnsyncedChanges && !hasSyncError) {
    return null; // Don't show when everything is synced
  }

  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'offline':
        return 'Working offline - changes will sync when connection is restored';
      case 'syncing':
        return 'Syncing changes...';
      case 'pending':
        return 'Changes pending sync';
      case 'error':
        return `Sync failed: ${syncError}`;
      case 'synced':
        return 'All changes synced';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'offline':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'syncing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'pending':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'synced':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`p-3 border rounded-lg ${getStatusColor()} ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'syncing' ? 'animate-pulse bg-current' : 'bg-current'
          }`} />
          <span className="text-sm font-medium">{getStatusMessage()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSyncTime && lastSyncTime instanceof Date && !isNaN(lastSyncTime.getTime()) && (
            <span className="text-xs opacity-75">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
          
          {hasSyncError && (
            <button
              onClick={clearSyncError}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          )}
          
          {canSync && hasUnsyncedChanges && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="text-xs underline hover:no-underline disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}