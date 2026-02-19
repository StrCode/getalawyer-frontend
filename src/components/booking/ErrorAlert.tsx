import { handleApiError } from '../../lib/utils/error-handler';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, className }: ErrorAlertProps) {
  const errorInfo = handleApiError(error);

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{errorInfo.message}</p>
          {errorInfo.canRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
