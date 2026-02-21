import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

/**
 * ProgressIndicator component
 * 
 * Displays visual progress through the registration steps:
 * - Progress bar showing percentage completion
 * - Step indicators with completion status
 * - Navigation guards for future steps (visual only, actual guards in routes)
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <section className={cn("space-y-4", className)} aria-label="Registration progress">
      {/* Step counter text */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 text-lg">
          Step {currentStep} of {totalSteps}
        </h2>
        <span className="text-gray-600 text-sm" aria-live="polite">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Registration progress: ${Math.round(progressPercentage)}% complete`}>
        <Progress value={progressPercentage} className="h-2" aria-hidden="true" />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "flex justify-center items-center border-2 rounded-full w-8 h-8 transition-all",
                  isCompleted && "bg-green-500 border-green-500 text-white",
                  isCurrent && "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100",
                  isFuture && "bg-white border-gray-300 text-gray-400"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <span className="font-medium text-sm">{stepNumber}</span>
                )}
              </div>

              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "w-8 sm:w-12 md:w-16 h-0.5 transition-all",
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
