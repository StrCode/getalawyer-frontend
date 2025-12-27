"use client";

import { Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "@tanstack/react-router";
import { AlertCircleIcon, ChevronRightIcon } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  type OnboardingStep,
  STEP_DEFINITIONS,
  type StepDefinition, 
  useEnhancedOnboardingStore 
} from "@/stores/enhanced-onboarding-store";
import { useFocusManagement } from "@/utils/focus-management";
import { responsiveClasses, useBreakpoint, useTouchDevice } from "@/utils/responsive-design";

interface StepNavigatorProps {
  currentStep: OnboardingStep;
  completedSteps: Array<OnboardingStep>;
  onStepChange?: (step: OnboardingStep) => void;
  allowSkipping?: boolean;
  className?: string;
}

export function StepNavigator({
  currentStep,
  completedSteps,
  onStepChange,
  allowSkipping = false,
  className
}: StepNavigatorProps) {
  const router = useRouter();
  const { canAccessStep, validateStep, setCurrentStep } = useEnhancedOnboardingStore();
  const { isMobile, isTablet } = useBreakpoint();
  const isTouchDevice = useTouchDevice();
  const containerRef = useRef<HTMLElement>(null);
  
  // Use focus management for keyboard navigation
  useFocusManagement(containerRef);

  const handleStepClick = (step: OnboardingStep) => {
    // Check if step can be accessed
    if (!canAccessStep(step) && !allowSkipping) {
      return;
    }

    // Validate current step before allowing navigation
    const currentStepValidation = validateStep(currentStep);
    if (!currentStepValidation.canProceed && step !== currentStep && !allowSkipping) {
      return;
    }

    // Update store and navigate
    setCurrentStep(step);
    
    // Call optional callback
    if (onStepChange) {
      onStepChange(step);
    }

    // Navigate to the step route
    const stepDefinition = STEP_DEFINITIONS.find(def => def.id === step);
    if (stepDefinition) {
      router.navigate({ to: stepDefinition.route });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, step: OnboardingStep) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepClick(step);
    }
  };

  const getStepStatus = (step: OnboardingStep) => {
    if (completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    if (canAccessStep(step)) {
      return 'accessible';
    }
    return 'locked';
  };

  const getStepValidationErrors = (step: OnboardingStep) => {
    if (step === currentStep) {
      const validation = validateStep(step);
      return validation.errors;
    }
    return [];
  };

  // Use compact layout on mobile/tablet
  if (isMobile || isTablet) {
    return (
      <CompactStepNavigator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={onStepChange}
        allowSkipping={allowSkipping}
        className={className}
      />
    );
  }

  return (
    <nav 
      ref={containerRef}
      className={cn("space-y-2", className)} 
      aria-label="Onboarding progress" 
      role="navigation"
    >
      {STEP_DEFINITIONS.filter(def => def.id !== 'submitted').map((stepDef: StepDefinition) => {
        const status = getStepStatus(stepDef.id);
        const isClickable = canAccessStep(stepDef.id) || allowSkipping;
        const validationErrors = getStepValidationErrors(stepDef.id);
        const hasErrors = validationErrors.length > 0;
        const stepIndex = STEP_DEFINITIONS.findIndex(def => def.id === stepDef.id);
        const isCurrent = status === 'current';

        return (
          <div key={stepDef.id} className="relative">
            <Button
              variant={status === 'current' ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start h-auto p-4 text-left transition-all duration-200",
                responsiveClasses.touchTarget,
                status === 'completed' && "bg-green-50 hover:bg-green-100 text-green-700",
                status === 'current' && "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
                status === 'accessible' && "hover:bg-gray-50",
                status === 'locked' && "opacity-50 cursor-not-allowed",
                hasErrors && status === 'current' && "border-red-200 bg-red-50",
                isTouchDevice && "active:scale-95 active:bg-opacity-80"
              )}
              onClick={() => handleStepClick(stepDef.id)}
              onKeyDown={(e) => handleKeyDown(e, stepDef.id)}
              disabled={!isClickable}
              aria-current={isCurrent ? 'step' : undefined}
              aria-describedby={hasErrors ? `${stepDef.id}-errors` : undefined}
              aria-label={`Step ${stepIndex + 1}: ${stepDef.title}. ${
                status === 'completed' ? 'Completed' : 
                status === 'current' ? 'Current step' :
                status === 'accessible' ? 'Available' : 'Locked'
              }${hasErrors ? `. Has ${validationErrors.length} validation errors` : ''}`}
              tabIndex={0}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Step number and icon */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
                  status === 'completed' && "bg-green-500 border-green-500 text-white",
                  status === 'current' && "bg-blue-500 border-blue-500 text-white",
                  status === 'accessible' && "border-gray-300 text-gray-500",
                  status === 'locked' && "border-gray-200 text-gray-300"
                )} aria-hidden="true">
                  {status === 'completed' ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepIndex + 1}</span>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium text-sm",
                      status === 'completed' && "text-green-700",
                      status === 'current' && "text-blue-700",
                      status === 'accessible' && "text-gray-900",
                      status === 'locked' && "text-gray-400"
                    )}>
                      {stepDef.title}
                    </h3>
                    
                    {stepDef.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                    
                    {hasErrors && (
                      <AlertCircleIcon className="w-4 h-4 text-red-500" aria-hidden="true" />
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-xs mt-1",
                    status === 'completed' && "text-green-600",
                    status === 'current' && "text-blue-600",
                    status === 'accessible' && "text-gray-600",
                    status === 'locked' && "text-gray-400"
                  )}>
                    {stepDef.description}
                  </p>
                  
                  {stepDef.estimatedMinutes > 0 && (
                    <p className={cn(
                      "text-xs mt-1",
                      status === 'completed' && "text-green-500",
                      status === 'current' && "text-blue-500",
                      status === 'accessible' && "text-gray-500",
                      status === 'locked' && "text-gray-400"
                    )}>
                      ~{stepDef.estimatedMinutes} min
                    </p>
                  )}

                  {/* Validation errors */}
                  {hasErrors && (
                    <div className="mt-2 space-y-1" id={`${stepDef.id}-errors`} role="alert" aria-live="polite">
                      {validationErrors.slice(0, 2).map((error, index) => (
                        <p key={`${error.field}-${index}`} className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircleIcon className="w-3 h-3" aria-hidden="true" />
                          {error.message}
                        </p>
                      ))}
                      {validationErrors.length > 2 && (
                        <p className="text-xs text-red-600">
                          +{validationErrors.length - 2} more issues
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation indicator */}
                <div className="shrink-0" aria-hidden="true">
                  {isClickable && status !== 'current' && (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </Button>

            {/* Connection line to next step */}
            {stepIndex < STEP_DEFINITIONS.length - 2 && (
              <div className={cn(
                "absolute left-8 top-16 w-0.5 h-4 -translate-x-0.5",
                status === 'completed' ? "bg-green-300" : "bg-gray-200"
              )} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Compact version for mobile or sidebar use
export function CompactStepNavigator({
  currentStep,
  completedSteps,
  onStepChange,
  allowSkipping = false,
  className
}: StepNavigatorProps) {
  const router = useRouter();
  const { canAccessStep, setCurrentStep } = useEnhancedOnboardingStore();
  const { isMobile } = useBreakpoint();
  const isTouchDevice = useTouchDevice();
  const containerRef = useRef<HTMLElement>(null);

  // Use focus management for keyboard navigation
  useFocusManagement(containerRef);

  const handleStepClick = (step: OnboardingStep) => {
    if (!canAccessStep(step) && !allowSkipping) {
      return;
    }

    setCurrentStep(step);
    
    if (onStepChange) {
      onStepChange(step);
    }

    const stepDefinition = STEP_DEFINITIONS.find(def => def.id === step);
    if (stepDefinition) {
      router.navigate({ to: stepDefinition.route });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, step: OnboardingStep) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepClick(step);
    }
  };

  return (
    <nav 
      ref={containerRef}
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-2",
        isMobile && "gap-1 px-2",
        className
      )} 
      aria-label="Onboarding progress" 
      role="navigation"
    >
      {STEP_DEFINITIONS.filter(def => def.id !== 'submitted').map((stepDef: StepDefinition) => {
        const isCompleted = completedSteps.includes(stepDef.id);
        const isCurrent = stepDef.id === currentStep;
        const isAccessible = canAccessStep(stepDef.id);
        const isClickable = isAccessible || allowSkipping;
        const stepIndex = STEP_DEFINITIONS.findIndex(def => def.id === stepDef.id);

        return (
          <div key={stepDef.id} className="flex items-center shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full transition-all duration-200",
                responsiveClasses.touchTarget,
                isMobile ? "w-10 h-10 p-0" : "w-8 h-8 p-0",
                isCompleted && "bg-green-500 hover:bg-green-600 text-white",
                isCurrent && "bg-blue-500 hover:bg-blue-600 text-white ring-2 ring-blue-200",
                !isCompleted && !isCurrent && isAccessible && "border border-gray-300 hover:bg-gray-50",
                !isAccessible && "opacity-50 cursor-not-allowed",
                isTouchDevice && "active:scale-90"
              )}
              onClick={() => handleStepClick(stepDef.id)}
              onKeyDown={(e) => handleKeyDown(e, stepDef.id)}
              disabled={!isClickable}
              title={`${stepDef.title} - ${stepDef.description}`}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Step ${stepIndex + 1}: ${stepDef.title}. ${
                isCompleted ? 'Completed' : 
                isCurrent ? 'Current step' :
                isAccessible ? 'Available' : 'Locked'
              }`}
              tabIndex={0}
            >
              {isCompleted ? (
                <HugeiconsIcon icon={Tick01Icon} className={cn("w-4 h-4", isMobile && "w-5 h-5")} aria-hidden="true" />
              ) : (
                <span className={cn("text-xs font-medium", isMobile && "text-sm")}>
                  {stepIndex + 1}
                </span>
              )}
            </Button>
            
            {stepIndex < STEP_DEFINITIONS.length - 2 && (
              <div className={cn(
                "h-0.5 mx-1",
                isMobile ? "w-6" : "w-8",
                isCompleted ? "bg-green-300" : "bg-gray-200"
              )} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}