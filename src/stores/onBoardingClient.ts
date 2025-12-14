import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingClientState {
  // Step 1: Location
  country: string;
  state: string;
  // Step 2: Specializations
  specializations: Array<string>;
  // Actions
  setCountry: (country: string) => void;
  setState: (state: string) => void;
  toggleSpecialization: (specialization: string) => void;
  setSpecializations: (specializations: Array<string>) => void;
  resetForm: () => void;
}

const initialState = {
  country: "",
  state: "",
  specializations: [],
};

export const useOnboardingClientStore = create<OnboardingClientState>()(
  persist(
    (set) => ({
      ...initialState,
      setCountry: (country) => set({ country, state: "" }), // Reset state when country changes
      setState: (state) => set({ state }),
      toggleSpecialization: (specialization) =>
        set((prev) => ({
          specializations: prev.specializations.includes(specialization)
            ? prev.specializations.filter((s) => s !== specialization)
            : [...prev.specializations, specialization],
        })),
      setSpecializations: (specializations) => set({ specializations }),
      resetForm: () => set(initialState),
    }),
    {
      name: "onboarding-form-draft",
      // Optional: Only persist if onboarding is NOT completed
      // This ensures data is cleared when user completes onboarding
    },
  ),
);

// Helper function to manually clear the persisted store
export const clearOnboardingStore = () => {
  localStorage.removeItem("onboarding-form-draft");
};
