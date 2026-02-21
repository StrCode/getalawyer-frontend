# Error Handling Integration Guide

This document describes the error handling implementation for the lawyer registration system.

## Components Created

### 1. Error Display Components

#### `FieldError` (`src/components/registration/shared/ErrorDisplay.tsx`)
- Displays field-level validation errors
- Includes icon and accessible error message
- Usage: `<FieldError message={errors.fieldName?.message} fieldId="fieldName" />`

#### `FormErrorAlert` (`src/components/registration/shared/ErrorDisplay.tsx`)
- Displays form-level or API errors
- Optional retry button
- Usage: `<FormErrorAlert message="Error message" onRetry={handleRetry} />`

#### `NetworkErrorRetry` (`src/components/registration/shared/NetworkErrorRetry.tsx`)
- Specialized component for network errors
- Shows retry button with loading state
- Usage: `<NetworkErrorRetry onRetry={handleRetry} isRetrying={isSubmitting} />`

#### `ErrorBoundary` (`src/components/registration/shared/ErrorBoundary.tsx`)
- Catches React errors in component tree
- Displays fallback UI
- Logs errors for debugging
- Integrated into `RegistrationLayout`

### 2. Error Handling Utilities

#### `error-handler.ts` (`src/utils/error-handler.ts`)
- `getErrorMessage(error)`: Maps API errors to user-friendly messages
- `isSessionTimeoutError(error)`: Checks if error is session timeout
- `isNetworkError(error)`: Checks if error is network-related
- `isRetryableError(error)`: Determines if error can be retried
- `handleSessionTimeout(navigate)`: Handles session expiration
- `logError(error, context)`: Logs errors for debugging

#### `toast-notifications.ts` (`src/utils/toast-notifications.ts`)
- `showSuccessToast(title, description)`: Success notifications
- `showErrorToast(title, description)`: Error notifications
- `showApiErrorToast(error, customTitle)`: API error with user-friendly message
- `showApiErrorToastWithRetry(error, onRetry, customTitle)`: Error with retry action
- `showLoadingToast(title, description)`: Loading notifications
- `dismissToast(toastId)`: Dismiss specific toast
- `dismissAllToasts()`: Clear all toasts

## Integration Pattern

### Standard Form Error Handling

```typescript
import { useState } from 'react';
import { FieldError, NetworkErrorRetry } from '@/components/registration/shared';
import {
  getErrorMessage,
  isSessionTimeoutError,
  isNetworkError,
  handleSessionTimeout,
  logError
} from '@/utils/error-handler';
import { showSuccessToast, showApiErrorToast } from '@/utils/toast-notifications';

export function MyForm() {
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState<Error | null>(null);
  
  const onSubmit = async (data) => {
    try {
      setNetworkError(null);
      
      // API call
      const response = await mutation.mutateAsync(data);
      
      // Success
      showSuccessToast('Success', 'Operation completed successfully');
      navigate({ to: '/next-step' });
      
    } catch (error) {
      // Log error
      logError(error, 'MyForm');
      
      // Handle session timeout
      if (isSessionTimeoutError(error)) {
        handleSessionTimeout(navigate);
        return;
      }
      
      // Handle network errors with retry UI
      if (isNetworkError(error)) {
        setNetworkError(error as Error);
        return;
      }
      
      // Show user-friendly error
      showApiErrorToast(error, 'Operation Failed');
    }
  };
  
  const handleRetry = () => {
    setNetworkError(null);
    handleSubmit(onSubmit)();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Network Error Retry UI */}
      {networkError && (
        <NetworkErrorRetry
          onRetry={handleRetry}
          isRetrying={isSubmitting}
          message={getErrorMessage(networkError)}
        />
      )}
      
      {/* Form fields with FieldError */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} />
        <FieldError message={errors.email?.message} fieldId="email" />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

## Error Message Mapping

The system maps API error codes to user-friendly messages:

- `INVALID_NIN` → "The NIN you entered is invalid. Please check and try again."
- `SESSION_EXPIRED` → "Your session has expired. Please log in again."
- `FILE_TOO_LARGE` → "The file you uploaded is too large. Please upload a smaller file."
- `NETWORK_ERROR` → "Unable to connect to the server. Please check your internet connection."
- And many more...

## Session Timeout Handling

When a session timeout is detected:
1. Auth tokens are cleared from localStorage
2. User is redirected to login page
3. Error message is passed via URL search params
4. Toast notification is shown

## Network Error Handling

Network errors trigger:
1. Automatic retry with exponential backoff (in API client)
2. Manual retry UI component
3. User-friendly error message
4. Loading state during retry

## Error Boundary

All registration routes are wrapped in an ErrorBoundary via RegistrationLayout:
- Catches unhandled React errors
- Displays fallback UI
- Logs errors with context
- Provides "Try Again" and "Refresh Page" options

## Forms Updated

- ✅ AccountCreationForm - Full error handling integration
- ⏳ PersonalInfoForm - Needs update
- ⏳ NINVerificationForm - Needs update
- ⏳ ProfessionalInfoForm - Needs update
- ⏳ PracticeInfoForm - Needs update
- ⏳ DocumentUploadForm - Needs update
- ⏳ RegistrationSummary - Needs update

## Requirements Satisfied

- ✅ 11.1: Field-level error display (FieldError component)
- ✅ 11.2: API error toast notifications (toast-notifications.ts)
- ✅ 11.3: Network error retry UI (NetworkErrorRetry component)
- ✅ 11.4: Session timeout redirect (handleSessionTimeout function)
- ✅ 11.5: User-friendly error messages (error-handler.ts)
- ✅ Error boundaries (ErrorBoundary component)
- ✅ Loading states (handled in forms with isSubmitting)

## Next Steps

1. Update remaining forms with new error handling pattern
2. Test error scenarios:
   - Network failures
   - Session timeouts
   - Validation errors
   - API errors
3. Add error tracking service integration (e.g., Sentry)
4. Monitor error logs in production
