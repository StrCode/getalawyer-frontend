import { beforeEach, describe, expect, it } from 'vitest';
import { useEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Onboarding Navigation Guards', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();
    
    // Reset store before each test
    const store = useEnhancedOnboardingStore.getState();
    store.resetStore();
  });

  describe('canAccessStep', () => {
    it('should allow access to basic_info step by default', () => {
      const store = useEnhancedOnboardingStore.getState();
      expect(store.canAccessStep('basic_info')).toBe(true);
    });

    it('should prevent access to credentials step when basic_info is not completed', () => {
      const store = useEnhancedOnboardingStore.getState();
      expect(store.canAccessStep('credentials')).toBe(false);
    });

    it('should allow access to credentials step when basic_info is completed', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Complete basic_info step
      store.markStepCompleted('basic_info');
      
      // Now check if we can access credentials
      const canAccess = store.canAccessStep('credentials');
      expect(canAccess).toBe(true);
    });

    it('should allow access to completed steps', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Complete basic_info
      store.markStepCompleted('basic_info');
      store.setCurrentStep('credentials');
      
      // Should still be able to access basic_info
      expect(store.canAccessStep('basic_info')).toBe(true);
    });

    it('should prevent skipping ahead to credentials without completing basic_info', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Try to set current step to credentials without completing basic_info
      store.setCurrentStep('credentials');
      
      // Current step should remain basic_info because canAccessStep returns false
      expect(store.currentStep).toBe('basic_info');
    });
  });

  describe('Step progression', () => {
    it('should progress from basic_info to credentials after completion', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Start at basic_info
      expect(store.currentStep).toBe('basic_info');
      
      // Complete basic_info
      store.markStepCompleted('basic_info');
      
      // Now we should be able to move to credentials
      // The canAccessStep logic allows access to the next step if current step is completed
      store.setCurrentStep('credentials');
      
      // Get fresh state after update
      const updatedStore = useEnhancedOnboardingStore.getState();
      expect(updatedStore.currentStep).toBe('credentials');
    });

    it('should track completed steps correctly', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Initially no steps completed
      expect(store.completedSteps).toHaveLength(0);
      
      // Complete basic_info
      store.markStepCompleted('basic_info');
      
      // Get fresh state
      const updatedStore = useEnhancedOnboardingStore.getState();
      expect(updatedStore.completedSteps).toContain('basic_info');
      expect(updatedStore.completedSteps).toHaveLength(1);
      
      // Complete credentials
      updatedStore.markStepCompleted('credentials');
      
      // Get fresh state again
      const finalStore = useEnhancedOnboardingStore.getState();
      expect(finalStore.completedSteps).toContain('basic_info');
      expect(finalStore.completedSteps).toContain('credentials');
      expect(finalStore.completedSteps).toHaveLength(2);
    });

    it('should update progress percentage correctly', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Initially 0%
      expect(store.progressPercentage).toBe(0);
      
      // Complete basic_info (1 of 2 steps = 50%)
      store.markStepCompleted('basic_info');
      
      // Get fresh state
      const updatedStore = useEnhancedOnboardingStore.getState();
      expect(updatedStore.progressPercentage).toBe(50);
      
      // Complete credentials (2 of 2 steps = 100%)
      updatedStore.markStepCompleted('credentials');
      
      // Get fresh state again
      const finalStore = useEnhancedOnboardingStore.getState();
      expect(finalStore.progressPercentage).toBe(100);
    });
  });

  describe('Form validation', () => {
    it('should validate basic_info step correctly', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Empty form should fail validation
      const emptyValidation = store.validateStep('basic_info');
      expect(emptyValidation.isValid).toBe(false);
      expect(emptyValidation.canProceed).toBe(false);
      expect(emptyValidation.errors.length).toBeGreaterThan(0);
      
      // Fill in required fields
      store.updateBasicInfo({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+2341234567890',
        country: 'NG',
      });
      
      // Get fresh state and validate
      const updatedStore = useEnhancedOnboardingStore.getState();
      const validValidation = updatedStore.validateStep('basic_info');
      expect(validValidation.isValid).toBe(true);
      expect(validValidation.canProceed).toBe(true);
      expect(validValidation.errors).toHaveLength(0);
    });

    it('should validate credentials step correctly', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Empty credentials should fail validation
      const emptyValidation = store.validateStep('credentials');
      expect(emptyValidation.isValid).toBe(false);
      expect(emptyValidation.errors.length).toBeGreaterThan(0);
      
      // Fill in credentials
      store.updateCredentials({
        barNumber: 'SCN/12345/2020',
        nin: '12345678901',
        ninVerified: true,
        photographUrl: 'https://example.com/photo.jpg',
      });
      
      // Get fresh state and validate
      const updatedStore = useEnhancedOnboardingStore.getState();
      const validValidation = updatedStore.validateStep('credentials');
      expect(validValidation.isValid).toBe(true);
      expect(validValidation.errors).toHaveLength(0);
    });

    it('should require NIN verification for credentials step', () => {
      const store = useEnhancedOnboardingStore.getState();
      
      // Fill in credentials but don't verify NIN
      store.updateCredentials({
        barNumber: 'SCN/12345/2020',
        nin: '12345678901',
        ninVerified: false,
        photographUrl: 'https://example.com/photo.jpg',
      });
      
      // Get fresh state and validate
      const updatedStore = useEnhancedOnboardingStore.getState();
      const validation = updatedStore.validateStep('credentials');
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.field === 'nin')).toBe(true);
    });
  });
});
