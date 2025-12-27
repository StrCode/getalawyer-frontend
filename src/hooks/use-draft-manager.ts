import { useCallback, useEffect, useRef, useState } from 'react';
import { type OnboardingStep, useEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';
import { useNetworkStatus } from './use-network-status';

export interface UseDraftManagerOptions {
  stepId: OnboardingStep;
  autoSaveInterval?: number; // milliseconds, default 30 seconds
  onSave?: (data: unknown) => void;
  onRestore?: (data: unknown) => void;
  enabled?: boolean;
}

export interface DraftManagerReturn {
  saveDraft: (data: unknown) => void;
  restoreDraft: () => unknown | null;
  clearDraft: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isAutoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  isDraftAvailable: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updatePendingData: (data: unknown) => void;
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
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<unknown>(null);
  const isInitializedRef = useRef(false);
  const lastDataHashRef = useRef<string>('');

  // Check if draft is available for this step
  useEffect(() => {
    const draftData = restoreDraft(stepId);
    setIsDraftAvailable(!!draftData);
    // eslint-disable-next-line
  }, [stepId]); // Only depend on stepId, restoreDraft is stable

  // Hash function for data comparison
  const hashData = useCallback((data: unknown): string => {
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }, []);

  // Manual save function
  const handleSaveDraft = useCallback((data: unknown) => {
    if (!enabled) return;
    
    const dataHash = hashData(data);
    
    // Only save if data has actually changed
    if (dataHash === lastDataHashRef.current) {
      return;
    }
    
    setAutoSaveStatus('saving');
    pendingDataRef.current = data;
    lastDataHashRef.current = dataHash;
    
    try {
      saveDraft(stepId, data);
      setAutoSaveStatus('saved');
      setIsDraftAvailable(true);
      onSave?.(data);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Failed to save draft:', error);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
    }
  }, [enabled, stepId, saveDraft, onSave, hashData]);

  // Manual restore function
  const handleRestoreDraft = useCallback(() => {
    if (!enabled) return null;
    
    const data = restoreDraft(stepId);
    if (data) {
      pendingDataRef.current = data;
      lastDataHashRef.current = hashData(data);
      setIsDraftAvailable(true);
      onRestore?.(data);
    } else {
      setIsDraftAvailable(false);
    }
    return data;
  }, [enabled, stepId, restoreDraft, onRestore, hashData]);

  // Manual clear function
  const handleClearDraft = useCallback(() => {
    if (!enabled) return;
    
    clearDraft(stepId);
    pendingDataRef.current = null;
    lastDataHashRef.current = '';
    setIsDraftAvailable(false);
    setAutoSaveStatus('idle');
    
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
        const currentHash = hashData(pendingDataRef.current);
        
        // Only auto-save if data has changed since last save
        if (currentHash !== lastDataHashRef.current) {
          handleSaveDraft(pendingDataRef.current);
        }
      }
    }, autoSaveInterval);
  }, [enabled, autoSaveEnabled, hasUnsavedChanges, autoSaveInterval, handleSaveDraft, hashData]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  // Update pending data when external data changes
  const updatePendingData = useCallback((data: unknown) => {
    if (!enabled) return;
    
    pendingDataRef.current = data;
    
    // If auto-save is disabled, save immediately
    if (!autoSaveEnabled) {
      handleSaveDraft(data);
    }
  }, [enabled, autoSaveEnabled, handleSaveDraft]);

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
    // eslint-disable-next-line
  }, [enabled]); // Only depend on enabled, handleRestoreDraft is stable

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  // Enhanced auto-save enabled setter
  const setAutoSaveEnabledEnhanced = useCallback((enabled: boolean) => {
    setAutoSave(enabled);
    
    if (enabled) {
      startAutoSave();
    } else {
      stopAutoSave();
      // Save immediately when disabling auto-save
      if (pendingDataRef.current && hasUnsavedChanges) {
        handleSaveDraft(pendingDataRef.current);
      }
    }
  }, [setAutoSave, startAutoSave, stopAutoSave, hasUnsavedChanges, handleSaveDraft]);

  return {
    saveDraft: handleSaveDraft,
    restoreDraft: handleRestoreDraft,
    clearDraft: handleClearDraft,
    hasUnsavedChanges,
    lastSaved: lastAutoSave || lastSaved,
    isAutoSaveEnabled: autoSaveEnabled,
    setAutoSaveEnabled: setAutoSaveEnabledEnhanced,
    isDraftAvailable,
    autoSaveStatus,
    
    // Additional utility for external components to update pending data
    updatePendingData,
  };
}

/**
 * Hook for managing draft state indicators
 */
export function useDraftIndicator(stepId: OnboardingStep) {
  const { isDraftAvailable, hasUnsavedChanges, lastSaved, autoSaveStatus } = useDraftManager({ stepId });
  const { isOnline } = useNetworkStatus();

  const getIndicatorStatus = useCallback(() => {
    if (autoSaveStatus === 'saving') return 'saving';
    if (autoSaveStatus === 'error') return 'error';
    if (!isOnline && hasUnsavedChanges) return 'offline';
    if (hasUnsavedChanges) return 'unsaved';
    if (isDraftAvailable) return 'draft';
    return 'clean';
  }, [autoSaveStatus, isOnline, hasUnsavedChanges, isDraftAvailable]);

  const getIndicatorMessage = useCallback(() => {
    const status = getIndicatorStatus();
    let timeString = '';
    
    try {
      if (lastSaved && lastSaved instanceof Date && !Number.isNaN(lastSaved.getTime())) {
        timeString = lastSaved.toLocaleTimeString();
      }
    } catch (error) {
      console.warn('Error formatting lastSaved time:', error);
      timeString = '';
    }
    
    switch (status) {
      case 'saving':
        return 'Saving draft...';
      case 'error':
        return 'Failed to save draft';
      case 'offline':
        return 'Working offline - will sync when connected';
      case 'unsaved':
        return 'Unsaved changes';
      case 'draft':
        return `Draft saved${timeString ? ` at ${timeString}` : ''}`;
      case 'clean':
        return 'All changes saved';
      default:
        return '';
    }
  }, [getIndicatorStatus, lastSaved]);

  const getIndicatorColor = useCallback(() => {
    const status = getIndicatorStatus();
    
    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      case 'offline':
        return 'text-amber-600';
      case 'unsaved':
        return 'text-orange-600';
      case 'draft':
        return 'text-green-600';
      case 'clean':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  }, [getIndicatorStatus]);

  return {
    status: getIndicatorStatus(),
    message: getIndicatorMessage(),
    color: getIndicatorColor(),
    isDraftAvailable,
    hasUnsavedChanges,
    lastSaved,
    isOnline,
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