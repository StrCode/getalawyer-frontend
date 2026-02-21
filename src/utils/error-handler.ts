import { REGISTRATION_ERROR_MESSAGES } from '@/constants/registration';
import { ApiError } from '@/lib/api/client';

/**
 * Error code to user-friendly message mapping
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  // NIN Verification Errors
  INVALID_NIN: 'The NIN you entered is invalid. Please check and try again.',
  NIN_ALREADY_REGISTERED: 'This NIN is already registered in our system.',
  NIN_VERIFICATION_FAILED: 'NIN verification failed. Please try again later.',
  NIN_SERVICE_UNAVAILABLE: 'NIN verification service is temporarily unavailable. Please try again later.',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'The file you uploaded is too large. Please upload a smaller file.',
  INVALID_FILE_TYPE: 'This file type is not supported. Please upload a PDF or image file.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Authentication Errors
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_TOKEN: 'Your session is invalid. Please log in again.',
  
  // Validation Errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  EMAIL_ALREADY_EXISTS: 'This email is already registered.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with a number and special character.',
  
  // Registration Errors
  REGISTRATION_NOT_FOUND: 'Registration not found. Please start the registration process.',
  INVALID_REGISTRATION_STATUS: 'Invalid registration status. Please contact support.',
  REGISTRATION_ALREADY_SUBMITTED: 'Your application has already been submitted.',
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
  
  // Network Errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
};

/**
 * Maps API errors to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    // Check for specific error codes
    if (error.code && ERROR_CODE_MESSAGES[error.code]) {
      return ERROR_CODE_MESSAGES[error.code];
    }

    // Handle HTTP status codes
    switch (error.status) {
      case 400:
        return error.message || REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
      case 401:
        return ERROR_CODE_MESSAGES.SESSION_EXPIRED;
      case 403:
        return ERROR_CODE_MESSAGES.UNAUTHORIZED;
      case 404:
        return error.message || 'The requested resource was not found.';
      case 408:
        return ERROR_CODE_MESSAGES.TIMEOUT_ERROR;
      case 413:
        return ERROR_CODE_MESSAGES.FILE_TOO_LARGE;
      case 422:
        return error.message || ERROR_CODE_MESSAGES.VALIDATION_ERROR;
      case 429:
        return ERROR_CODE_MESSAGES.RATE_LIMIT_EXCEEDED;
      case 500:
        return ERROR_CODE_MESSAGES.INTERNAL_SERVER_ERROR;
      case 502:
      case 503:
      case 504:
        return ERROR_CODE_MESSAGES.SERVICE_UNAVAILABLE;
      default:
        return error.message || REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ERROR_CODE_MESSAGES.NETWORK_ERROR;
    }
    
    return error.message || REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Checks if an error is a session timeout error
 */
export function isSessionTimeoutError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.code === 'SESSION_EXPIRED' || error.code === 'INVALID_TOKEN';
  }
  return false;
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return [408, 502, 503, 504].includes(error.status);
  }
  
  if (error instanceof Error) {
    return error.name === 'TypeError' && error.message.includes('fetch');
  }
  
  return false;
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on network errors and server errors
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }
  
  // Retry on network errors
  return isNetworkError(error);
}

/**
 * Handles session timeout by clearing auth state and redirecting to login
 */
export function handleSessionTimeout(navigate: (options: { to: string; search?: Record<string, string> }) => void) {
  // Clear auth tokens
  localStorage.removeItem('lawyer_token');
  localStorage.removeItem('lawyer_id');
  
  // Redirect to login with timeout message
  navigate({
    to: '/login',
    search: {
      error: 'session_expired',
      message: ERROR_CODE_MESSAGES.SESSION_EXPIRED,
    },
  });
}

/**
 * Logs errors for debugging (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
  
  // TODO: Send to error tracking service (e.g., Sentry) in production
}
