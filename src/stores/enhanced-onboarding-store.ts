import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for the simplified onboarding system
export type OnboardingStep = 
  | 'basic_info' 
  | 'credentials' 
  | 'pending_approval';

export type ApplicationStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected';

export interface StepDefinition {
  id: OnboardingStep;
  title: string;
  description: string;
  estimatedMinutes: number;
  required: boolean;
  route: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: Array<ValidationError>;
  canProceed: boolean;
}

export interface CredentialsData {
  barNumber: string;
  nin: string;
  ninVerified: boolean;
  ninVerificationData?: {
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    [key: string]: unknown;
  };
  photograph?: File;
  photographUrl?: string;
  photographPublicId?: string;
}

// Enhanced onboarding state interface
export interface EnhancedOnboardingState {
  // Navigation state
  currentStep: OnboardingStep;
  completedSteps: Array<OnboardingStep>;
  
  // Basic information (Step 1)
  basicInfo: {
    firstName: string;
    middleName: string;
    lastName: string;
    country: string;
    state: string;
    phoneNumber: string;
    email: string;
  };
  
  // Credentials (Step 2)
  credentials: CredentialsData;
  
  // UI state
  isLoading: boolean;
  errors: Record<string, Array<string>>;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  
  // Progress tracking
  progressPercentage: number;
  estimatedTimeRemaining: number;
  
  // Application status
  applicationStatus: ApplicationStatus;
  submissionDate?: Date;
  referenceNumber?: string;
  
  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  markStepCompleted: (step: OnboardingStep) => void;
  canAccessStep: (step: OnboardingStep) => boolean;
  canEditStep: (step: OnboardingStep) => boolean;
  validateStep: (step: OnboardingStep) => StepValidationResult;
  
  // Progress tracking actions
  updateProgress: () => void;
  calculateTimeRemaining: () => number;
  
  // Form data actions
  updateBasicInfo: (data: Partial<EnhancedOnboardingState['basicInfo']>) => void;
  updateCredentials: (data: Partial<CredentialsData>) => void;
  
  // Error handling
  setError: (field: string, errors: Array<string>) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // Application status
  setApplicationStatus: (status: ApplicationStatus) => void;
  setSubmissionDetails: (date: Date, referenceNumber: string) => void;
  
  // Utility
  resetStore: () => void;
  clearFormData: () => void;
  updateLastSaved: () => void;
}

// Step definitions with routing information
export const STEP_DEFINITIONS: Array<StepDefinition> = [
  {
    id: 'basic_info',
    title: 'Basic Information',
    description: 'Personal and contact details',
    estimatedMinutes: 5,
    required: true,
    route: '/onboarding/basics'
  },
  {
    id: 'credentials',
    title: 'Credentials',
    description: 'Bar Number, NIN verification, and photograph',
    estimatedMinutes: 10,
    required: true,
    route: '/onboarding/credentials'
  },
  {
    id: 'pending_approval',
    title: 'Pending Approval',
    description: 'Application submitted for review',
    estimatedMinutes: 0,
    required: false,
    route: '/onboarding/pending'
  }
];

// Initial state
const initialState: Omit<EnhancedOnboardingState, 
  'setCurrentStep' | 'markStepCompleted' | 'canAccessStep' | 'canEditStep' | 'validateStep' |
  'updateProgress' | 'calculateTimeRemaining' | 'updateBasicInfo' | 'updateCredentials' |
  'setError' | 'clearError' | 'clearAllErrors' |
  'setApplicationStatus' | 'setSubmissionDetails' | 'resetStore' | 'updateLastSaved'
> = {
  currentStep: 'basic_info',
  completedSteps: [],
  
  basicInfo: {
    firstName: '',
    middleName: '',
    lastName: '',
    country: '',
    state: '',
    phoneNumber: '',
    email: '',
  },
  
  credentials: {
    barNumber: '',
    nin: '',
    ninVerified: false,
    ninVerificationData: undefined,
    photograph: undefined,
    photographUrl: undefined,
    photographPublicId: undefined,
  },
  
  isLoading: false,
  errors: {},
  hasUnsavedChanges: false,
  lastSaved: null,
  
  progressPercentage: 0,
  estimatedTimeRemaining: 0,
  
  applicationStatus: 'draft',
};

// Helper function to safely convert stored dates (currently unused but kept for future use)
// const ensureDate = (value: unknown): Date | null => {
//   if (!value) return null;
//   if (value instanceof Date) return value;
//   if (typeof value === 'string') {
//     const date = new Date(value);
//     return Number.isNaN(date.getTime()) ? null : date;
//   }
//   return null;
// };

export const useEnhancedOnboardingStore = create<EnhancedOnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Navigation actions
      setCurrentStep: (step: OnboardingStep) => {
        const state = get();
        if (state.canAccessStep(step)) {
          set({ currentStep: step });
        }
      },
      
      markStepCompleted: (step: OnboardingStep) => {
        set((state) => {
          const completedSteps = [...state.completedSteps];
          if (!completedSteps.includes(step)) {
            completedSteps.push(step);
          }
          
          // Calculate progress manually here
          const totalSteps = STEP_DEFINITIONS.filter(def => def.required).length;
          const completedCount = completedSteps.filter(stepId => 
            STEP_DEFINITIONS.find(def => def.id === stepId)?.required
          ).length;
          const progressPercentage = (completedCount / totalSteps) * 100;
          
          // Calculate time remaining manually here
          const remainingSteps = STEP_DEFINITIONS.filter(def => 
            def.required && !completedSteps.includes(def.id)
          );
          const estimatedTimeRemaining = remainingSteps.reduce((sum, stepDef) => sum + stepDef.estimatedMinutes, 0);
          
          return { 
            completedSteps,
            progressPercentage,
            estimatedTimeRemaining
          };
        });
      },
      
      canEditStep: (step: OnboardingStep) => {
        const state = get();
        
        // Can't edit if application is submitted
        if (state.applicationStatus === 'submitted' || state.currentStep === 'pending_approval') {
          return false;
        }
        
        // Can't edit pending_approval step - it's read-only
        if (step === 'pending_approval') {
          return false;
        }
        
        // Can only edit if you can access the step and it's not completed yet
        return state.canAccessStep(step) && step === state.currentStep;
      },
      
      canAccessStep: (step: OnboardingStep) => {
        const state = get();
        
        // Define the sequential step order
        const stepOrder: Array<OnboardingStep> = [
          'basic_info',
          'credentials',
          'pending_approval'
        ];
        
        const targetIndex = stepOrder.indexOf(step);
        const currentIndex = stepOrder.indexOf(state.currentStep);
        
        if (targetIndex === -1 || currentIndex === -1) {
          return false;
        }
        
        // Always allow access to current step
        if (step === state.currentStep) {
          return true;
        }
        
        // Allow access to completed steps (for viewing only)
        if (state.completedSteps.includes(step)) {
          return true;
        }
        
        // For sequential progression: can only access the next step if current step is completed
        if (targetIndex === currentIndex + 1 && state.completedSteps.includes(state.currentStep)) {
          return true;
        }
        
        // Special case: If user is on pending_approval step, they can view credentials
        if (state.currentStep === 'pending_approval' && step === 'credentials') {
          return true;
        }
        
        return false;
      },
      
      validateStep: (step: OnboardingStep): StepValidationResult => {
        const state = get();
        const errors: Array<ValidationError> = [];
        
        switch (step) {
          case 'basic_info': {
            if (!state.basicInfo.firstName.trim()) {
              errors.push({ field: 'firstName', message: 'First name is required' });
            }
            if (!state.basicInfo.lastName.trim()) {
              errors.push({ field: 'lastName', message: 'Last name is required' });
            }
            if (!state.basicInfo.email.trim()) {
              errors.push({ field: 'email', message: 'Email is required' });
            }
            if (!state.basicInfo.phoneNumber.trim()) {
              errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
            }
            if (!state.basicInfo.country.trim()) {
              errors.push({ field: 'country', message: 'Country is required' });
            }
            break;
          }
            
          case 'credentials': {
            if (!state.credentials.barNumber.trim()) {
              errors.push({ field: 'barNumber', message: 'Bar Number is required' });
            }
            if (!state.credentials.nin.trim()) {
              errors.push({ field: 'nin', message: 'NIN is required' });
            }
            if (!state.credentials.ninVerified) {
              errors.push({ field: 'nin', message: 'NIN must be verified' });
            }
            if (!state.credentials.photographUrl && !state.credentials.photograph) {
              errors.push({ field: 'photograph', message: 'Photograph is required' });
            }
            break;
          }
            
          case 'pending_approval': {
            // Pending approval step validation depends on all previous steps being valid
            const basicInfoValid = state.validateStep('basic_info');
            const credentialsValid = state.validateStep('credentials');
            
            errors.push(...basicInfoValid.errors);
            errors.push(...credentialsValid.errors);
            break;
          }
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          canProceed: errors.length === 0
        };
      },
      
      // Progress tracking actions
      updateProgress: () => {
        const state = get();
        const totalSteps = STEP_DEFINITIONS.filter(def => def.required).length;
        const completedCount = state.completedSteps.filter(step => 
          STEP_DEFINITIONS.find(def => def.id === step)?.required
        ).length;
        
        const percentage = (completedCount / totalSteps) * 100;
        set({ progressPercentage: percentage });
        return percentage;
      },
      
      calculateTimeRemaining: () => {
        const state = get();
        const remainingSteps = STEP_DEFINITIONS.filter(def => 
          def.required && !state.completedSteps.includes(def.id)
        );
        
        const totalMinutes = remainingSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
        set({ estimatedTimeRemaining: totalMinutes });
        return totalMinutes;
      },
      
      // Form data actions
      updateBasicInfo: (data) => {
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...data },
          hasUnsavedChanges: true
        }));
      },
      
      updateCredentials: (data) => {
        set((state) => ({
          credentials: { ...state.credentials, ...data },
          hasUnsavedChanges: true
        }));
      },
      
      // Error handling
      setError: (field: string, errors: Array<string>) => {
        set((state) => ({
          errors: { ...state.errors, [field]: errors }
        }));
      },
      
      clearError: (field: string) => {
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        });
      },
      
      clearAllErrors: () => {
        set({ errors: {} });
      },
      
      // Application status
      setApplicationStatus: (status: ApplicationStatus) => {
        set({ applicationStatus: status });
      },
      
      setSubmissionDetails: (date: Date, referenceNumber: string) => {
        set({ 
          submissionDate: date, 
          referenceNumber,
          applicationStatus: 'submitted'
        });
      },
      
      // Utility
      resetStore: () => {
        set(initialState);
      },
      
      clearFormData: () => {
        set((state) => ({
          basicInfo: {
            firstName: '',
            middleName: '',
            lastName: '',
            country: '',
            state: '',
            phoneNumber: '',
            email: '',
          },
          credentials: {
            barNumber: '',
            nin: '',
            ninVerified: false,
            ninVerificationData: undefined,
            photograph: undefined,
            photographUrl: undefined,
            photographPublicId: undefined,
          },
          completedSteps: [],
          currentStep: 'basic_info',
          // Keep applicationStatus as is
        }));
      },
      
      updateLastSaved: () => {
        set({ 
          lastSaved: new Date(),
          hasUnsavedChanges: false
        });
      },
    }),
    {
      name: 'enhanced-lawyer-onboarding',
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        basicInfo: state.basicInfo,
        credentials: state.credentials,
        progressPercentage: state.progressPercentage,
        estimatedTimeRemaining: state.estimatedTimeRemaining,
        applicationStatus: state.applicationStatus,
        submissionDate: state.submissionDate,
        referenceNumber: state.referenceNumber,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Helper function to clear the enhanced store
export const clearEnhancedOnboardingStore = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('enhanced-lawyer-onboarding');
  }
};

// Helper function to migrate old data format (if needed)
export const migrateStorageData = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('enhanced-lawyer-onboarding');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if dates are properly formatted
        if (parsed.state) {
          const needsMigration = 
            (parsed.state.lastSaved && typeof parsed.state.lastSaved === 'string' && !parsed.state.lastSaved.includes('T')) ||
            (parsed.state.lastAutoSave && typeof parsed.state.lastAutoSave === 'string' && !parsed.state.lastAutoSave.includes('T')) ||
            (parsed.state.submissionDate && typeof parsed.state.submissionDate === 'string' && !parsed.state.submissionDate.includes('T'));
          
          if (needsMigration) {
            console.log('Migrating old storage format...');
            clearEnhancedOnboardingStore();
          }
        }
      }
    } catch (error) {
      console.warn('Error checking storage data, clearing:', error);
      clearEnhancedOnboardingStore();
    }
  }
};

// Run migration check on module load
if (typeof window !== 'undefined') {
  migrateStorageData();
}