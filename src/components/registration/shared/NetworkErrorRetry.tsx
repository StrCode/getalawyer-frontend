import { WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface NetworkErrorRetryProps {
  onRetry: () => void;
  isRetrying?: boolean;
  message?: string;
}

/**
 * Network error retry component
 * Displays when network requests fail with retry option
 */
export function NetworkErrorRetry({
  onRetry,
  isRetrying = false,
  message = 'Unable to connect to the server. Please check your internet connection.',
}: NetworkErrorRetryProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <WifiOff className="w-4 h-4" />
      <AlertTitle>Network Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Retry
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
