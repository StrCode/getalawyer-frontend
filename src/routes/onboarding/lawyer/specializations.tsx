// ============================================
// Step 3: Specializations
// onboarding/lawyer/specializations.tsx
// ============================================

import { ArrowLeft02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { EnhancedSpecializationsSelector } from "@/components/onboarding/enhanced-specializations";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer/specializations")({
  component: LawyerSpecializationsStep,
});

interface SpecializationsSubmissionData {
  specializations: Array<{
    specializationId: string;
    yearsOfExperience: number;
    description?: string;
  }>;
}

function LawyerSpecializationsStep() {
  const router = useRouter();
  
  // Enhanced store state and actions
  const specializations = useEnhancedOnboardingStore((state) => state.specializations);
  const validateStep = useEnhancedOnboardingStore((state) => state.validateStep);
  const markStepCompleted = useEnhancedOnboardingStore((state) => state.markStepCompleted);
  const setCurrentStep = useEnhancedOnboardingStore((state) => state.setCurrentStep);
  const updateLastSaved = useEnhancedOnboardingStore((state) => state.updateLastSaved);
  const clearDraft = useEnhancedOnboardingStore((state) => state.clearDraft);
  const errors = useEnhancedOnboardingStore((state) => state.errors);

  // Set current step on mount
  React.useEffect(() => {
    setCurrentStep('specializations');
  }, [setCurrentStep]);

  // API mutation for completing onboarding with specializations
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: SpecializationsSubmissionData) => {
      // Use the complete onboarding endpoint to submit specializations and finish the process
      return api.lawyer.completeOnboarding({
        specializations: data.specializations,
        experienceDescription: undefined // Optional field - could be added later
      });
    },
    onSuccess: () => {
      toastManager.add({
        title: "Application submitted!",
        description: "Your lawyer application has been submitted for review. You'll hear back within 2 business days.",
        type: "success",
      });

      // Mark step as completed and clear draft
      markStepCompleted('specializations');
      clearDraft('specializations');
      updateLastSaved();

      // Navigate to review step (which will now show confirmation)
      router.navigate({ to: "/onboarding/lawyer/review" });
    },
    onError: (error: Error) => {
      console.error("Onboarding completion error:", error);
      toastManager.add({
        title: "Submission failed",
        description: error.message || "Failed to submit your application. Please try again.",
        type: "error",
      });
    },
  });

  // Handle form submission
  const handleSubmit = async () => {
    // Validate the current step
    const validation = validateStep('specializations');
    
    if (!validation.isValid) {
      toastManager.add({
        title: "Validation Error",
        description: validation.errors[0]?.message || "Please fix the errors before continuing.",
        type: "error",
      });
      return;
    }

    // Prepare data for submission
    const submissionData: SpecializationsSubmissionData = {
      specializations: specializations.map(spec => ({
        specializationId: spec.specializationId,
        yearsOfExperience: spec.yearsOfExperience,
        description: spec.description
      }))
    };

    // Submit the data
    completeOnboardingMutation.mutate(submissionData);
  };

  // Handle back navigation
  const handleBack = () => {
    router.navigate({ to: "/onboarding/lawyer/credentials" });
  };

  // Check if form is valid for submission
  const isFormValid = specializations.length >= 1 && 
                     specializations.length <= 5 && 
                     specializations.every(spec => 
                       spec.yearsOfExperience >= 0 && 
                       Number.isInteger(spec.yearsOfExperience)
                     ) &&
                     (!errors.specializations || errors.specializations.length === 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step 3 of 4</span>
          <span className="text-sm text-gray-500">Practice Areas & Experience</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-3/4"></div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Practice Areas
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Select your areas of legal expertise and specify your years of experience in each. 
          This helps clients find the right lawyer for their specific legal needs.
        </p>
      </div>

      {/* Specializations Selector */}
      <div className="mb-8">
        <EnhancedSpecializationsSelector />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="w-32"
          disabled={completeOnboardingMutation.isPending}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || completeOnboardingMutation.isPending}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {completeOnboardingMutation.isPending ? (
            "Submitting application..."
          ) : (
            <>
              Submit Application
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Tips for selecting specializations:
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Choose areas where you have significant experience</li>
              <li>• Be honest about your years of experience - it builds trust</li>
              <li>• You can select 1-5 specializations to showcase your expertise</li>
              <li>• Clients will see these when searching for legal help</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {!isFormValid && specializations.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Please review your selections:
              </p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                {specializations.length === 0 && (
                  <li>• At least one specialization is required</li>
                )}
                {specializations.length > 5 && (
                  <li>• Maximum 5 specializations allowed</li>
                )}
                {specializations.some(spec => spec.yearsOfExperience < 0) && (
                  <li>• Years of experience cannot be negative</li>
                )}
                {specializations.some(spec => !Number.isInteger(spec.yearsOfExperience)) && (
                  <li>• Years of experience must be whole numbers</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}