import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { OnboardingStep } from '../lib/api/client';
import { redirectToCurrentStep, useOnboardingSync } from '../lib/onboarding-sync';
import { useEnhancedOnboardingStore } from '../stores/enhanced-onboarding-store';

interface UseOnboardingNavigationOptions {
  autoRedirect?: boolean;
  redirectOnStatusChange?: boolean;
}

interface OnboardingNavigationState {
  isInitialized: boolean;
  isLoading: boolean;
  currentStep: OnboardingStep;
  shouldRedirect: boolean;
  targetRoute: string | null;
}

/**
 * Hook for managing onboarding navigation and status synchronization
 */
export function useOnboardingNavigation(options: UseOnboardingNavigationOptions = {}) {
  const { autoRedirect = true, redirectOnStatusChange = true } = options;
  
  const router = useRouter();
  const { 
    initializeSync, 
    syncStatus, 
    lastSyncTime, 
    isSyncing, 
    currentStep,
    applicationStatus 
  } = useOnboardingSync();
  
  const store = useEnhancedOnboardingStore();
  
  const [navigationState, setNavigationState] = useState<OnboardingNavigationState>({
    isInitialized: false,
    isLoading: true,
    currentStep: store.currentStep,
    shouldRedirect: false,
    targetRoute: null,
  });

  // Initialize sync and handle initial navigation
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setNavigationState(prev => ({ ...prev, isLoading: true }));
        
        // Initialize sync service
        await initializeSync();
        
        if (!mounted) return;

        const currentRoute = window.location.pathname;
        const expectedRoute = redirectToCurrentStep(store.currentStep);
        
        // Check if user is on the wrong step
        const shouldRedirect = autoRedirect && 
          currentRoute !== expectedRoute && 
          currentRoute.startsWith('/onboarding/');

        setNavigationState({
          isInitialized: true,
          isLoading: false,
          currentStep: store.currentStep,
          shouldRedirect,
          targetRoute: shouldRedirect ? expectedRoute : null,
        });

        // Perform redirect if needed
        if (shouldRedirect) {
          router.navigate({ to: expectedRoute });
        }

      } catch (error) {
        console.error('Failed to initialize onboarding navigation:', error);
        if (mounted) {
          setNavigationState(prev => ({
            ...prev,
            isInitialized: true,
            isLoading: false,
          }));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [initializeSync, autoRedirect, router, store.currentStep]);

  // Handle step changes
  useEffect(() => {
    if (!navigationState.isInitialized) return;

    const currentRoute = window.location.pathname;
    const expectedRoute = redirectToCurrentStep(currentStep);
    
    const shouldRedirect = autoRedirect && 
      currentRoute !== expectedRoute && 
      currentRoute.startsWith('/onboarding/');

    if (shouldRedirect) {
      setNavigationState(prev => ({
        ...prev,
        currentStep,
        shouldRedirect: true,
        targetRoute: expectedRoute,
      }));
      
      router.navigate({ to: expectedRoute });
    } else {
      setNavigationState(prev => ({
        ...prev,
        currentStep,
        shouldRedirect: false,
        targetRoute: null,
      }));
    }
  }, [currentStep, autoRedirect, router, navigationState.isInitialized]);

  // Handle application status changes
  useEffect(() => {
    if (!redirectOnStatusChange) return;

    const handleStatusChange = (event: CustomEvent) => {
      const { newStatus } = event.detail;
      
      // Redirect to status page if application is submitted/approved/rejected
      if (['submitted', 'approved', 'rejected'].includes(newStatus)) {
        router.navigate({ to: '/onboarding/status' });
      }
    };

    window.addEventListener('onboardingStatusChanged', handleStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('onboardingStatusChanged', handleStatusChange as EventListener);
    };
  }, [redirectOnStatusChange, router]);

  // Navigation helpers
  const navigateToStep = (step: OnboardingStep) => {
    if (store.canAccessStep(step)) {
      const route = redirectToCurrentStep(step);
      router.navigate({ to: route });
      store.setCurrentStep(step);
    } else {
      console.warn(`Cannot navigate to step ${step} - prerequisites not met`);
    }
  };

  const navigateToNextStep = () => {
    const stepOrder: Array<OnboardingStep> = [
      'practice_info',
      'documents',
      'specializations', 
      'review',
      'submitted'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      navigateToStep(nextStep);
    }
  };

  const navigateToPreviousStep = () => {
    const stepOrder: Array<OnboardingStep> = [
      'practice_info',
      'documents',
      'specializations',
      'review', 
      'submitted'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      navigateToStep(previousStep);
    }
  };

  // Sync helpers
  const refreshStatus = async () => {
    try {
      setNavigationState(prev => ({ ...prev, isLoading: true }));
      await syncStatus();
    } finally {
      setNavigationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    // Navigation state
    ...navigationState,
    applicationStatus,
    
    // Sync state
    lastSyncTime,
    isSyncing: isSyncing || navigationState.isLoading,
    
    // Navigation methods
    navigateToStep,
    navigateToNextStep,
    navigateToPreviousStep,
    
    // Sync methods
    refreshStatus,
    
    // Utility methods
    canAccessStep: store.canAccessStep,
    isStepCompleted: (step: OnboardingStep) => store.completedSteps.includes(step),
    getStepRoute: redirectToCurrentStep,
  };
}

/**
 * Hook for protecting onboarding routes
 * Ensures user can only access steps they're allowed to
 */
export function useOnboardingRouteGuard(requiredStep: OnboardingStep) {
  const { canAccessStep, navigateToStep, currentStep, isInitialized } = useOnboardingNavigation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    const authorized = canAccessStep(requiredStep);
    setIsAuthorized(authorized);
    setIsChecking(false);

    // Redirect to current step if not authorized
    if (!authorized && currentStep !== requiredStep) {
      navigateToStep(currentStep);
    }
  }, [canAccessStep, requiredStep, isInitialized, currentStep, navigateToStep]);

  return {
    isAuthorized,
    isChecking,
    currentStep,
  };
}

/**
 * Hook for onboarding progress tracking
 */
export function useOnboardingProgress() {
  const store = useEnhancedOnboardingStore();
  const { currentStep, applicationStatus } = useOnboardingSync();

  return {
    currentStep,
    completedSteps: store.completedSteps,
    progressPercentage: store.progressPercentage,
    estimatedTimeRemaining: store.estimatedTimeRemaining,
    applicationStatus,
    
    // Progress actions
    updateProgress: store.updateProgress,
    calculateTimeRemaining: store.calculateTimeRemaining,
  };
}