// Enhanced onboarding utilities


// Re-export store types and utilities
export {
  type ApplicationStatus,
  clearEnhancedOnboardingStore,
  type DocumentData,
  type EnhancedOnboardingState,
  type OnboardingStep,
  type SpecializationData,
  STEP_DEFINITIONS,
  type StepDefinition,
  type StepValidationResult,
  useEnhancedOnboardingStore,
  type ValidationError,
} from '../stores/enhanced-onboarding-store';
export * from './draft-manager';
export * from './progress-tracker';
export * from './step-validator';