"use client";

import { Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ClockIcon } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  type OnboardingStep,
  STEP_DEFINITIONS,
  type StepDefinition, 
  useEnhancedOnboardingStore 
} from "@/stores/enhanced-onboarding-store";
import { useBreakpoint } from "@/utils/responsive-design";

interface ProgressTrackerProps {
  steps?: Array<StepDefinition>;
  currentStep: OnboardingStep;
  completedSteps: Array<OnboardingStep>;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function ProgressTracker({
  steps = STEP_DEFINITIONS,
  currentStep,
  completedSteps,
  className,
  variant = 'default'
}: ProgressTrackerProps) {
  const { validateStep } = useEnhancedOnboardingStore();
  const { isMobile, isTablet } = useBreakpoint();

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    const requiredSteps = steps.filter(step => step.required && step.id !== 'submitted');
    const completedRequiredSteps = completedSteps.filter(step => 
      requiredSteps.some(reqStep => reqStep.id === step)
    );
    
    const totalSteps = requiredSteps.length;
    const completedCount = completedRequiredSteps.length;
    const percentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    
    // Calculate time remaining
    const remainingSteps = requiredSteps.filter(step => 
      !completedSteps.includes(step.id)
    );
    const timeRemaining = remainingSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    
    return {
      totalSteps,
      completedCount,
      percentage: Math.round(percentage),
      timeRemaining,
      remainingSteps: remainingSteps.length
    };
  }, [steps, completedSteps]);

  // Get current step validation
  const currentStepValidation = useMemo(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  // Auto-select variant based on screen size
  const effectiveVariant = variant === 'default' && (isMobile || isTablet) ? 'compact' : variant;

  if (effectiveVariant === 'minimal') {
    return (
      <div className={cn(
        "flex items-center gap-4", 
        isMobile && "flex-col gap-2",
        className
      )} role="progressbar" aria-valuenow={progressMetrics.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Onboarding progress: ${progressMetrics.percentage}% complete`}>
        <div className={cn("flex-1", isMobile && "w-full")}>
          <Progress value={progressMetrics.percentage} className={cn("h-2", isMobile && "h-3")} aria-hidden="true" />
        </div>
        <div className={cn(
          "text-sm text-muted-foreground whitespace-nowrap",
          isMobile && "text-center text-xs"
        )} aria-live="polite">
          {progressMetrics.completedCount} of {progressMetrics.totalSteps} complete
        </div>
      </div>
    );
  }

  if (effectiveVariant === 'compact') {
    return (
      <Card className={cn("", className)} role="region" aria-labelledby="progress-heading">
        <CardContent className={cn(
          "p-4",
          isMobile && "p-3"
        )}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-medium text-sm",
                isMobile && "text-xs"
              )} id="progress-heading">Progress</h3>
              <Badge variant="secondary" className={cn(
                "text-xs",
                isMobile && "text-xs px-2 py-0.5"
              )} aria-label={`${progressMetrics.percentage} percent complete`}>
                {progressMetrics.percentage}%
              </Badge>
            </div>
            
            <div role="progressbar" aria-valuenow={progressMetrics.percentage} aria-valuemin={0} aria-valuemax={100} aria-labelledby="progress-heading">
              <Progress value={progressMetrics.percentage} className={cn("h-2", isMobile && "h-3")} aria-hidden="true" />
            </div>
            
            <div className={cn(
              "flex items-center justify-between text-xs text-muted-foreground",
              isMobile && "flex-col gap-1 text-center"
            )} aria-live="polite">
              <span>{progressMetrics.completedCount} of {progressMetrics.totalSteps} steps</span>
              {progressMetrics.timeRemaining > 0 && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" aria-hidden="true" />
                  ~{progressMetrics.timeRemaining} min left
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - full progress tracker
  return (
    <Card className={cn("", className)} role="region" aria-labelledby="progress-main-heading">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg" id="progress-main-heading">Your Progress</CardTitle>
          <Badge variant="secondary" className="text-sm font-medium" aria-label={`${progressMetrics.percentage} percent complete`}>
            {progressMetrics.percentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div role="progressbar" aria-valuenow={progressMetrics.percentage} aria-valuemin={0} aria-valuemax={100} aria-labelledby="progress-main-heading">
            <Progress value={progressMetrics.percentage} className="h-3" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground" aria-live="polite">
            <span>
              {progressMetrics.completedCount} of {progressMetrics.totalSteps} steps completed
            </span>
            {progressMetrics.timeRemaining > 0 && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" aria-hidden="true" />
                ~{progressMetrics.timeRemaining} minutes remaining
              </span>
            )}
          </div>
        </div>

        {/* Current Step Status */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
              <span className="text-xs font-medium">
                {steps.findIndex(step => step.id === currentStep) + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900">
                Current: {steps.find(step => step.id === currentStep)?.title}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {steps.find(step => step.id === currentStep)?.description}
              </p>
              
              {/* Validation errors for current step */}
              {!currentStepValidation.isValid && (
                <div className="mt-2 space-y-1" role="alert" aria-live="assertive">
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" aria-hidden="true" />
                    Issues to resolve:
                  </p>
                  {currentStepValidation.errors.slice(0, 3).map((error, index) => (
                    <p key={`error-${error.field}-${index}`} className="text-xs text-red-600 ml-4">
                      • {error.message}
                    </p>
                  ))}
                  {currentStepValidation.errors.length > 3 && (
                    <p className="text-xs text-red-600 ml-4">
                      • +{currentStepValidation.errors.length - 3} more issues
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm" id="steps-overview">All Steps</h4>
          <div className="space-y-2" role="list" aria-labelledby="steps-overview">
            {steps.filter(step => step.id !== 'submitted').map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors",
                    isCompleted && "bg-green-50",
                    isCurrent && "bg-blue-50",
                    !isCompleted && !isCurrent && "bg-gray-50"
                  )}
                  role="listitem"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-blue-500 text-white",
                    !isCompleted && !isCurrent && "bg-gray-300 text-gray-600"
                  )} aria-hidden="true">
                    {isCompleted ? (
                      <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isCompleted && "text-green-700",
                        isCurrent && "text-blue-700",
                        !isCompleted && !isCurrent && "text-gray-700"
                      )}>
                        {step.title}
                      </span>
                      {step.required && (
                        <Badge variant="outline" className="text-xs" aria-label="Required step">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-0.5",
                      isCompleted && "text-green-600",
                      isCurrent && "text-blue-600",
                      !isCompleted && !isCurrent && "text-gray-600"
                    )}>
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-1" aria-label={`Estimated ${step.estimatedMinutes} minutes`}>
                    <ClockIcon className="w-3 h-3" aria-hidden="true" />
                    {step.estimatedMinutes}m
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Message */}
        {progressMetrics.percentage === 100 && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200" role="status" aria-live="polite">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Tick01Icon} className="w-5 h-5 text-green-600" aria-hidden="true" />
              <span className="font-medium text-green-800">
                All steps completed! Ready to submit your application.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for progress tracking utilities
export function useProgressTracking() {
  const { 
    currentStep, 
    completedSteps, 
    progressPercentage, 
    estimatedTimeRemaining,
    updateProgress,
    calculateTimeRemaining 
  } = useEnhancedOnboardingStore();

  const getStepProgress = (step: OnboardingStep) => {
    const stepIndex = STEP_DEFINITIONS.findIndex(def => def.id === step);
    const currentIndex = STEP_DEFINITIONS.findIndex(def => def.id === currentStep);
    
    if (completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    if (stepIndex < currentIndex) {
      return 'completed';
    }
    if (stepIndex === currentIndex + 1) {
      return 'next';
    }
    return 'future';
  };

  const getOverallProgress = () => {
    const requiredSteps = STEP_DEFINITIONS.filter(step => step.required && step.id !== 'submitted');
    const completedRequiredSteps = completedSteps.filter(step => 
      requiredSteps.some(reqStep => reqStep.id === step)
    );
    
    return {
      total: requiredSteps.length,
      completed: completedRequiredSteps.length,
      percentage: progressPercentage,
      timeRemaining: estimatedTimeRemaining
    };
  };

  return {
    currentStep,
    completedSteps,
    progressPercentage,
    estimatedTimeRemaining,
    getStepProgress,
    getOverallProgress,
    updateProgress,
    calculateTimeRemaining
  };
}