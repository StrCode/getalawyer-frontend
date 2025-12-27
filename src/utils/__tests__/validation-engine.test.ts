import { describe, expect, it } from 'vitest';
import type { EnhancedOnboardingState } from '@/stores/enhanced-onboarding-store';
import { ErrorPriority, ValidationEngine } from '../validation-engine';

// Mock state for testing
const createMockState = (overrides: Partial<EnhancedOnboardingState> = {}): EnhancedOnboardingState => ({
  currentStep: 'practice_info',
  completedSteps: [],
  practiceInfo: {
    firstName: '',
    middleName: '',
    lastName: '',
    country: '',
    state: '',
    city: '',
    phoneNumber: '',
    email: '',
  },
  documents: [],
  specializations: [],
  isLoading: false,
  errors: {},
  hasUnsavedChanges: false,
  lastSaved: null,
  progressPercentage: 0,
  estimatedTimeRemaining: 0,
  applicationStatus: 'draft',
  draftData: {
    practice_info: null,
    documents: null,
    specializations: null,
    review: null,
    submitted: null,
  },
  autoSaveEnabled: true,
  lastAutoSave: null,
  // Mock functions
  setCurrentStep: () => {},
  markStepCompleted: () => {},
  canAccessStep: () => true,
  validateStep: () => ({ isValid: true, errors: [], canProceed: true }),
  updateProgress: () => 0,
  calculateTimeRemaining: () => 0,
  saveDraft: () => {},
  restoreDraft: () => null,
  clearDraft: () => {},
  setAutoSave: () => {},
  updatePracticeInfo: () => {},
  addDocument: () => {},
  updateDocument: () => {},
  removeDocument: () => {},
  addSpecialization: () => {},
  updateSpecialization: () => {},
  removeSpecialization: () => {},
  setError: () => {},
  clearError: () => {},
  clearAllErrors: () => {},
  setApplicationStatus: () => {},
  setSubmissionDetails: () => {},
  resetStore: () => {},
  updateLastSaved: () => {},
  ...overrides,
});

describe('ValidationEngine', () => {
  describe('practice_info step validation', () => {
    it('should validate required fields', () => {
      const state = createMockState();
      const result = ValidationEngine.validateStep('practice_info', state);
      
      expect(result.isValid).toBe(false);
      expect(result.hasBlockingErrors).toBe(true);
      expect(result.errors).toHaveLength(5); // firstName, lastName, email, phoneNumber, country
      
      // Check that all errors are critical priority
      result.errors.forEach(error => {
        expect(error.priority).toBe(ErrorPriority.CRITICAL);
      });
    });

    it('should pass validation with valid data', () => {
      const state = createMockState({
        practiceInfo: {
          firstName: 'John',
          middleName: '',
          lastName: 'Doe',
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          phoneNumber: '+1234567890',
          email: 'john.doe@example.com',
        }
      });
      
      const result = ValidationEngine.validateStep('practice_info', state);
      
      expect(result.isValid).toBe(true);
      expect(result.hasBlockingErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(result.canProceed).toBe(true);
    });

    it('should validate email format', () => {
      const state = createMockState({
        practiceInfo: {
          firstName: 'John',
          middleName: '',
          lastName: 'Doe',
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          phoneNumber: '+1234567890',
          email: 'invalid-email',
        }
      });
      
      const result = ValidationEngine.validateStep('practice_info', state);
      
      expect(result.isValid).toBe(false);
      const emailError = result.errors.find(e => e.field === 'email');
      expect(emailError).toBeDefined();
      expect(emailError?.message).toContain('valid email address');
    });

    it('should validate name length constraints', () => {
      const state = createMockState({
        practiceInfo: {
          firstName: 'A', // Too short
          middleName: '',
          lastName: 'B', // Too short
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          phoneNumber: '+1234567890',
          email: 'john.doe@example.com',
        }
      });
      
      const result = ValidationEngine.validateStep('practice_info', state);
      
      expect(result.isValid).toBe(false);
      const firstNameError = result.errors.find(e => e.field === 'firstName');
      const lastNameError = result.errors.find(e => e.field === 'lastName');
      
      expect(firstNameError?.message).toContain('at least 2 characters');
      expect(lastNameError?.message).toContain('at least 2 characters');
    });
  });

  describe('documents step validation', () => {
    it('should require at least one document', () => {
      const state = createMockState();
      const result = ValidationEngine.validateStep('documents', state);
      
      expect(result.isValid).toBe(false);
      expect(result.hasBlockingErrors).toBe(true);
      
      const docError = result.errors.find(e => e.field === 'documents');
      expect(docError?.message).toContain('At least 1 documents is required');
    });

    it('should validate document upload status', () => {
      const state = createMockState({
        documents: [
          {
            id: '1',
            type: 'license',
            originalName: 'license.pdf',
            url: '',
            publicId: '',
            uploadStatus: 'uploading'
          }
        ]
      });
      
      const result = ValidationEngine.validateStep('documents', state);
      
      expect(result.isValid).toBe(false);
      const docError = result.errors.find(e => e.field === 'documents');
      expect(docError?.message).toContain('still uploading or failed');
    });

    it('should pass with completed documents', () => {
      const state = createMockState({
        documents: [
          {
            id: '1',
            type: 'license',
            originalName: 'license.pdf',
            url: 'https://example.com/license.pdf',
            publicId: 'license_123',
            uploadStatus: 'completed'
          }
        ]
      });
      
      const result = ValidationEngine.validateStep('documents', state);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('specializations step validation', () => {
    it('should require at least one specialization', () => {
      const state = createMockState();
      const result = ValidationEngine.validateStep('specializations', state);
      
      expect(result.isValid).toBe(false);
      const specError = result.errors.find(e => e.field === 'specializations');
      expect(specError?.message).toContain('At least 1 specializations is required');
    });

    it('should enforce maximum specializations limit', () => {
      const state = createMockState({
        specializations: Array(6).fill(null).map((_, i) => ({
          specializationId: `spec-${i}`,
          yearsOfExperience: 5
        }))
      });
      
      const result = ValidationEngine.validateStep('specializations', state);
      
      expect(result.isValid).toBe(false);
      const specError = result.errors.find(e => e.field === 'specializations');
      expect(specError?.message).toContain('Maximum 5 specializations allowed');
    });

    it('should validate years of experience', () => {
      const state = createMockState({
        specializations: [
          {
            specializationId: 'family-law',
            yearsOfExperience: -1 // Invalid negative value
          }
        ]
      });
      
      const result = ValidationEngine.validateStep('specializations', state);
      
      expect(result.isValid).toBe(false);
      const specError = result.errors.find(e => e.field === 'specializations');
      expect(specError?.message).toContain('Invalid experience value');
    });

    it('should pass with valid specializations', () => {
      const state = createMockState({
        specializations: [
          {
            specializationId: 'family-law',
            yearsOfExperience: 5
          },
          {
            specializationId: 'criminal-law',
            yearsOfExperience: 3
          }
        ]
      });
      
      const result = ValidationEngine.validateStep('specializations', state);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('field validation', () => {
    it('should validate individual fields', () => {
      const state = createMockState();
      
      const emailResult = ValidationEngine.validateField('practice_info', 'email', 'invalid-email', state);
      expect(emailResult.isValid).toBe(false);
      expect(emailResult.errors[0]?.message).toContain('valid email address');
      
      const validEmailResult = ValidationEngine.validateField('practice_info', 'email', 'test@example.com', state);
      expect(validEmailResult.isValid).toBe(true);
    });

    it('should check if field is required', () => {
      expect(ValidationEngine.isFieldRequired('practice_info', 'firstName')).toBe(true);
      expect(ValidationEngine.isFieldRequired('practice_info', 'city')).toBe(false);
    });

    it('should get required fields for a step', () => {
      const requiredFields = ValidationEngine.getRequiredFields('practice_info');
      expect(requiredFields).toContain('firstName');
      expect(requiredFields).toContain('lastName');
      expect(requiredFields).toContain('email');
      expect(requiredFields).not.toContain('city');
    });
  });

  describe('error prioritization', () => {
    it('should prioritize critical errors', () => {
      const state = createMockState();
      const result = ValidationEngine.validateStep('practice_info', state);
      
      const prioritizedErrors = ValidationEngine.getPrioritizedErrors(result);
      expect(prioritizedErrors.length).toBeGreaterThan(0);
      expect(prioritizedErrors.length).toBeLessThanOrEqual(3); // Should limit to 3 critical errors
      
      prioritizedErrors.forEach(error => {
        expect(error.priority).toBe(ErrorPriority.CRITICAL);
      });
    });
  });

  describe('validation summary', () => {
    it('should provide comprehensive validation summary', () => {
      const state = createMockState();
      const summary = ValidationEngine.getValidationSummary(state);
      
      expect(summary.totalErrors).toBeGreaterThan(0);
      expect(summary.isAllValid).toBe(false);
      expect(summary.canCompleteOnboarding).toBe(false);
      expect(summary.invalidSteps).toContain('practice_info');
      expect(summary.invalidSteps).toContain('documents');
      expect(summary.invalidSteps).toContain('specializations');
    });
  });
});