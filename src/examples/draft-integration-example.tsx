/**
 * Example of how to integrate the draft management system with existing forms
 * This file demonstrates the usage patterns but is not part of the main application
 */

import React, { useEffect } from 'react';
import { DraftIndicator, StepDraftManager } from '@/components/onboarding';
import { type OnboardingStep } from '@/stores/enhanced-onboarding-store';
import { useFormDraftIntegration } from '@/utils/draft-integration';

// Example 1: Basic form with draft management
export function BasicFormWithDrafts({ stepId }: { stepId: OnboardingStep }) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const {
    saveFormDraft,
    restoreFormDraft,
    hasUnsavedChanges,
    isDraftAvailable,
    completeStepWithCleanup
  } = useFormDraftIntegration({ stepId });

  // Restore draft on mount
  useEffect(() => {
    const draftData = restoreFormDraft();
    if (draftData) {
      setFormData(draftData as typeof formData);
    }
  }, [restoreFormDraft]);

  // Auto-save when form data changes
  useEffect(() => {
    saveFormDraft(formData);
  }, [formData, saveFormDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await completeStepWithCleanup(formData);
    if (success) {
      console.log('Step completed successfully');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Basic Information</h2>
        <DraftIndicator stepId={stepId} compact />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Complete Step
        </button>
      </form>

      <StepDraftManager stepId={stepId} />
    </div>
  );
}

// Example 2: Form with TanStack Form integration (pseudo-code)
export function TanStackFormExample({ stepId }: { stepId: OnboardingStep }) {
  // This would be the actual TanStack Form setup
  const form = {
    state: { values: { name: '', email: '' } },
    setValues: (values: any) => console.log('Setting values:', values),
    reset: () => console.log('Resetting form')
  };

  const {
    saveFormDraft,
    restoreFormDraft,
    completeStepWithCleanup
  } = useFormDraftIntegration({ stepId });

  // Auto-save when form values change
  useEffect(() => {
    if (form?.state?.values) {
      saveFormDraft(form.state.values);
    }
  }, [form?.state?.values, saveFormDraft]);

  // Restore draft on mount
  useEffect(() => {
    const draftData = restoreFormDraft();
    if (draftData && form?.setValues) {
      form.setValues(draftData);
    }
  }, [form, restoreFormDraft]);

  const handleSubmit = async (values: unknown) => {
    const success = await completeStepWithCleanup(values);
    if (success && form?.reset) {
      form.reset();
    }
    return success;
  };

  return (
    <div className="space-y-4">
      <DraftIndicator stepId={stepId} />
      
      {/* TanStack Form would go here */}
      <div className="p-4 border rounded">
        <p>TanStack Form integration example</p>
        <p>Form values: {JSON.stringify(form.state.values)}</p>
        <button 
          onClick={() => handleSubmit(form.state.values)}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          Submit with Draft Management
        </button>
      </div>
    </div>
  );
}

// Example 3: Multi-step form with batch operations
export function MultiStepFormExample() {
  const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations'];
  
  // Individual step managers
  const stepManagers = steps.map(stepId => ({
    stepId,
    integration: useFormDraftIntegration({ stepId })
  }));

  const syncAllSteps = async () => {
    const results = { success: [] as OnboardingStep[], failed: [] as OnboardingStep[] };
    
    for (const { stepId, integration } of stepManagers) {
      try {
        await integration.completeStepWithCleanup({});
        results.success.push(stepId);
      } catch (error) {
        results.failed.push(stepId);
      }
    }
    
    console.log('Sync results:', results);
  };

  const clearAllDrafts = () => {
    stepManagers.forEach(({ integration }) => {
      integration.clearDraft();
    });
  };

  return (
    <div className="space-y-6">
      <h2>Multi-Step Form with Draft Management</h2>
      
      {/* Global controls */}
      <div className="flex gap-2">
        <button 
          onClick={syncAllSteps}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sync All Steps
        </button>
        <button 
          onClick={clearAllDrafts}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Clear All Drafts
        </button>
      </div>

      {/* Individual step status */}
      <div className="space-y-2">
        {steps.map(stepId => (
          <div key={stepId} className="flex items-center justify-between p-2 border rounded">
            <span className="capitalize">{stepId.replace('_', ' ')}</span>
            <DraftIndicator stepId={stepId} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Field-level draft integration
export function FieldLevelDraftExample({ stepId }: { stepId: OnboardingStep }) {
  const { saveFormDraft, restoreFormDraft } = useFormDraftIntegration({ stepId });
  
  const getFieldValue = (fieldName: string, defaultValue = '') => {
    const draftData = restoreFormDraft() as Record<string, unknown> || {};
    return (draftData[fieldName] as string) ?? defaultValue;
  };

  const setFieldValue = (fieldName: string, value: unknown) => {
    const currentDraft = restoreFormDraft() as Record<string, unknown> || {};
    const updatedDraft = {
      ...currentDraft,
      [fieldName]: value
    };
    saveFormDraft(updatedDraft);
  };

  return (
    <div className="space-y-4">
      <h3>Field-Level Draft Management</h3>
      
      <input
        type="text"
        placeholder="Field 1"
        value={getFieldValue('field1')}
        onChange={(e) => setFieldValue('field1', e.target.value)}
        className="w-full p-2 border rounded"
      />
      
      <input
        type="text"
        placeholder="Field 2"
        value={getFieldValue('field2')}
        onChange={(e) => setFieldValue('field2', e.target.value)}
        className="w-full p-2 border rounded"
      />
      
      <DraftIndicator stepId={stepId} />
    </div>
  );
}