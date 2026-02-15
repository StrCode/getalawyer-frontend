import { useCallback, useMemo } from 'react';
import { 
  OnboardingStep, 
  STEP_DEFINITIONS, 
  StepDefinition, 
  useEnhancedOnboardingStore 
} from '@/stores/enhanced-onboarding-store';

export interface ProgressInfo {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  completedCount: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  currentStepInfo: StepDefinition;
  nextStepInfo?: StepDefinition;
  isComplete: boolean;
}

export interface StepProgress {
  step: StepDefinition;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
  canNavigateTo: boolean;
}

/**
 * Hook for tracking and managing onboarding progress
 */
export function useProgressTracker() {
  const {
    currentStep,
    completedSteps,
    progressPercentage,
    estimatedTimeRemaining,
    canAccessStep,
    updateProgress,
    calculateTimeRemaining,
    markStepCompleted,
    setCurrentStep,
  } = useEnhancedOnboardingStore();

  // Get current step definition
  const currentStepInfo = useMemo(() => {
    return STEP_DEFINITIONS.find(def => def.id === currentStep) || STEP_DEFINITIONS[0];
  }, [currentStep]);

  // Get next step definition
  const nextStepInfo = useMemo(() => {
    const currentIndex = STEP_DEFINITIONS.findIndex(def => def.id === currentStep);
    return currentIndex < STEP_DEFINITIONS.length - 1 
      ? STEP_DEFINITIONS[currentIndex + 1] 
      : undefined;
  }, [currentStep]);

  // Calculate progress info
  const progressInfo: ProgressInfo = useMemo(() => {
    const requiredSteps = STEP_DEFINITIONS.filter(def => def.required);
    const completedRequiredSteps = completedSteps.filter(step => 
      STEP_DEFINITIONS.find(def => def.id === step)?.required
    );

    return {
      currentStep,
      completedSteps,
      totalSteps: requiredSteps.length,
      completedCount: completedRequiredSteps.length,
      progressPercentage,
      estimatedTimeRemaining,
      currentStepInfo,
      nextStepInfo,
      isComplete: completedRequiredSteps.length === requiredSteps.length,
    };
  }, [
    currentStep,
    completedSteps,
    progressPercentage,
    estimatedTimeRemaining,
    currentStepInfo,
    nextStepInfo,
  ]);

  // Get step progress for all steps
  const stepProgress: StepProgress[] = useMemo(() => {
    return STEP_DEFINITIONS.map(step => ({
      step,
      isCompleted: completedSteps.includes(step.id),
      isCurrent: currentStep === step.id,
      isAccessible: canAccessStep(step.id),
      canNavigateTo: canAccessStep(step.id) && step.id !== currentStep,
    }));
  }, [currentStep, completedSteps, canAccessStep]);

  // Navigation functions
  const goToStep = useCallback((step: OnboardingStep) => {
    if (canAccessStep(step)) {
      setCurrentStep(step);
      return true;
    }
    return false;
  }, [canAccessStep, setCurrentStep]);

  const goToNextStep = useCallback(() => {
    if (nextStepInfo && canAccessStep(nextStepInfo.id)) {
      setCurrentStep(nextStepInfo.id);
      return true;
    }
    return false;
  }, [nextStepInfo, canAccessStep, setCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_DEFINITIONS.findIndex(def => def.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = STEP_DEFINITIONS[currentIndex - 1];
      setCurrentStep(previousStep.id);
      return true;
    }
    return false;
  }, [currentStep, setCurrentStep]);

  // Complete current step and advance
  const completeCurrentStep = useCallback(() => {
    markStepCompleted(currentStep);
    updateProgress();
    calculateTimeRemaining();
    
    // Auto-advance to next step if available
    if (nextStepInfo) {
      setCurrentStep(nextStepInfo.id);
    }
  }, [currentStep, nextStepInfo, markStepCompleted, updateProgress, calculateTimeRemaining, setCurrentStep]);

  // Get time estimation for specific step
  const getStepTimeEstimate = useCallback((step: OnboardingStep): number => {
    const stepDef = STEP_DEFINITIONS.find(def => def.id === step);
    return stepDef?.estimatedMinutes || 0;
  }, []);

  // Get total time estimate for remaining steps
  const getTotalTimeRemaining = useCallback((): number => {
    const remainingSteps = STEP_DEFINITIONS.filter(def => 
      def.required && !completedSteps.includes(def.id) && def.id !== currentStep
    );
    
    // Add current step time if not completed
    const currentStepTime = completedSteps.includes(currentStep) 
      ? 0 
      : getStepTimeEstimate(currentStep);
    
    const remainingTime = remainingSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    return remainingTime + currentStepTime;
  }, [completedSteps, currentStep, getStepTimeEstimate]);

  // Format time remaining as human-readable string
  const formatTimeRemaining = useCallback((minutes: number): string => {
    if (minutes === 0) return 'Complete';
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${Math.ceil(minutes)} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.ceil(minutes % 60);
    
    if (hours === 1) {
      return remainingMinutes === 0 
        ? '1 hour' 
        : `1 hour ${remainingMinutes} minutes`;
    }
    
    return remainingMinutes === 0 
      ? `${hours} hours` 
      : `${hours} hours ${remainingMinutes} minutes`;
  }, []);

  // Get progress as a fraction (0-1)
  const getProgressFraction = useCallback((): number => {
    return progressPercentage / 100;
  }, [progressPercentage]);

  // Check if step is the last required step
  const isLastStep = useCallback((step: OnboardingStep): boolean => {
    const requiredSteps = STEP_DEFINITIONS.filter(def => def.required);
    const lastRequiredStep = requiredSteps[requiredSteps.length - 1];
    return step === lastRequiredStep.id;
  }, []);

  // Get step number (1-based index)
  const getStepNumber = useCallback((step: OnboardingStep): number => {
    const index = STEP_DEFINITIONS.findIndex(def => def.id === step);
    return index + 1;
  }, []);

  // Get completion status message
  const getCompletionMessage = useCallback((): string => {
    const { completedCount, totalSteps, isComplete } = progressInfo;
    
    if (isComplete) {
      return 'Application complete! Ready to submit.';
    }
    
    if (completedCount === 0) {
      return 'Let\'s get started with your application.';
    }
    
    const remaining = totalSteps - completedCount;
    return `${completedCount} of ${totalSteps} steps completed. ${remaining} step${remaining === 1 ? '' : 's'} remaining.`;
  }, [progressInfo]);

  return {
    // Progress information
    progressInfo,
    stepProgress,
    
    // Navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeCurrentStep,
    
    // Time estimation
    getStepTimeEstimate,
    getTotalTimeRemaining,
    formatTimeRemaining,
    
    // Utility functions
    getProgressFraction,
    isLastStep,
    getStepNumber,
    getCompletionMessage,
    
    // Computed values
    canGoNext: !!nextStepInfo && canAccessStep(nextStepInfo.id),
    canGoPrevious: STEP_DEFINITIONS.findIndex(def => def.id === currentStep) > 0,
    isFirstStep: currentStep === STEP_DEFINITIONS[0].id,
    isLastRequiredStep: isLastStep(currentStep),
  };
}

/**
 * Utility function to get step route by step ID
 */
export function getStepRoute(step: OnboardingStep): string {
  const stepDef = STEP_DEFINITIONS.find(def => def.id === step);
  return stepDef?.route || '/onboarding/basics';
}

/**
 * Utility function to get step ID by route
 */
export function getStepByRoute(route: string): OnboardingStep | null {
  const stepDef = STEP_DEFINITIONS.find(def => def.route === route);
  return stepDef?.id || null;
}

/**
 * Utility function to calculate progress percentage manually
 */
export function calculateProgressPercentage(
  completedSteps: OnboardingStep[],
  includeOptional: boolean = false
): number {
  const steps = includeOptional 
    ? STEP_DEFINITIONS 
    : STEP_DEFINITIONS.filter(def => def.required);
  
  const completedCount = completedSteps.filter(step => 
    steps.some(def => def.id === step)
  ).length;
  
  return (completedCount / steps.length) * 100;
}

/**
 * Utility function to get the next incomplete step
 */
export function getNextIncompleteStep(completedSteps: OnboardingStep[]): OnboardingStep | null {
  const incompleteStep = STEP_DEFINITIONS.find(def => 
    def.required && !completedSteps.includes(def.id)
  );
  
  return incompleteStep?.id || null;
}

/**
 * Hook for persisting progress to localStorage with custom key
 */
export function useProgressPersistence(key: string = 'onboarding-progress') {
  const { progressInfo } = useProgressTracker();

  const saveProgress = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify({
        currentStep: progressInfo.currentStep,
        completedSteps: progressInfo.completedSteps,
        progressPercentage: progressInfo.progressPercentage,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [key, progressInfo]);

  const loadProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return null;
  }, [key]);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }, [key]);

  return {
    saveProgress,
    loadProgress,
    clearProgress,
  };
}