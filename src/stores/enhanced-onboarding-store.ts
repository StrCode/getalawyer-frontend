import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for the enhanced onboarding system
export type OnboardingStep = 
  | 'practice_info' 
  | 'documents' 
  | 'specializations' 
  | 'review' 
  | 'submitted';

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

export interface SpecializationData {
  specializationId: string;
  yearsOfExperience: number;
  description?: string;
}

export interface DocumentData {
  id: string;
  type: string;
  originalName: string;
  url: string;
  publicId: string;
  fileSize: number;
  uploadProgress?: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedAt: Date;
  validationErrors?: Array<string>;
}

// Enhanced onboarding state interface
export interface EnhancedOnboardingState {
  // Navigation state
  currentStep: OnboardingStep;
  completedSteps: Array<OnboardingStep>;
  
  // Form data (extending existing structure)
  practiceInfo: {
    firstName: string;
    middleName: string;
    lastName: string;
    country: string;
    state: string;
    city: string;
    phoneNumber: string;
    email: string;
  };
  
  // Professional credentials data
  credentials: {
    barNumber: string;
    admissionYear: number;
    lawSchool: string;
    graduationYear: number;
    currentFirm: string;
  };
  
  documents: Array<DocumentData>;
  specializations: Array<SpecializationData>;
  
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
  
  // Draft management
  draftData: Record<OnboardingStep, unknown>;
  autoSaveEnabled: boolean;
  lastAutoSave: Date | null;
  
  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  markStepCompleted: (step: OnboardingStep) => void;
  canAccessStep: (step: OnboardingStep) => boolean;
  canEditStep: (step: OnboardingStep) => boolean;
  validateStep: (step: OnboardingStep) => StepValidationResult;
  
  // Progress tracking actions
  updateProgress: () => void;
  calculateTimeRemaining: () => number;
  
  // Draft management actions
  saveDraft: (step: OnboardingStep, data: unknown) => void;
  restoreDraft: (step: OnboardingStep) => unknown | null;
  clearDraft: (step: OnboardingStep) => void;
  setAutoSave: (enabled: boolean) => void;
  
  // Form data actions
  updatePracticeInfo: (data: Partial<EnhancedOnboardingState['practiceInfo']>) => void;
  updateCredentials: (data: Partial<EnhancedOnboardingState['credentials']>) => void;
  addDocument: (document: DocumentData) => void;
  updateDocument: (id: string, updates: Partial<DocumentData>) => void;
  removeDocument: (id: string) => void;
  addSpecialization: (specialization: SpecializationData) => void;
  updateSpecialization: (id: string, updates: Partial<SpecializationData>) => void;
  removeSpecialization: (id: string) => void;
  
  // Error handling
  setError: (field: string, errors: Array<string>) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // Application status
  setApplicationStatus: (status: ApplicationStatus) => void;
  setSubmissionDetails: (date: Date, referenceNumber: string) => void;
  
  // Utility
  resetStore: () => void;
  updateLastSaved: () => void;
}

// Step definitions with routing information
export const STEP_DEFINITIONS: Array<StepDefinition> = [
  {
    id: 'practice_info',
    title: 'Basic Information',
    description: 'Personal and contact details',
    estimatedMinutes: 5,
    required: true,
    route: '/onboarding/lawyer/basics'
  },
  {
    id: 'documents',
    title: 'Credentials',
    description: 'Professional documents and certifications',
    estimatedMinutes: 10,
    required: true,
    route: '/onboarding/lawyer/credentials'
  },
  {
    id: 'specializations',
    title: 'Specializations',
    description: 'Practice areas and experience',
    estimatedMinutes: 8,
    required: true,
    route: '/onboarding/lawyer/specializations'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and submit application',
    estimatedMinutes: 3,
    required: true,
    route: '/onboarding/lawyer/review'
  },
  {
    id: 'submitted',
    title: 'Submitted',
    description: 'Application submitted successfully',
    estimatedMinutes: 0,
    required: false,
    route: '/onboarding/lawyer/status'
  }
];

// Initial state
const initialState: Omit<EnhancedOnboardingState, 
  'setCurrentStep' | 'markStepCompleted' | 'canAccessStep' | 'canEditStep' | 'validateStep' |
  'updateProgress' | 'calculateTimeRemaining' | 'saveDraft' | 'restoreDraft' |
  'clearDraft' | 'setAutoSave' | 'updatePracticeInfo' | 'updateCredentials' | 'addDocument' |
  'updateDocument' | 'removeDocument' | 'addSpecialization' | 'updateSpecialization' |
  'removeSpecialization' | 'setError' | 'clearError' | 'clearAllErrors' |
  'setApplicationStatus' | 'setSubmissionDetails' | 'resetStore' | 'updateLastSaved'
> = {
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
  
  credentials: {
    barNumber: '',
    admissionYear: new Date().getFullYear() - 5,
    lawSchool: '',
    graduationYear: new Date().getFullYear() - 8,
    currentFirm: '',
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
        if (state.applicationStatus === 'submitted' || state.currentStep === 'submitted') {
          return false;
        }
        
        // Can't edit review step - it's read-only
        if (step === 'review' || step === 'submitted') {
          return false;
        }
        
        // Can only edit if you can access the step and it's not completed yet
        return state.canAccessStep(step) && step === state.currentStep;
      },
      
      canAccessStep: (step: OnboardingStep) => {
        const state = get();
        
        // Define the sequential step order
        const stepOrder: Array<OnboardingStep> = [
          'practice_info',
          'documents', 
          'specializations',
          'review',
          'submitted'
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
        
        // Special case: If user is on submitted step, they can view review
        if (state.currentStep === 'submitted' && step === 'review') {
          return true;
        }
        
        return false;
      },
      
      validateStep: (step: OnboardingStep): StepValidationResult => {
        const state = get();
        const errors: Array<ValidationError> = [];
        
        switch (step) {
          case 'practice_info': {
            if (!state.practiceInfo.firstName.trim()) {
              errors.push({ field: 'firstName', message: 'First name is required' });
            }
            if (!state.practiceInfo.lastName.trim()) {
              errors.push({ field: 'lastName', message: 'Last name is required' });
            }
            if (!state.practiceInfo.email.trim()) {
              errors.push({ field: 'email', message: 'Email is required' });
            }
            if (!state.practiceInfo.phoneNumber.trim()) {
              errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
            }
            if (!state.practiceInfo.country.trim()) {
              errors.push({ field: 'country', message: 'Country is required' });
            }
            break;
          }
            
          case 'documents': {
            if (state.documents.length === 0) {
              errors.push({ field: 'documents', message: 'At least one document is required' });
            }
            // Check for completed uploads
            const incompleteUploads = state.documents.filter(doc => 
              doc.uploadStatus !== 'completed'
            );
            if (incompleteUploads.length > 0) {
              errors.push({ field: 'documents', message: 'All documents must be uploaded successfully' });
            }
            // Validate credentials fields
            if (!state.credentials.barNumber.trim()) {
              errors.push({ field: 'barNumber', message: 'Bar association number is required' });
            }
            if (!state.credentials.lawSchool.trim()) {
              errors.push({ field: 'lawSchool', message: 'Law school is required' });
            }
            if (state.credentials.admissionYear > new Date().getFullYear()) {
              errors.push({ field: 'admissionYear', message: 'Admission year cannot be in the future' });
            }
            if (state.credentials.graduationYear > new Date().getFullYear()) {
              errors.push({ field: 'graduationYear', message: 'Graduation year cannot be in the future' });
            }
            if (state.credentials.graduationYear > state.credentials.admissionYear) {
              errors.push({ field: 'graduationYear', message: 'Graduation year must be before or equal to admission year' });
            }
            break;
          }
            
          case 'specializations': {
            if (state.specializations.length === 0) {
              errors.push({ field: 'specializations', message: 'At least one specialization is required' });
            }
            if (state.specializations.length > 5) {
              errors.push({ field: 'specializations', message: 'Maximum 5 specializations allowed' });
            }
            // Validate experience values
            const invalidExperience = state.specializations.some(spec => 
              spec.yearsOfExperience < 0 || !Number.isInteger(spec.yearsOfExperience)
            );
            if (invalidExperience) {
              errors.push({ field: 'specializations', message: 'Years of experience must be non-negative integers' });
            }
            break;
          }
            
          case 'review': {
            // Review step validation depends on all previous steps being valid
            const practiceInfoValid = state.validateStep('practice_info');
            const documentsValid = state.validateStep('documents');
            const specializationsValid = state.validateStep('specializations');
            
            errors.push(...practiceInfoValid.errors);
            errors.push(...documentsValid.errors);
            errors.push(...specializationsValid.errors);
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
      
      // Draft management actions
      saveDraft: (step: OnboardingStep, data: unknown) => {
        set((state) => ({
          draftData: {
            ...state.draftData,
            [step]: data
          },
          hasUnsavedChanges: true,
          lastAutoSave: new Date()
        }));
      },
      
      restoreDraft: (step: OnboardingStep) => {
        const state = get();
        return state.draftData[step];
      },
      
      clearDraft: (step: OnboardingStep) => {
        set((state) => ({
          draftData: {
            ...state.draftData,
            [step]: null
          },
          hasUnsavedChanges: false
        }));
      },
      
      setAutoSave: (enabled: boolean) => {
        set({ autoSaveEnabled: enabled });
      },
      
      // Form data actions
      updatePracticeInfo: (data) => {
        set((state) => ({
          practiceInfo: { ...state.practiceInfo, ...data },
          hasUnsavedChanges: true
        }));
      },
      
      updateCredentials: (data) => {
        set((state) => ({
          credentials: { ...state.credentials, ...data },
          hasUnsavedChanges: true
        }));
      },
      
      addDocument: (document: DocumentData) => {
        set((state) => ({
          documents: [...state.documents, {
            ...document,
            uploadedAt: document.uploadedAt,
            fileSize: document.fileSize || 0
          }],
          hasUnsavedChanges: true
        }));
      },
      
      updateDocument: (id: string, updates: Partial<DocumentData>) => {
        set((state) => ({
          documents: state.documents.map(doc => 
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          hasUnsavedChanges: true
        }));
      },
      
      removeDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id),
          hasUnsavedChanges: true
        }));
      },
      
      addSpecialization: (specialization: SpecializationData) => {
        set((state) => {
          if (state.specializations.length >= 5) {
            return state; // Don't add if already at max
          }
          return {
            specializations: [...state.specializations, specialization],
            hasUnsavedChanges: true
          };
        });
      },
      
      updateSpecialization: (id: string, updates: Partial<SpecializationData>) => {
        set((state) => ({
          specializations: state.specializations.map(spec => 
            spec.specializationId === id ? { ...spec, ...updates } : spec
          ),
          hasUnsavedChanges: true
        }));
      },
      
      removeSpecialization: (id: string) => {
        set((state) => ({
          specializations: state.specializations.filter(spec => spec.specializationId !== id),
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
        practiceInfo: state.practiceInfo,
        credentials: state.credentials,
        documents: state.documents,
        specializations: state.specializations,
        progressPercentage: state.progressPercentage,
        estimatedTimeRemaining: state.estimatedTimeRemaining,
        applicationStatus: state.applicationStatus,
        submissionDate: state.submissionDate,
        referenceNumber: state.referenceNumber,
        draftData: state.draftData,
        lastSaved: state.lastSaved,
        lastAutoSave: state.lastAutoSave,
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