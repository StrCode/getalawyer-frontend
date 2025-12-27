import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api/client';
import type { OnboardingStep } from '@/stores/enhanced-onboarding-store';
import { useEnhancedOnboardingStore } from '@/stores/enhanced-onboarding-store';

/**
 * Hook to load and sync onboarding status from the backend
 * This should be called when the app starts to restore user progress
 */
export function useOnboardingStatus() {
  const {
    setCurrentStep,
    updatePracticeInfo,
    addDocument,
    markStepCompleted,
    setApplicationStatus,
  } = useEnhancedOnboardingStore();

  const query = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: api.lawyer.getOnboardingStatus,
    retry: false, // Don't retry if user is not authenticated
    refetchOnWindowFocus: false,
  });

  // Sync backend data with local store when data is loaded
  useEffect(() => {
    if (query.data) {
      const { currentStep, lawyer, documents } = query.data;
      
      // Update current step
      if (currentStep) {
        setCurrentStep(currentStep);
      }

      // Update practice info if available
      if (lawyer) {
        updatePracticeInfo({
          firstName: '', // These might not be available from lawyer object
          middleName: '',
          lastName: '',
          email: '',
          phoneNumber: lawyer.phoneNumber,
          country: lawyer.country,
          state: lawyer.state,
          city: '',
        });

        // Mark completed steps based on onboarding step
        const stepOrder = ['practice_info', 'documents', 'specializations', 'review'];
        const currentStepIndex = stepOrder.indexOf(lawyer.onboardingStep);
        
        for (let i = 0; i < currentStepIndex; i++) {
          markStepCompleted(stepOrder[i] as OnboardingStep);
        }

        // Set application status
        setApplicationStatus(lawyer.applicationStatus);
      }

      // Add documents to store
      if (documents && documents.length > 0) {
        documents.forEach(doc => {
          addDocument({
            id: doc.id,
            type: doc.type,
            originalName: doc.originalName || '',
            url: doc.url,
            publicId: doc.publicId,
            uploadProgress: 100,
            uploadStatus: 'completed',
          });
        });
      }
    }
  }, [query.data, setCurrentStep, updatePracticeInfo, addDocument, markStepCompleted, setApplicationStatus]);

  return {
    ...query,
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
  };
}