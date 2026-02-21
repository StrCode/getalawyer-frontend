import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  onSaveAndContinue: () => void;
  onSaveAndExit: () => void;
  isSubmitting: boolean;
  isSaveAndContinueDisabled?: boolean;
  saveAndContinueText?: string;
  saveAndExitText?: string;
  className?: string;
}

/**
 * FormActions component
 * 
 * Provides consistent action buttons for registration forms:
 * - "Save & Continue" button to validate and proceed to next step
 * - "Save & Exit" button to save progress and return to dashboard
 * - Loading states during submission
 * - Disabled states when validation fails
 * 
 * Requirements: 8.5, 8.6, 8.7
 */
export function FormActions({
  onSaveAndContinue,
  onSaveAndExit,
  isSubmitting,
  isSaveAndContinueDisabled = false,
  saveAndContinueText = "Save & Continue",
  saveAndExitText = "Save & Exit",
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex sm:flex-row flex-col gap-3 sm:gap-4 pt-6 border-t", className)}>
      {/* Save & Exit button - secondary action */}
      <Button
        type="button"
        variant="outline"
        onClick={onSaveAndExit}
        disabled={isSubmitting}
        className="order-2 sm:order-1 w-full sm:w-auto"
        aria-label="Save current progress and exit to dashboard"
      >
        {saveAndExitText}
      </Button>

      {/* Save & Continue button - primary action */}
      <Button
        type="submit"
        onClick={onSaveAndContinue}
        disabled={isSubmitting || isSaveAndContinueDisabled}
        className="order-1 sm:order-2 sm:ml-auto w-full sm:w-auto"
        aria-label="Save and continue to next step"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Saving...</span>
          </>
        ) : (
          saveAndContinueText
        )}
      </Button>
    </div>
  );
}
