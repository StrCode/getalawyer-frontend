import { 
  EnhancedOnboardingState, 
  OnboardingStep, 
  StepValidationResult,
  ValidationError 
} from '@/stores/enhanced-onboarding-store';

/**
 * Validation rules for each step
 */
export interface ValidationRule {
  field: string;
  validator: (value: any, state: EnhancedOnboardingState) => string | null;
  required?: boolean;
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation (basic international format)
 */
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;

/**
 * Validation rules for practice info step
 */
const PRACTICE_INFO_RULES: ValidationRule[] = [
  {
    field: 'firstName',
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) return 'First name is required';
      if (value.trim().length < 2) return 'First name must be at least 2 characters';
      if (value.trim().length > 50) return 'First name must be less than 50 characters';
      return null;
    }
  },
  {
    field: 'lastName',
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) return 'Last name is required';
      if (value.trim().length < 2) return 'Last name must be at least 2 characters';
      if (value.trim().length > 50) return 'Last name must be less than 50 characters';
      return null;
    }
  },
  {
    field: 'email',
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) return 'Email address is required';
      if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
      return null;
    }
  },
  {
    field: 'phoneNumber',
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) return 'Phone number is required';
      if (!PHONE_REGEX.test(value.trim())) return 'Please enter a valid phone number';
      return null;
    }
  },
  {
    field: 'country',
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) return 'Country is required';
      return null;
    }
  },
  {
    field: 'city',
    required: false,
    validator: (value: string) => {
      if (value && value.length > 100) return 'City name must be less than 100 characters';
      return null;
    }
  }
];

/**
 * Validation rules for documents step
 */
const DOCUMENTS_RULES: ValidationRule[] = [
  {
    field: 'documents',
    required: true,
    validator: (value: any[]) => {
      if (!value || value.length === 0) {
        return 'At least one document is required';
      }
      
      // Check for incomplete uploads
      const incompleteUploads = value.filter(doc => 
        doc.uploadStatus !== 'completed'
      );
      
      if (incompleteUploads.length > 0) {
        return `${incompleteUploads.length} document(s) are still uploading or failed to upload`;
      }
      
      // Check for validation errors
      const documentsWithErrors = value.filter(doc => 
        doc.validationErrors && doc.validationErrors.length > 0
      );
      
      if (documentsWithErrors.length > 0) {
        return `${documentsWithErrors.length} document(s) have validation errors`;
      }
      
      return null;
    }
  }
];

/**
 * Validation rules for specializations step
 */
const SPECIALIZATIONS_RULES: ValidationRule[] = [
  {
    field: 'specializations',
    required: true,
    validator: (value: any[]) => {
      if (!value || value.length === 0) {
        return 'At least one specialization is required';
      }
      
      if (value.length > 5) {
        return 'Maximum 5 specializations allowed';
      }
      
      // Validate each specialization
      for (let i = 0; i < value.length; i++) {
        const spec = value[i];
        
        if (!spec.specializationId) {
          return `Specialization ${i + 1} is missing an ID`;
        }
        
        if (spec.yearsOfExperience === undefined || spec.yearsOfExperience === null) {
          return `Years of experience is required for specialization ${i + 1}`;
        }
        
        if (!Number.isInteger(spec.yearsOfExperience) || spec.yearsOfExperience < 0) {
          return `Years of experience must be a non-negative integer for specialization ${i + 1}`;
        }
        
        if (spec.yearsOfExperience > 70) {
          return `Years of experience seems too high for specialization ${i + 1}`;
        }
      }
      
      return null;
    }
  }
];

/**
 * Get validation rules for a specific step
 */
function getValidationRules(step: OnboardingStep): ValidationRule[] {
  switch (step) {
    case 'practice_info':
      return PRACTICE_INFO_RULES;
    case 'documents':
      return DOCUMENTS_RULES;
    case 'specializations':
      return SPECIALIZATIONS_RULES;
    case 'review':
      // Review step validates all previous steps
      return [
        ...PRACTICE_INFO_RULES,
        ...DOCUMENTS_RULES,
        ...SPECIALIZATIONS_RULES
      ];
    default:
      return [];
  }
}

/**
 * Validate a specific step with detailed error reporting
 */
export function validateStep(
  step: OnboardingStep, 
  state: EnhancedOnboardingState
): StepValidationResult {
  const rules = getValidationRules(step);
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    let value: any;
    
    // Extract the value based on the field path
    switch (rule.field) {
      case 'firstName':
      case 'lastName':
      case 'email':
      case 'phoneNumber':
      case 'country':
      case 'state':
      case 'city':
        value = state.practiceInfo[rule.field as keyof typeof state.practiceInfo];
        break;
      case 'documents':
        value = state.documents;
        break;
      case 'specializations':
        value = state.specializations;
        break;
      default:
        continue;
    }

    const error = rule.validator(value, state);
    if (error) {
      errors.push({
        field: rule.field,
        message: error,
        code: `${step}_${rule.field}_invalid`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    canProceed: errors.length === 0
  };
}

/**
 * Validate a specific field within a step
 */
export function validateField(
  step: OnboardingStep,
  field: string,
  value: any,
  state: EnhancedOnboardingState
): ValidationError | null {
  const rules = getValidationRules(step);
  const rule = rules.find(r => r.field === field);
  
  if (!rule) return null;
  
  const error = rule.validator(value, state);
  if (error) {
    return {
      field,
      message: error,
      code: `${step}_${field}_invalid`
    };
  }
  
  return null;
}

/**
 * Check if a field is required for a specific step
 */
export function isFieldRequired(step: OnboardingStep, field: string): boolean {
  const rules = getValidationRules(step);
  const rule = rules.find(r => r.field === field);
  return rule?.required || false;
}

/**
 * Get all required fields for a step
 */
export function getRequiredFields(step: OnboardingStep): string[] {
  const rules = getValidationRules(step);
  return rules.filter(rule => rule.required).map(rule => rule.field);
}

/**
 * Validate multiple steps at once
 */
export function validateMultipleSteps(
  steps: OnboardingStep[],
  state: EnhancedOnboardingState
): Record<OnboardingStep, StepValidationResult> {
  const results: Record<OnboardingStep, StepValidationResult> = {} as any;
  
  for (const step of steps) {
    results[step] = validateStep(step, state);
  }
  
  return results;
}

/**
 * Check if all required steps are valid
 */
export function areAllRequiredStepsValid(state: EnhancedOnboardingState): boolean {
  const requiredSteps: OnboardingStep[] = ['practice_info', 'documents', 'specializations'];
  
  for (const step of requiredSteps) {
    const result = validateStep(step, state);
    if (!result.isValid) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get validation summary for all steps
 */
export function getValidationSummary(state: EnhancedOnboardingState) {
  const steps: OnboardingStep[] = ['practice_info', 'documents', 'specializations', 'review'];
  const results = validateMultipleSteps(steps, state);
  
  const totalErrors = Object.values(results).reduce(
    (sum, result) => sum + result.errors.length, 
    0
  );
  
  const validSteps = Object.entries(results).filter(
    ([_, result]) => result.isValid
  ).map(([step, _]) => step as OnboardingStep);
  
  const invalidSteps = Object.entries(results).filter(
    ([_, result]) => !result.isValid
  ).map(([step, _]) => step as OnboardingStep);
  
  return {
    totalErrors,
    validSteps,
    invalidSteps,
    isAllValid: totalErrors === 0,
    results
  };
}

/**
 * Custom validation hook for real-time field validation
 */
export function useFieldValidation(
  step: OnboardingStep,
  field: string,
  value: any,
  state: EnhancedOnboardingState
) {
  const error = validateField(step, field, value, state);
  const isRequired = isFieldRequired(step, field);
  
  return {
    error,
    isValid: !error,
    isRequired,
    hasError: !!error
  };
}