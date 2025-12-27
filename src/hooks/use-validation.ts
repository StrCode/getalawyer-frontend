import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  type OnboardingStep, 
  useEnhancedOnboardingStore 
} from '@/stores/enhanced-onboarding-store';
import { 
  type EnhancedValidationError,
  ErrorPriority, 
  ValidationEngine, 
  type ValidationResult 
} from '@/utils/validation-engine';

/**
 * Hook for managing validation state and providing validation utilities
 */
export function useValidation(step: OnboardingStep) {
  const store = useEnhancedOnboardingStore();
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    canProceed: true,
    hasBlockingErrors: false
  });

  // Validate the current step
  const validateCurrentStep = useCallback(() => {
    const result = ValidationEngine.validateStep(step, store);
    setValidationState(result);
    
    // Update store errors
    const errorsByField: Record<string, Array<string>> = {};
    result.errors.forEach(error => {
      if (!errorsByField[error.field]) {
        errorsByField[error.field] = [];
      }
      errorsByField[error.field].push(error.message);
    });
    
    // Clear existing errors for this step and set new ones
    store.clearAllErrors();
    Object.entries(errorsByField).forEach(([field, messages]) => {
      store.setError(field, messages);
    });
    
    return result;
  }, [step, store]);

  // Validate a specific field
  const validateField = useCallback((fieldName: string, value: unknown) => {
    const result = ValidationEngine.validateField(step, fieldName, value, store);
    
    if (result.errors.length > 0) {
      store.setError(fieldName, result.errors.map(e => e.message));
    } else {
      store.clearError(fieldName);
    }
    
    return result;
  }, [step, store]);

  // Clear validation errors for a field
  const clearFieldErrors = useCallback((fieldName: string) => {
    store.clearError(fieldName);
  }, [store]);

  // Clear all validation errors
  const clearAllErrors = useCallback(() => {
    store.clearAllErrors();
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      canProceed: true,
      hasBlockingErrors: false
    });
  }, [store]);

  // Get prioritized errors for display
  const prioritizedErrors = useMemo(() => {
    return ValidationEngine.getPrioritizedErrors(validationState);
  }, [validationState]);

  // Get field-specific validation result
  const getFieldValidation = useCallback((fieldName: string, value: unknown) => {
    return ValidationEngine.validateField(step, fieldName, value, store);
  }, [step, store]);

  // Check if field is required
  const isFieldRequired = useCallback((fieldName: string) => {
    return ValidationEngine.isFieldRequired(step, fieldName);
  }, [step]);

  // Auto-validate on store changes
  useEffect(() => {
    validateCurrentStep();
  }, [validateCurrentStep]);

  return {
    // Validation state
    validationState,
    isValid: validationState.isValid,
    canProceed: validationState.canProceed,
    hasErrors: validationState.errors.length > 0,
    hasWarnings: validationState.warnings.length > 0,
    hasBlockingErrors: validationState.hasBlockingErrors,
    
    // Error collections
    errors: validationState.errors,
    warnings: validationState.warnings,
    prioritizedErrors,
    
    // Validation functions
    validateCurrentStep,
    validateField,
    getFieldValidation,
    
    // Error management
    clearFieldErrors,
    clearAllErrors,
    
    // Utilities
    isFieldRequired
  };
}

/**
 * Hook for field-level validation with real-time feedback
 */
export function useFieldValidation(
  step: OnboardingStep,
  fieldName: string,
  value: unknown
) {
  const store = useEnhancedOnboardingStore();
  const [fieldState, setFieldState] = useState<{
    isValid: boolean;
    error: EnhancedValidationError | null;
    warning: EnhancedValidationError | null;
    isValidating: boolean;
  }>({
    isValid: true,
    error: null,
    warning: null,
    isValidating: false
  });

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateField = useCallback((immediate = false) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const performValidation = () => {
      setFieldState(prev => ({ ...prev, isValidating: true }));
      
      const result = ValidationEngine.validateField(step, fieldName, value, store);
      
      setFieldState({
        isValid: result.isValid,
        error: result.errors[0] || null,
        warning: result.warnings[0] || null,
        isValidating: false
      });

      // Update store
      if (result.errors.length > 0) {
        store.setError(fieldName, result.errors.map(e => e.message));
      } else {
        store.clearError(fieldName);
      }
    };

    if (immediate) {
      performValidation();
    } else {
      // Debounce validation by 300ms
      const timeout = setTimeout(performValidation, 300);
      setValidationTimeout(timeout);
    }
  }, [step, fieldName, value, store, validationTimeout]);

  // Validate immediately on critical changes
  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      validateField(true); // Immediate validation for empty values
    } else {
      validateField(false); // Debounced validation for other changes
    }
  }, [value, validateField]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const isRequired = ValidationEngine.isFieldRequired(step, fieldName);

  return {
    isValid: fieldState.isValid,
    error: fieldState.error,
    warning: fieldState.warning,
    isValidating: fieldState.isValidating,
    isRequired,
    hasError: !!fieldState.error,
    hasWarning: !!fieldState.warning,
    
    // Manual validation trigger
    validate: () => validateField(true),
    
    // Error message for display
    errorMessage: fieldState.error?.message,
    warningMessage: fieldState.warning?.message,
    
    // Suggestion for fixing error
    suggestion: fieldState.error?.suggestion || fieldState.warning?.suggestion
  };
}

/**
 * Hook for managing success state and positive feedback
 */
export function useSuccessState(step: OnboardingStep) {
  const [successMessages, setSuccessMessages] = useState<Array<string>>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const addSuccessMessage = useCallback((message: string) => {
    setSuccessMessages(prev => [...prev, message]);
    setShowSuccess(true);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setTimeout(() => {
        setSuccessMessages(prev => prev.filter(m => m !== message));
      }, 300); // Wait for fade out animation
    }, 3000);
  }, []);

  const clearSuccessMessages = useCallback(() => {
    setSuccessMessages([]);
    setShowSuccess(false);
  }, []);

  return {
    successMessages,
    showSuccess,
    hasSuccess: successMessages.length > 0,
    addSuccessMessage,
    clearSuccessMessages
  };
}

/**
 * Hook for error prioritization and display management
 */
export function useErrorDisplay() {
  const [displayedErrors, setDisplayedErrors] = useState<Array<EnhancedValidationError>>([]);
  const [errorDisplayMode, setErrorDisplayMode] = useState<'minimal' | 'detailed'>('minimal');

  const updateDisplayedErrors = useCallback((errors: Array<EnhancedValidationError>) => {
    if (errorDisplayMode === 'minimal') {
      // Show only the most critical errors
      const criticalErrors = errors.filter(e => e.priority === ErrorPriority.CRITICAL);
      if (criticalErrors.length > 0) {
        setDisplayedErrors(criticalErrors.slice(0, 2));
        return;
      }

      const highErrors = errors.filter(e => e.priority === ErrorPriority.HIGH);
      if (highErrors.length > 0) {
        setDisplayedErrors(highErrors.slice(0, 1));
        return;
      }

      setDisplayedErrors(errors.slice(0, 1));
    } else {
      // Show all errors, grouped by priority
      setDisplayedErrors(errors.sort((a, b) => a.priority - b.priority));
    }
  }, [errorDisplayMode]);

  const toggleDisplayMode = useCallback(() => {
    setErrorDisplayMode(prev => prev === 'minimal' ? 'detailed' : 'minimal');
  }, []);

  return {
    displayedErrors,
    errorDisplayMode,
    updateDisplayedErrors,
    toggleDisplayMode,
    isMinimalMode: errorDisplayMode === 'minimal'
  };
}

/**
 * Hook for validation summary across all steps
 */
export function useValidationSummary() {
  const store = useEnhancedOnboardingStore();
  
  const summary = useMemo(() => {
    return ValidationEngine.getValidationSummary(store);
  }, [store]);

  const getStepValidationStatus = useCallback((step: OnboardingStep) => {
    const result = summary.results[step];
    if (!result) return 'unknown';
    
    if (result.isValid) return 'valid';
    if (result.canProceed) return 'warning';
    return 'error';
  }, [summary]);

  return {
    summary,
    totalErrors: summary.totalErrors,
    totalWarnings: summary.totalWarnings,
    isAllValid: summary.isAllValid,
    canCompleteOnboarding: summary.canCompleteOnboarding,
    validSteps: summary.validSteps,
    invalidSteps: summary.invalidSteps,
    getStepValidationStatus
  };
}