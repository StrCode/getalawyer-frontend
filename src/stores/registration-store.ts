import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REGISTRATION_STORAGE_KEYS } from '@/constants/registration';
import type {
  AccountCreationFormData,
  DocumentUploadFormData,
  NINVerificationFormData,
  NINVerificationResult,
  PersonalInfoFormData,
  PracticeInfoFormData,
  ProfessionalInfoFormData,
  RegistrationStatus,
} from '@/types/registration';

// Registration Store State Interface
export interface RegistrationStore {
  // Current registration status
  registrationStatus: RegistrationStatus;
  
  // Form data for each step (cached locally)
  step1Data: Partial<AccountCreationFormData>;
  step2Data: Partial<PersonalInfoFormData>;
  step3Data: Partial<NINVerificationFormData>;
  step4Data: Partial<ProfessionalInfoFormData>;
  step5Data: Partial<PracticeInfoFormData>;
  step6Data: Partial<DocumentUploadFormData>;
  
  // NIN verification result
  ninVerificationResult: NINVerificationResult | null;
  
  // UI state
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  
  // Actions for registration status
  setRegistrationStatus: (status: RegistrationStatus) => void;
  
  // Actions for updating each step's data
  updateStep1Data: (data: Partial<AccountCreationFormData>) => void;
  updateStep2Data: (data: Partial<PersonalInfoFormData>) => void;
  updateStep3Data: (data: Partial<NINVerificationFormData>) => void;
  updateStep4Data: (data: Partial<ProfessionalInfoFormData>) => void;
  updateStep5Data: (data: Partial<PracticeInfoFormData>) => void;
  updateStep6Data: (data: Partial<DocumentUploadFormData>) => void;
  
  // NIN verification result action
  setNINVerificationResult: (result: NINVerificationResult | null) => void;
  
  // UI state actions
  setIsLoading: (loading: boolean) => void;
  updateLastSaved: () => void;
  
  // Utility actions
  clearRegistrationData: () => void;
  hydrateFromLocalStorage: () => void;
  persistToLocalStorage: () => void;
}

// Initial state
const initialState = {
  registrationStatus: 'step1' as RegistrationStatus,
  step1Data: {},
  step2Data: {},
  step3Data: {},
  step4Data: {},
  step5Data: {},
  step6Data: {},
  ninVerificationResult: null,
  isLoading: false,
  hasUnsavedChanges: false,
  lastSaved: null,
};

// Create the Zustand store with persistence
export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Registration status management
      setRegistrationStatus: (status: RegistrationStatus) => {
        set({ registrationStatus: status });
      },
      
      // Step data update actions
      updateStep1Data: (data: Partial<AccountCreationFormData>) => {
        set((state) => ({
          step1Data: { ...state.step1Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      updateStep2Data: (data: Partial<PersonalInfoFormData>) => {
        set((state) => ({
          step2Data: { ...state.step2Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      updateStep3Data: (data: Partial<NINVerificationFormData>) => {
        set((state) => ({
          step3Data: { ...state.step3Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      updateStep4Data: (data: Partial<ProfessionalInfoFormData>) => {
        set((state) => ({
          step4Data: { ...state.step4Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      updateStep5Data: (data: Partial<PracticeInfoFormData>) => {
        set((state) => ({
          step5Data: { ...state.step5Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      updateStep6Data: (data: Partial<DocumentUploadFormData>) => {
        set((state) => ({
          step6Data: { ...state.step6Data, ...data },
          hasUnsavedChanges: true,
        }));
      },
      
      // NIN verification result
      setNINVerificationResult: (result: NINVerificationResult | null) => {
        set({ ninVerificationResult: result });
      },
      
      // UI state actions
      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateLastSaved: () => {
        set({
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        });
      },
      
      // Utility actions
      clearRegistrationData: () => {
        set(initialState);
        // Clear localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT);
        }
      },
      
      hydrateFromLocalStorage: () => {
        if (typeof localStorage !== 'undefined') {
          try {
            const stored = localStorage.getItem(REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.state) {
                set(parsed.state);
              }
            }
          } catch (error) {
            console.error('Error hydrating from localStorage:', error);
          }
        }
      },
      
      persistToLocalStorage: () => {
        if (typeof localStorage !== 'undefined') {
          try {
            const state = get();
            const dataToStore = {
              registrationStatus: state.registrationStatus,
              step1Data: state.step1Data,
              step2Data: state.step2Data,
              step3Data: state.step3Data,
              step4Data: state.step4Data,
              step5Data: state.step5Data,
              step6Data: state.step6Data,
              ninVerificationResult: state.ninVerificationResult,
              lastSaved: state.lastSaved,
            };
            localStorage.setItem(
              REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT,
              JSON.stringify({ state: dataToStore })
            );
          } catch (error) {
            console.error('Error persisting to localStorage:', error);
          }
        }
      },
    }),
    {
      name: REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT,
      partialize: (state) => ({
        registrationStatus: state.registrationStatus,
        step1Data: state.step1Data,
        step2Data: state.step2Data,
        step3Data: state.step3Data,
        step4Data: state.step4Data,
        step5Data: state.step5Data,
        step6Data: state.step6Data,
        ninVerificationResult: state.ninVerificationResult,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Helper function to clear the registration store
export const clearRegistrationStore = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT);
  }
};

// Helper function to migrate old data format (if needed)
export const migrateRegistrationStorageData = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(REGISTRATION_STORAGE_KEYS.REGISTRATION_DRAFT);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if dates are properly formatted
        if (parsed.state) {
          const needsMigration =
            parsed.state.lastSaved &&
            typeof parsed.state.lastSaved === 'string' &&
            !parsed.state.lastSaved.includes('T');

          if (needsMigration) {
            console.log('Migrating old registration storage format...');
            clearRegistrationStore();
          }
        }
      }
    } catch (error) {
      console.warn('Error checking registration storage data, clearing:', error);
      clearRegistrationStore();
    }
  }
};

// Run migration check on module load
if (typeof window !== 'undefined') {
  migrateRegistrationStorageData();
}
