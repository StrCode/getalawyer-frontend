import { beforeEach, describe, expect, it } from 'vitest';
import { 
  clearEnhancedOnboardingStore,
  STEP_DEFINITIONS, 
  useEnhancedOnboardingStore 
} from '../index';

describe('Enhanced Onboarding Store', () => {
  beforeEach(() => {
    // Reset store state manually instead of relying on localStorage
    const store = useEnhancedOnboardingStore.getState();
    store.resetStore();
  });

  it('should initialize with default state', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    expect(store.currentStep).toBe('practice_info');
    expect(store.completedSteps).toEqual([]);
    expect(store.progressPercentage).toBe(0);
    expect(store.applicationStatus).toBe('draft');
    expect(store.practiceInfo.firstName).toBe('');
  });

  it('should validate step navigation access', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Should allow access to first step
    expect(store.canAccessStep('practice_info')).toBe(true);
    
    // Should not allow access to future steps initially
    expect(store.canAccessStep('documents')).toBe(false);
    expect(store.canAccessStep('specializations')).toBe(false);
  });

  it('should mark steps as completed and update progress', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Mark first step as completed
    store.markStepCompleted('practice_info');
    
    const updatedStore = useEnhancedOnboardingStore.getState();
    expect(updatedStore.completedSteps).toContain('practice_info');
    expect(updatedStore.progressPercentage).toBeGreaterThan(0);
  });

  it('should validate practice info step correctly', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Initially should be invalid (empty required fields)
    const initialValidation = store.validateStep('practice_info');
    expect(initialValidation.isValid).toBe(false);
    expect(initialValidation.errors.length).toBeGreaterThan(0);
    
    // Update with valid data
    store.updatePracticeInfo({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      country: 'US'
    });
    
    const validValidation = store.validateStep('practice_info');
    expect(validValidation.isValid).toBe(true);
    expect(validValidation.errors.length).toBe(0);
  });

  it('should manage draft data correctly', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    const draftData = { firstName: 'Draft', lastName: 'User' };
    
    // Save draft
    store.saveDraft('practice_info', draftData);
    
    // Restore draft
    const restored = store.restoreDraft('practice_info');
    expect(restored).toEqual(draftData);
    
    // Clear draft
    store.clearDraft('practice_info');
    const clearedDraft = store.restoreDraft('practice_info');
    expect(clearedDraft).toBeNull();
  });

  it('should handle specializations with limits', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Add specializations up to limit
    for (let i = 0; i < 5; i++) {
      store.addSpecialization({
        specializationId: `spec-${i}`,
        yearsOfExperience: i + 1
      });
    }
    
    const stateAfterFive = useEnhancedOnboardingStore.getState();
    expect(stateAfterFive.specializations.length).toBe(5);
    
    // Try to add sixth (should be ignored)
    store.addSpecialization({
      specializationId: 'spec-6',
      yearsOfExperience: 6
    });
    
    const finalState = useEnhancedOnboardingStore.getState();
    expect(finalState.specializations.length).toBe(5);
  });
});