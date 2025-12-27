import type { 
  EnhancedOnboardingState, 
  OnboardingStep, 
  ValidationError 
} from '@/stores/enhanced-onboarding-store';

/**
 * Priority levels for error messages
 */
export enum ErrorPriority {
  CRITICAL = 1,    // Blocking errors that prevent progression
  HIGH = 2,        // Important validation errors
  MEDIUM = 3,      // Standard validation errors
  LOW = 4          // Minor formatting or suggestion errors
}

/**
 * Enhanced validation error with priority and context
 */
export interface EnhancedValidationError extends ValidationError {
  priority: ErrorPriority;
  context?: string;
  suggestion?: string;
  canAutoFix?: boolean;
}

/**
 * Validation result with enhanced error handling
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<EnhancedValidationError>;
  warnings: Array<EnhancedValidationError>;
  canProceed: boolean;
  hasBlockingErrors: boolean;
  successMessage?: string;
}

/**
 * Field validation configuration
 */
export interface FieldValidationConfig {
  field: string;
  required?: boolean;
  priority?: ErrorPriority;
  validators: Array<FieldValidator>;
  successMessage?: string;
}

/**
 * Individual field validator function
 */
export type FieldValidator = (
  value: unknown, 
  state: EnhancedOnboardingState
) => EnhancedValidationError | null;

/**
 * Email validation regex (RFC 5322 compliant)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Phone number validation (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Common field validators
 */
export const validators = {
  required: (fieldName: string): FieldValidator => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return {
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
        priority: ErrorPriority.CRITICAL,
        suggestion: `Please enter your ${fieldName.toLowerCase()}`
      };
    }
    return null;
  },

  minLength: (fieldName: string, min: number): FieldValidator => (value) => {
    if (typeof value === 'string' && value.trim().length < min) {
      return {
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${min} characters`,
        priority: ErrorPriority.HIGH,
        suggestion: `Enter at least ${min} characters`
      };
    }
    return null;
  },

  maxLength: (fieldName: string, max: number): FieldValidator => (value) => {
    if (typeof value === 'string' && value.trim().length > max) {
      return {
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${max} characters`,
        priority: ErrorPriority.HIGH,
        suggestion: `Shorten to ${max} characters or less`
      };
    }
    return null;
  },

  email: (fieldName: string): FieldValidator => (value) => {
    if (typeof value === 'string' && value.trim() && !EMAIL_REGEX.test(value.trim())) {
      return {
        field: fieldName,
        message: 'Please enter a valid email address',
        priority: ErrorPriority.HIGH,
        suggestion: 'Use format: example@domain.com'
      };
    }
    return null;
  },

  phone: (fieldName: string): FieldValidator => (value) => {
    if (typeof value === 'string' && value.trim() && !PHONE_REGEX.test(value.trim().replace(/[\s\-()]/g, ''))) {
      return {
        field: fieldName,
        message: 'Please enter a valid phone number',
        priority: ErrorPriority.HIGH,
        suggestion: 'Include country code (e.g., +1234567890)'
      };
    }
    return null;
  },

  nonNegativeInteger: (fieldName: string): FieldValidator => (value) => {
    if (typeof value === 'number' && (!Number.isInteger(value) || value < 0)) {
      return {
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be a non-negative whole number`,
        priority: ErrorPriority.HIGH,
        suggestion: 'Enter 0 or a positive whole number'
      };
    }
    return null;
  },

  arrayMinLength: (fieldName: string, min: number): FieldValidator => (value) => {
    if (Array.isArray(value) && value.length < min) {
      return {
        field: fieldName,
        message: `At least ${min} ${fieldName.toLowerCase()} ${min === 1 ? 'is' : 'are'} required`,
        priority: ErrorPriority.CRITICAL,
        suggestion: `Add ${min - value.length} more ${fieldName.toLowerCase()}`
      };
    }
    return null;
  },

  arrayMaxLength: (fieldName: string, max: number): FieldValidator => (value) => {
    if (Array.isArray(value) && value.length > max) {
      return {
        field: fieldName,
        message: `Maximum ${max} ${fieldName.toLowerCase()} allowed`,
        priority: ErrorPriority.HIGH,
        suggestion: `Remove ${value.length - max} ${fieldName.toLowerCase()}`
      };
    }
    return null;
  }
};

/**
 * Step validation configurations
 */
const STEP_VALIDATIONS: Record<OnboardingStep, Array<FieldValidationConfig>> = {
  practice_info: [
    {
      field: 'firstName',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.required('firstName'),
        validators.minLength('firstName', 2),
        validators.maxLength('firstName', 50)
      ],
      successMessage: 'First name looks good!'
    },
    {
      field: 'lastName',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.required('lastName'),
        validators.minLength('lastName', 2),
        validators.maxLength('lastName', 50)
      ],
      successMessage: 'Last name looks good!'
    },
    {
      field: 'email',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.required('email'),
        validators.email('email')
      ],
      successMessage: 'Email address is valid!'
    },
    {
      field: 'phoneNumber',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.required('phoneNumber'),
        validators.phone('phoneNumber')
      ],
      successMessage: 'Phone number is valid!'
    },
    {
      field: 'country',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.required('country')
      ],
      successMessage: 'Country selected!'
    },
    {
      field: 'city',
      required: false,
      priority: ErrorPriority.LOW,
      validators: [
        validators.maxLength('city', 100)
      ]
    }
  ],

  documents: [
    {
      field: 'documents',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.arrayMinLength('documents', 1),
        (value: unknown) => {
          if (!Array.isArray(value)) return null;
          
          const incompleteUploads = value.filter(doc => 
            doc.uploadStatus !== 'completed'
          );
          
          if (incompleteUploads.length > 0) {
            return {
              field: 'documents',
              message: `${incompleteUploads.length} document(s) are still uploading or failed`,
              priority: ErrorPriority.CRITICAL,
              suggestion: 'Wait for uploads to complete or retry failed uploads'
            };
          }
          
          const documentsWithErrors = value.filter(doc => 
            doc.validationErrors && doc.validationErrors.length > 0
          );
          
          if (documentsWithErrors.length > 0) {
            return {
              field: 'documents',
              message: `${documentsWithErrors.length} document(s) have validation errors`,
              priority: ErrorPriority.HIGH,
              suggestion: 'Fix document validation errors or replace invalid documents'
            };
          }
          
          return null;
        }
      ],
      successMessage: 'All documents uploaded successfully!'
    }
  ],

  specializations: [
    {
      field: 'specializations',
      required: true,
      priority: ErrorPriority.CRITICAL,
      validators: [
        validators.arrayMinLength('specializations', 1),
        validators.arrayMaxLength('specializations', 5),
        (value: unknown) => {
          if (!Array.isArray(value)) return null;
          
          for (let i = 0; i < value.length; i++) {
            const spec = value[i];
            
            if (!spec.specializationId) {
              return {
                field: 'specializations',
                message: `Specialization ${i + 1} is missing selection`,
                priority: ErrorPriority.HIGH,
                suggestion: 'Select a practice area for each specialization'
              };
            }
            
            if (spec.yearsOfExperience === undefined || spec.yearsOfExperience === null) {
              return {
                field: 'specializations',
                message: `Years of experience required for specialization ${i + 1}`,
                priority: ErrorPriority.HIGH,
                suggestion: 'Enter years of experience (0 if new to this area)'
              };
            }
            
            if (!Number.isInteger(spec.yearsOfExperience) || spec.yearsOfExperience < 0) {
              return {
                field: 'specializations',
                message: `Invalid experience value for specialization ${i + 1}`,
                priority: ErrorPriority.HIGH,
                suggestion: 'Enter a whole number (0 or greater)'
              };
            }
            
            if (spec.yearsOfExperience > 70) {
              return {
                field: 'specializations',
                message: `Experience seems too high for specialization ${i + 1}`,
                priority: ErrorPriority.MEDIUM,
                suggestion: 'Please verify the years of experience'
              };
            }
          }
          
          return null;
        }
      ],
      successMessage: 'Specializations configured correctly!'
    }
  ],

  review: [],
  submitted: []
};

/**
 * Enhanced validation engine class
 */
export class ValidationEngine {
  /**
   * Validate a specific step with enhanced error handling
   */
  static validateStep(step: OnboardingStep, state: EnhancedOnboardingState): ValidationResult {
    const configs = STEP_VALIDATIONS[step] || [];
    const errors: Array<EnhancedValidationError> = [];
    const warnings: Array<EnhancedValidationError> = [];
    const successMessages: Array<string> = [];

    // For review step, validate all previous steps
    if (step === 'review') {
      const practiceResult = this.validateStep('practice_info', state);
      const documentsResult = this.validateStep('documents', state);
      const specializationsResult = this.validateStep('specializations', state);
      
      errors.push(...practiceResult.errors);
      warnings.push(...practiceResult.warnings);
      errors.push(...documentsResult.errors);
      warnings.push(...documentsResult.warnings);
      errors.push(...specializationsResult.errors);
      warnings.push(...specializationsResult.warnings);
    } else {
      // Validate current step
      for (const config of configs) {
        const value = this.extractFieldValue(config.field, state);
        
        for (const validator of config.validators) {
          const error = validator(value, state);
          if (error) {
            if (error.priority <= ErrorPriority.HIGH) {
              errors.push(error);
            } else {
              warnings.push(error);
            }
            break; // Stop at first error for this field
          }
        }
        
        // Add success message if field is valid and has success message
        if (config.successMessage && !errors.some(e => e.field === config.field)) {
          successMessages.push(config.successMessage);
        }
      }
    }

    // Sort errors by priority
    errors.sort((a, b) => a.priority - b.priority);
    warnings.sort((a, b) => a.priority - b.priority);

    const hasBlockingErrors = errors.some(e => e.priority === ErrorPriority.CRITICAL);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: !hasBlockingErrors,
      hasBlockingErrors,
      successMessage: successMessages.length > 0 ? successMessages.join(' ') : undefined
    };
  }

  /**
   * Validate a specific field with immediate feedback
   */
  static validateField(
    step: OnboardingStep, 
    fieldName: string, 
    value: unknown, 
    state: EnhancedOnboardingState
  ): ValidationResult {
    const configs = STEP_VALIDATIONS[step] || [];
    const config = configs.find(c => c.field === fieldName);
    
    if (!config) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        canProceed: true,
        hasBlockingErrors: false
      };
    }

    const errors: Array<EnhancedValidationError> = [];
    const warnings: Array<EnhancedValidationError> = [];

    for (const validator of config.validators) {
      const error = validator(value, state);
      if (error) {
        if (error.priority <= ErrorPriority.HIGH) {
          errors.push(error);
        } else {
          warnings.push(error);
        }
        break; // Stop at first error
      }
    }

    const hasBlockingErrors = errors.some(e => e.priority === ErrorPriority.CRITICAL);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: !hasBlockingErrors,
      hasBlockingErrors,
      successMessage: errors.length === 0 && config.successMessage ? config.successMessage : undefined
    };
  }

  /**
   * Get prioritized error messages for display
   */
  static getPrioritizedErrors(result: ValidationResult): Array<EnhancedValidationError> {
    // Show only the most critical errors first
    const criticalErrors = result.errors.filter(e => e.priority === ErrorPriority.CRITICAL);
    if (criticalErrors.length > 0) {
      return criticalErrors.slice(0, 3); // Show max 3 critical errors
    }

    const highErrors = result.errors.filter(e => e.priority === ErrorPriority.HIGH);
    if (highErrors.length > 0) {
      return highErrors.slice(0, 2); // Show max 2 high priority errors
    }

    return result.errors.slice(0, 1); // Show 1 other error
  }

  /**
   * Clear error state for successful validation
   */
  static clearFieldErrors(fieldName: string, state: EnhancedOnboardingState): void {
    // This would be called by the store to clear errors
    const currentErrors = { ...state.errors };
    delete currentErrors[fieldName];
    // Store update would happen in the calling component
  }

  /**
   * Extract field value from state based on field path
   */
  private static extractFieldValue(field: string, state: EnhancedOnboardingState): unknown {
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'email':
      case 'phoneNumber':
      case 'country':
      case 'state':
      case 'city':
        return state.practiceInfo[field as keyof typeof state.practiceInfo];
      case 'documents':
        return state.documents;
      case 'specializations':
        return state.specializations;
      default:
        return undefined;
    }
  }

  /**
   * Check if field is required for a step
   */
  static isFieldRequired(step: OnboardingStep, fieldName: string): boolean {
    const configs = STEP_VALIDATIONS[step] || [];
    const config = configs.find(c => c.field === fieldName);
    return config?.required || false;
  }

  /**
   * Get all required fields for a step
   */
  static getRequiredFields(step: OnboardingStep): Array<string> {
    const configs = STEP_VALIDATIONS[step] || [];
    return configs.filter(c => c.required).map(c => c.field);
  }

  /**
   * Validate multiple steps at once
   */
  static validateMultipleSteps(
    steps: Array<OnboardingStep>, 
    state: EnhancedOnboardingState
  ): Record<OnboardingStep, ValidationResult> {
    const results: Record<OnboardingStep, ValidationResult> = {} as Record<OnboardingStep, ValidationResult>;
    
    for (const step of steps) {
      results[step] = this.validateStep(step, state);
    }
    
    return results;
  }

  /**
   * Get validation summary for the entire onboarding process
   */
  static getValidationSummary(state: EnhancedOnboardingState) {
    const steps: Array<OnboardingStep> = ['practice_info', 'documents', 'specializations'];
    const results = this.validateMultipleSteps(steps, state);
    
    const totalErrors = Object.values(results).reduce(
      (sum, result) => sum + result.errors.length, 
      0
    );
    
    const totalWarnings = Object.values(results).reduce(
      (sum, result) => sum + result.warnings.length, 
      0
    );
    
    const validSteps = Object.entries(results)
      .filter(([_, result]) => result.isValid)
      .map(([step, _]) => step as OnboardingStep);
    
    const invalidSteps = Object.entries(results)
      .filter(([_, result]) => !result.isValid)
      .map(([step, _]) => step as OnboardingStep);
    
    const canProceedSteps = Object.entries(results)
      .filter(([_, result]) => result.canProceed)
      .map(([step, _]) => step as OnboardingStep);
    
    return {
      totalErrors,
      totalWarnings,
      validSteps,
      invalidSteps,
      canProceedSteps,
      isAllValid: totalErrors === 0,
      canCompleteOnboarding: invalidSteps.length === 0,
      results
    };
  }
}

/**
 * React hook for field validation with immediate feedback
 */
export function useFieldValidation(
  step: OnboardingStep,
  fieldName: string,
  value: unknown,
  state: EnhancedOnboardingState
) {
  const result = ValidationEngine.validateField(step, fieldName, value, state);
  const isRequired = ValidationEngine.isFieldRequired(step, fieldName);
  
  return {
    ...result,
    isRequired,
    hasError: result.errors.length > 0,
    hasWarning: result.warnings.length > 0,
    primaryError: result.errors[0] || null,
    primaryWarning: result.warnings[0] || null
  };
}