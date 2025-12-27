import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useDraftManager } from '@/hooks/use-draft-manager';
import { useDraftSync } from '@/hooks/use-draft-sync';
import { type OnboardingStep } from '@/stores/enhanced-onboarding-store';

/**
 * Integration utilities for connecting draft management with existing forms
 */

export interface FormDraftIntegrationOptions {
  stepId: OnboardingStep;
  autoSaveInterval?: number;
  syncOnComplete?: boolean;
  clearOnComplete?: boolean;
}

/**
 * Hook for integrating draft management with form libraries (TanStack Form, React Hook Form, etc.)
 */
export function useFormDraftIntegration(options: FormDraftIntegrationOptions) {
  const {
    stepId,
    autoSaveInterval = 30000,
    syncOnComplete = true,
    clearOnComplete = true
  } = options;

  const {
    saveDraft,
    restoreDraft,
    clearDraft,
    hasUnsavedChanges,
    isDraftAvailable,
    updatePendingData
  } = useDraftManager({
    stepId,
    autoSaveInterval,
    enabled: true
  });

  const { markStepCompleted } = useDraftSync();

  // Save form data to draft
  const saveFormDraft = useCallback((formData: unknown) => {
    updatePendingData(formData);
    saveDraft(formData);
  }, [updatePendingData, saveDraft]);

  // Restore form data from draft
  const restoreFormDraft = useCallback(() => {
    return restoreDraft();
  }, [restoreDraft]);

  // Complete step with draft cleanup
  const completeStepWithCleanup = useCallback(async (formData: unknown) => {
    try {
      // Save final data
      saveDraft(formData);
      
      // Mark step as completed (this will sync if enabled)
      if (syncOnComplete) {
        await markStepCompleted(stepId);
      }
      
      // Clear draft if enabled
      if (clearOnComplete) {
        clearDraft();
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to complete step ${stepId}:`, error);
      return false;
    }
  }, [stepId, saveDraft, markStepCompleted, clearDraft, syncOnComplete, clearOnComplete]);

  return {
    // Draft operations
    saveFormDraft,
    restoreFormDraft,
    clearDraft,
    completeStepWithCleanup,
    
    // Status
    hasUnsavedChanges,
    isDraftAvailable,
    
    // For form libraries that need direct access
    draftManager: {
      saveDraft,
      restoreDraft,
      clearDraft,
      updatePendingData
    }
  };
}

/**
 * Higher-order component for adding draft management to existing form components
 */
export function withDraftManagement<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>,
  stepId: OnboardingStep,
  options: Omit<FormDraftIntegrationOptions, 'stepId'> = {}
) {
  return function DraftManagedComponent(props: T) {
    const draftIntegration = useFormDraftIntegration({
      stepId,
      ...options
    });

    // Inject draft management props
    const enhancedProps = {
      ...props,
      draftManager: draftIntegration
    } as T & { draftManager: ReturnType<typeof useFormDraftIntegration> };

    return React.createElement(WrappedComponent, enhancedProps);
  };
}

/**
 * Utility for TanStack Form integration
 */
export function useTanStackFormDraftIntegration(
  stepId: OnboardingStep,
  form: any, // TanStack Form instance
  options: Omit<FormDraftIntegrationOptions, 'stepId'> = {}
) {
  const integration = useFormDraftIntegration({ stepId, ...options });

  // Auto-save when form values change
  useEffect(() => {
    if (form?.state?.values) {
      integration.saveFormDraft(form.state.values);
    }
  }, [form?.state?.values, integration]);

  // Restore draft on mount
  useEffect(() => {
    const draftData = integration.restoreFormDraft();
    if (draftData && form?.setValues) {
      form.setValues(draftData);
    }
  }, [form, integration]);

  // Enhanced submit handler
  const handleSubmitWithDraft = useCallback(async (values: unknown) => {
    const success = await integration.completeStepWithCleanup(values);
    if (success && form?.reset) {
      form.reset();
    }
    return success;
  }, [integration, form]);

  return {
    ...integration,
    handleSubmitWithDraft,
    form: {
      ...form,
      submitWithDraft: handleSubmitWithDraft
    }
  };
}

/**
 * Utility for React Hook Form integration
 */
export function useReactHookFormDraftIntegration(
  stepId: OnboardingStep,
  form: any, // React Hook Form instance
  options: Omit<FormDraftIntegrationOptions, 'stepId'> = {}
) {
  const integration = useFormDraftIntegration({ stepId, ...options });

  // Watch form values and auto-save
  useEffect(() => {
    const subscription = form?.watch?.((values: unknown) => {
      integration.saveFormDraft(values);
    });

    return () => subscription?.unsubscribe?.();
  }, [form, integration]);

  // Restore draft on mount
  useEffect(() => {
    const draftData = integration.restoreFormDraft();
    if (draftData && form?.reset) {
      form.reset(draftData);
    }
  }, [form, integration]);

  // Enhanced submit handler
  const handleSubmitWithDraft = useCallback(async (values: unknown) => {
    const success = await integration.completeStepWithCleanup(values);
    if (success && form?.reset) {
      form.reset();
    }
    return success;
  }, [integration, form]);

  return {
    ...integration,
    handleSubmitWithDraft,
    form: {
      ...form,
      handleSubmit: (onValid: (data: any) => void) => 
        form.handleSubmit((data: any) => {
          handleSubmitWithDraft(data).then(() => onValid(data));
        })
    }
  };
}

/**
 * Generic form field draft integration
 */
export function useFieldDraftIntegration(
  stepId: OnboardingStep,
  fieldName: string,
  initialValue?: unknown
) {
  const { saveFormDraft, restoreFormDraft } = useFormDraftIntegration({ stepId });

  // Restore field value from draft
  const getFieldValue = useCallback(() => {
    const draftData = restoreFormDraft() as Record<string, unknown>;
    return draftData?.[fieldName] ?? initialValue;
  }, [restoreFormDraft, fieldName, initialValue]);

  // Save field value to draft
  const setFieldValue = useCallback((value: unknown) => {
    const currentDraft = restoreFormDraft() as Record<string, unknown> || {};
    const updatedDraft = {
      ...currentDraft,
      [fieldName]: value
    };
    saveFormDraft(updatedDraft);
  }, [restoreFormDraft, saveFormDraft, fieldName]);

  return {
    value: getFieldValue(),
    setValue: setFieldValue,
    fieldName
  };
}

/**
 * Batch operations for multiple steps
 */
export class DraftBatchManager {
  private steps: OnboardingStep[];

  constructor(steps: OnboardingStep[]) {
    this.steps = steps;
  }

  // Note: These methods should be used within React components that have access to hooks
  // They are provided as utilities but require hook context
  
  getSteps(): OnboardingStep[] {
    return this.steps;
  }
}

/**
 * Hook for batch operations on multiple steps
 */
export function useDraftBatchOperations(steps: OnboardingStep[]) {
  // Create individual hook calls for each step
  const stepHooks = steps.map(stepId => ({
    stepId,
    draftManager: useDraftManager({ stepId }),
    draftSync: useDraftSync()
  }));

  const syncAllSteps = useCallback(async (): Promise<{ success: OnboardingStep[]; failed: OnboardingStep[] }> => {
    const results = { success: [] as OnboardingStep[], failed: [] as OnboardingStep[] };
    
    for (const { stepId, draftSync } of stepHooks) {
      try {
        await draftSync.syncNow(stepId);
        results.success.push(stepId);
      } catch (error) {
        console.error(`Failed to sync step ${stepId}:`, error);
        results.failed.push(stepId);
      }
    }
    
    return results;
  }, [stepHooks]);

  const clearAllDrafts = useCallback((): OnboardingStep[] => {
    const cleared: OnboardingStep[] = [];
    
    stepHooks.forEach(({ stepId, draftManager }) => {
      try {
        draftManager.clearDraft();
        cleared.push(stepId);
      } catch (error) {
        console.error(`Failed to clear draft for step ${stepId}:`, error);
      }
    });
    
    return cleared;
  }, [stepHooks]);

  const getDraftStatus = useCallback((): Record<OnboardingStep, { hasDraft: boolean; hasUnsaved: boolean }> => {
    const status: Record<string, { hasDraft: boolean; hasUnsaved: boolean }> = {};
    
    stepHooks.forEach(({ stepId, draftManager }) => {
      status[stepId] = {
        hasDraft: draftManager.isDraftAvailable,
        hasUnsaved: draftManager.hasUnsavedChanges
      };
    });
    
    return status as Record<OnboardingStep, { hasDraft: boolean; hasUnsaved: boolean }>;
  }, [stepHooks]);

  return {
    syncAllSteps,
    clearAllDrafts,
    getDraftStatus,
    steps
  };
}

/**
 * Hook for common onboarding steps batch operations
 */
export function useOnboardingDraftBatchOperations() {
  return useDraftBatchOperations(['practice_info', 'documents', 'specializations']);
}