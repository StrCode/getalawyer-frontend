import { beforeEach, describe, expect, it } from 'vitest';
import { 
  clearEnhancedOnboardingStore,
  STEP_DEFINITIONS, 
  useEnhancedOnboardingStore 
} from '../../stores/enhanced-onboarding-store';

describe('Enhanced Onboarding Store', () => {
  beforeEach(() => {
    // Reset store state manually instead of relying on localStorage
    const store = useEnhancedOnboardingStore.getState();
    store.resetStore();
  });

  it('should initialize with default state', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    expect(store.currentStep).toBe('basic_info');
    expect(store.completedSteps).toEqual([]);
    expect(store.progressPercentage).toBe(0);
    expect(store.applicationStatus).toBe('draft');
    expect(store.basicInfo.firstName).toBe('');
  });

  it('should validate step navigation access', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Should allow access to first step
    expect(store.canAccessStep('basic_info')).toBe(true);
    
    // Should not allow access to future steps initially
    expect(store.canAccessStep('credentials')).toBe(false);
    expect(store.canAccessStep('pending_approval')).toBe(false);
  });

  it('should mark steps as completed and update progress', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Mark first step as completed
    store.markStepCompleted('basic_info');
    
    const updatedStore = useEnhancedOnboardingStore.getState();
    expect(updatedStore.completedSteps).toContain('basic_info');
    expect(updatedStore.progressPercentage).toBeGreaterThan(0);
  });

  it('should validate basic info step correctly', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Initially should be invalid (empty required fields)
    const initialValidation = store.validateStep('basic_info');
    expect(initialValidation.isValid).toBe(false);
    expect(initialValidation.errors.length).toBeGreaterThan(0);
    
    // Update with valid data
    store.updateBasicInfo({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      country: 'US'
    });
    
    const validValidation = store.validateStep('basic_info');
    expect(validValidation.isValid).toBe(true);
    expect(validValidation.errors.length).toBe(0);
  });

  it('should validate credentials step correctly', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Initially should be invalid (empty required fields)
    const initialValidation = store.validateStep('credentials');
    expect(initialValidation.isValid).toBe(false);
    expect(initialValidation.errors.length).toBeGreaterThan(0);
    
    // Update with valid data
    store.updateCredentials({
      barNumber: 'SCN/12345/2020',
      nin: '12345678901',
      ninVerified: true,
      photographUrl: 'https://example.com/photo.jpg'
    });
    
    const validValidation = store.validateStep('credentials');
    expect(validValidation.isValid).toBe(true);
    expect(validValidation.errors.length).toBe(0);
  });

  it('should handle error management', () => {
    const store = useEnhancedOnboardingStore.getState();
    
    // Set error
    store.setError('firstName', ['First name is required']);
    
    let state = useEnhancedOnboardingStore.getState();
    expect(state.errors.firstName).toEqual(['First name is required']);
    
    // Clear specific error
    store.clearError('firstName');
    state = useEnhancedOnboardingStore.getState();
    expect(state.errors.firstName).toBeUndefined();
    
    // Set multiple errors and clear all
    store.setError('firstName', ['Error 1']);
    store.setError('lastName', ['Error 2']);
    store.clearAllErrors();
    
    state = useEnhancedOnboardingStore.getState();
    expect(Object.keys(state.errors).length).toBe(0);
  });
});