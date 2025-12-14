import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface CasePreferences {
  minCaseValue?: number;
  maxConcurrentCases?: number;
  acceptsRemote: boolean;
}

interface LawyerOnboardingState {
  // Step 1: Basic Information
  firstName: string;
  middleName: string;
  lastName: string;
  country: string;
  state: string;
  city: string;
  phoneNumber: string;
  email: string;

  // Step 2: Professional Credentials
  barNumber: string;
  admissionYear: number | null;
  lawSchool: string;
  graduationYear: number | null;
  currentFirm: string;
  yearsOfExperience: number | null;
  additionalBarMemberships: Array<string>;

  // Step 3: Legal Specializations
  practiceAreas: Array<string>; // Array of specialization IDs
  subSpecializations: Array<string>;
  languages: Array<string>;

  // Step 4: Profile & Availability
  bio: string;
  profilePhotoUrl: string; // Store URL after upload
  hourlyRate: number | null;
  availability: Array<AvailabilitySlot>;
  casePreferences: CasePreferences;

  // UI state
  currentStep: number;
  lastSaved: Date | null;

  // Actions - Step 1
  setLastName: (name: string) => void;
  setFirstName: (name: string) => void;
  setMiddleName: (name: string) => void;
  setCountry: (country: string) => void;
  setState: (state: string) => void;
  setCity: (city: string) => void;
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;

  // Actions - Step 2
  setBarNumber: (barNumber: string) => void;
  setAdmissionYear: (year: number | null) => void;
  setLawSchool: (school: string) => void;
  setGraduationYear: (year: number | null) => void;
  setCurrentFirm: (firm: string) => void;
  setYearsOfExperience: (years: number | null) => void;
  toggleBarMembership: (membership: string) => void;

  // Actions - Step 3
  togglePracticeArea: (areaId: string) => void;
  setPracticeAreas: (areas: Array<string>) => void;
  toggleSubSpecialization: (specId: string) => void;
  toggleLanguage: (language: string) => void;

  // Actions - Step 4
  setBio: (bio: string) => void;
  setProfilePhotoUrl: (url: string) => void;
  setHourlyRate: (rate: number | null) => void;
  addAvailabilitySlot: (slot: AvailabilitySlot) => void;
  removeAvailabilitySlot: (index: number) => void;
  updateAvailabilitySlot: (index: number, slot: AvailabilitySlot) => void;
  setCasePreferences: (preferences: Partial<CasePreferences>) => void;

  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Utility
  updateLastSaved: () => void;
  resetForm: () => void;
}

const initialState = {
  // Step 1
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  country: "",
  state: "",
  city: "",
  phoneNumber: "",

  // Step 2
  barNumber: "",
  admissionYear: null,
  lawSchool: "",
  graduationYear: null,
  currentFirm: "",
  yearsOfExperience: null,
  additionalBarMemberships: [],

  // Step 3
  practiceAreas: [],
  subSpecializations: [],
  languages: [],

  // Step 4
  bio: "",
  profilePhotoUrl: "",
  hourlyRate: null,
  availability: [],
  casePreferences: {
    acceptsRemote: true,
  },

  // UI
  currentStep: 1,
  lastSaved: null,
};

export const useLawyerOnboardingStore = create<LawyerOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      // Step 1 Actions
      setFirstName: (firstName) => set({ firstName }),
      setMiddleName: (middleName) => set({ middleName }),
      setLastName: (lastName) => set({ lastName }),
      setCountry: (country) => set({ country, state: "" }),
      setState: (state) => set({ state }),
      setCity: (city) => set({ city }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setEmail: (email) => set({ email }),

      // Step 2 Actions
      setBarNumber: (barNumber) => set({ barNumber }),
      setAdmissionYear: (admissionYear) => {
        const currentYear = new Date().getFullYear();
        const yearsOfExperience = admissionYear
          ? currentYear - admissionYear
          : null;
        set({ admissionYear, yearsOfExperience });
      },
      setLawSchool: (lawSchool) => set({ lawSchool }),
      setGraduationYear: (graduationYear) => set({ graduationYear }),
      setCurrentFirm: (currentFirm) => set({ currentFirm }),
      setYearsOfExperience: (yearsOfExperience) => set({ yearsOfExperience }),
      toggleBarMembership: (membership) =>
        set((state) => ({
          additionalBarMemberships: state.additionalBarMemberships.includes(
            membership,
          )
            ? state.additionalBarMemberships.filter((m) => m !== membership)
            : [...state.additionalBarMemberships, membership],
        })),

      // Step 3 Actions
      togglePracticeArea: (areaId) =>
        set((state) => ({
          practiceAreas: state.practiceAreas.includes(areaId)
            ? state.practiceAreas.filter((a) => a !== areaId)
            : state.practiceAreas.length < 5
              ? [...state.practiceAreas, areaId]
              : state.practiceAreas, // Max 5
        })),
      setPracticeAreas: (practiceAreas) => set({ practiceAreas }),
      toggleSubSpecialization: (specId) =>
        set((state) => ({
          subSpecializations: state.subSpecializations.includes(specId)
            ? state.subSpecializations.filter((s) => s !== specId)
            : [...state.subSpecializations, specId],
        })),
      toggleLanguage: (language) =>
        set((state) => ({
          languages: state.languages.includes(language)
            ? state.languages.filter((l) => l !== language)
            : [...state.languages, language],
        })),

      // Step 4 Actions
      setBio: (bio) => set({ bio }),
      setProfilePhotoUrl: (profilePhotoUrl) => set({ profilePhotoUrl }),
      setHourlyRate: (hourlyRate) => set({ hourlyRate }),
      addAvailabilitySlot: (slot) =>
        set((state) => ({
          availability: [...state.availability, slot],
        })),
      removeAvailabilitySlot: (index) =>
        set((state) => ({
          availability: state.availability.filter((_, i) => i !== index),
        })),
      updateAvailabilitySlot: (index, slot) =>
        set((state) => ({
          availability: state.availability.map((s, i) =>
            i === index ? slot : s,
          ),
        })),
      setCasePreferences: (preferences) =>
        set((state) => ({
          casePreferences: { ...state.casePreferences, ...preferences },
        })),

      // Navigation Actions
      setCurrentStep: (currentStep) => set({ currentStep }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      // Utility Actions
      updateLastSaved: () => set({ lastSaved: new Date() }),
      resetForm: () => set(initialState),
    }),
    {
      name: "lawyer-onboarding-draft",
    },
  ),
);

// Helper to clear persisted store
export const clearLawyerOnboardingStore = () => {
  localStorage.removeItem("lawyer-onboarding-draft");
};

// Helper to get completion percentage
export const getOnboardingProgress = (state: LawyerOnboardingState): number => {
  const step1Complete = !!(
    state.firstName &&
    state.lastName &&
    state.country &&
    state.city &&
    state.phoneNumber
  );
  const step2Complete = !!(
    state.barNumber &&
    state.admissionYear &&
    state.lawSchool
  );
  const step3Complete =
    state.practiceAreas.length > 0 && state.languages.length > 0;
  const step4Complete = !!(
    state.bio.length >= 150 &&
    state.profilePhotoUrl &&
    state.hourlyRate !== null &&
    state.availability.length > 0
  );

  const completedSteps = [
    step1Complete,
    step2Complete,
    step3Complete,
    step4Complete,
  ].filter(Boolean).length;
  return (completedSteps / 4) * 100;
};
