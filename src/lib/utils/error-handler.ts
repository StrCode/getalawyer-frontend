import { ApiError } from '../api/client';

export interface ErrorInfo {
  title: string;
  message: string;
  canRetry: boolean;
  isClientError: boolean;
  isServerError: boolean;
  isNetworkError: boolean;
}

/**
 * Handle API errors and return user-friendly error information
 */
export function handleApiError(error: unknown): ErrorInfo {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    if (error.status >= 400 && error.status < 500) {
      // Client error - user can fix
      return {
        title: 'Invalid Request',
        message: error.message || 'Please check your input and try again.',
        canRetry: true,
        isClientError: true,
        isServerError: false,
        isNetworkError: false,
      };
    } else if (error.status >= 500) {
      // Server error - backend issue
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        canRetry: true,
        isClientError: false,
        isServerError: true,
        isNetworkError: false,
      };
    }
  }

  // Handle network errors
  if (error instanceof Error && (error.name === 'NetworkError' || error.name === 'TypeError')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect. Please check your internet connection.',
      canRetry: true,
      isClientError: false,
      isServerError: false,
      isNetworkError: true,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      canRetry: true,
      isClientError: false,
      isServerError: false,
      isNetworkError: false,
    };
  }

  // Fallback for unknown errors
  return {
    title: 'Error',
    message: 'An unexpected error occurred.',
    canRetry: true,
    isClientError: false,
    isServerError: false,
    isNetworkError: false,
  };
}

/**
 * Get error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error is a validation error (4xx)
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 500;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'NetworkError' || error.name === 'TypeError');
}

/**
 * Log error to console (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: string): void {
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  
  // TODO: Send to error tracking service (e.g., Sentry)
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}
