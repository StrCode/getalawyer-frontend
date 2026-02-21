import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FieldErrorProps {
  message?: string;
  fieldId: string;
}

/**
 * Field-level error display component
 * Displays validation errors next to form fields
 */
export function FieldError({ message, fieldId }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={`${fieldId}-error`}
      className="flex items-center gap-1 mt-1 text-red-600 text-sm"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

interface FormErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Form-level error alert component
 * Displays API or general form errors
 */
export function FormErrorAlert({ message, onRetry }: FormErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="w-4 h-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
