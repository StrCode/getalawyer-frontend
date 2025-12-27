import { useCallback, useEffect, useRef } from 'react';
import { OnboardingStep, useEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';

export interface UseDraftManagerOptions {
  stepId: OnboardingStep;
  autoSaveInterval?: number; // milliseconds, default 30 seconds
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
  enabled?: boolean;
}

export interface DraftManagerReturn {
  saveDraft: (data: any) => void;
  restoreDraft: () => any | null;
  clearDraft: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isAutoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

/**
 * Hook for managing draft data with auto-save functionality
 * Provides automatic saving every 30 seconds and manual save/restore capabilities
 */
export function useDraftManager(options: UseDraftManagerOptions): DraftManagerReturn {
  const {
    stepId,
    autoSaveInterval = 30000, // 30 seconds default
    onSave,
    onRestore,
    enabled = true
  } = options;

  const {
    saveDraft,
    restoreDraft,
    clearDraft,
    hasUnsavedChanges,
    lastSaved,
    autoSaveEnabled,
    setAutoSave,
    lastAutoSave
  } = useEnhancedOnboardingStore();

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Manual save function
  const handleSaveDraft = useCallback((data: any) => {
    if (!enabled) return;
    
    pendingDataRef.current = data;
    saveDraft(stepId, data);
    onSave?.(data);
  }, [enabled, stepId, saveDraft, onSave]);

  // Manual restore function
  const handleRestoreDraft = useCallback(() => {
    if (!enabled) return null;
    
    const data = restoreDraft(stepId);
    if (data) {
      onRestore?.(data);
    }
    return data;
  }, [enabled, stepId, restoreDraft, onRestore]);

  // Manual clear function
  const handleClearDraft = useCallback(() => {
    if (!enabled) return;
    
    clearDraft(stepId);
    pendingDataRef.current = null;
    
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, [enabled, stepId, clearDraft]);

  // Auto-save functionality
  const startAutoSave = useCallback(() => {
    if (!enabled || !autoSaveEnabled) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up new timer
    autoSaveTimerRef.current = setInterval(() => {
      if (pendingDataRef.current && hasUnsavedChanges) {
        saveDraft(stepId, pendingDataRef.current);
      }
    }, autoSaveInterval);
  }, [enabled, autoSaveEnabled, hasUnsavedChanges, stepId, saveDraft, autoSaveInterval]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  // Set up auto-save when enabled
  useEffect(() => {
    if (enabled && autoSaveEnabled) {
      startAutoSave();
    } else {
      stopAutoSave();
    }

    return () => {
      stopAutoSave();
    };
  }, [enabled, autoSaveEnabled, startAutoSave, stopAutoSave]);

  // Initialize draft restoration on mount
  useEffect(() => {
    if (!isInitializedRef.current && enabled) {
      isInitializedRef.current = true;
      const restoredData = handleRestoreDraft();
      if (restoredData) {
        pendingDataRef.current = restoredData;
      }
    }
  }, [enabled, handleRestoreDraft]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    saveDraft: handleSaveDraft,
    restoreDraft: handleRestoreDraft,
    clearDraft: handleClearDraft,
    hasUnsavedChanges,
    lastSaved: lastAutoSave || lastSaved,
    isAutoSaveEnabled: autoSaveEnabled,
    setAutoSaveEnabled: setAutoSave,
  };
}

/**
 * Utility function to check if there are any unsaved changes across all steps
 */
export function hasAnyUnsavedChanges(): boolean {
  const store = useEnhancedOnboardingStore.getState();
  return store.hasUnsavedChanges;
}

/**
 * Utility function to get the last save time across all steps
 */
export function getLastSaveTime(): Date | null {
  const store = useEnhancedOnboardingStore.getState();
  return store.lastAutoSave || store.lastSaved;
}

/**
 * Utility function to clear all drafts
 */
export function clearAllDrafts(): void {
  const store = useEnhancedOnboardingStore.getState();
  const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations', 'review', 'submitted'];
  
  steps.forEach(step => {
    store.clearDraft(step);
  });
}

/**
 * Hook for managing network connectivity and sync
 */
export function useOfflineSync() {
  const { hasUnsavedChanges, lastAutoSave } = useEnhancedOnboardingStore();
  const isOnlineRef = useRef(navigator.onLine);
  const pendingSyncRef = useRef(false);

  const syncPendingChanges = useCallback(async () => {
    if (!hasUnsavedChanges || pendingSyncRef.current) return;
    
    pendingSyncRef.current = true;
    
    try {
      // Here you would implement the actual sync logic with your backend
      // For now, we'll just simulate a sync operation
      console.log('Syncing pending changes...', { lastAutoSave });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as synced
      useEnhancedOnboardingStore.getState().updateLastSaved();
      
    } catch (error) {
      console.error('Failed to sync changes:', error);
    } finally {
      pendingSyncRef.current = false;
    }
  }, [hasUnsavedChanges, lastAutoSave]);

  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (hasUnsavedChanges) {
        syncPendingChanges();
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasUnsavedChanges, syncPendingChanges]);

  return {
    isOnline: isOnlineRef.current,
    hasPendingSync: hasUnsavedChanges && !isOnlineRef.current,
    syncPendingChanges,
  };
}

/**
 * Utility for debouncing draft saves to prevent excessive saves
 */
export function useDebouncedDraftSave(
  stepId: OnboardingStep,
  delay: number = 1000
) {
  const { saveDraft } = useEnhancedOnboardingStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft(stepId, data);
    }, delay);
  }, [stepId, saveDraft, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSave;
}