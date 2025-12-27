import { useEffect } from 'react';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

/**
 * Component that loads onboarding status when the app starts
 * This should be included in the app root to restore user progress
 */
export function OnboardingStatusLoader() {
  const { data, error, isLoading } = useOnboardingStatus();

  useEffect(() => {
    if (data) {
      console.log('Onboarding status loaded:', data);
    }
    if (error) {
      console.warn('Failed to load onboarding status:', error);
    }
  }, [data, error]);

  // This component doesn't render anything
  return null;
}