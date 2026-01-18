/**
 * NIN Verification Service
 * 
 * Handles National Identification Number (NIN) verification via external API
 * with retry logic and comprehensive error handling.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * NIN Verification Request
 */
export interface NINVerificationRequest {
  nin: string;
}

/**
 * NIN Verification Response Data
 */
export interface NINVerificationData {
  nin: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  // Additional fields from NIN API can be added here
}

/**
 * NIN Verification Response
 */
export interface NINVerificationResponse {
  success: boolean;
  data?: NINVerificationData;
  error?: string;
  message?: string;
}

/**
 * Custom error class for NIN verification errors
 */
export class NINVerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'NINVerificationError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 */
const calculateBackoffDelay = (attempt: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 8000; // 8 seconds
  const exponentialDelay = baseDelay * (2 ** (attempt - 1));
  // Add jitter (random factor between 0.5 and 1.5)
  const jitteredDelay = exponentialDelay * (0.5 + Math.random());
  return Math.min(jitteredDelay, maxDelay);
};

/**
 * Verify NIN via external API with retry logic
 * 
 * @param nin - The 11-digit National Identification Number
 * @returns Promise resolving to verification response
 * @throws NINVerificationError for non-retryable errors
 * 
 * Requirements: 3.2, 3.3, 3.4, 8.2, 8.5
 */
export async function verifyNIN(nin: string): Promise<NINVerificationResponse> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  // Validate NIN format before making API calls
  if (!nin || nin.length !== 11 || !/^\d{11}$/.test(nin)) {
    throw new NINVerificationError(
      'Invalid NIN format. NIN must be exactly 11 digits.',
      'INVALID_FORMAT',
      false,
    );
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}/api/lawyers/verify-nin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({ nin }),
      });

      // Handle successful response
      if (response.ok) {
        const data: NINVerificationResponse = await response.json();
        return data;
      }

      // Parse error response
      const errorData = await response.json().catch(() => ({
        error: 'An error occurred during verification',
        message: 'An error occurred during verification',
      }));

      // Handle specific HTTP status codes
      if (response.status === 400) {
        // Bad request - invalid NIN format or data
        throw new NINVerificationError(
          errorData.error || errorData.message || 'Invalid NIN provided',
          'INVALID_NIN',
          false,
        );
      }

      if (response.status === 404) {
        // NIN not found in database
        throw new NINVerificationError(
          errorData.error || errorData.message || 'NIN not found in database',
          'NIN_NOT_FOUND',
          false,
        );
      }

      if (response.status === 429) {
        // Rate limit exceeded
        throw new NINVerificationError(
          errorData.error || errorData.message || 'Too many verification attempts. Please try again later.',
          'RATE_LIMIT_EXCEEDED',
          true,
        );
      }

      if (response.status === 401 || response.status === 403) {
        // Authentication/authorization error
        throw new NINVerificationError(
          errorData.error || errorData.message || 'Authentication required',
          'AUTH_ERROR',
          false,
        );
      }

      if (response.status >= 500) {
        // Server error - retryable
        const error = new NINVerificationError(
          errorData.error || errorData.message || 'Verification service temporarily unavailable',
          'SERVER_ERROR',
          true,
        );
        lastError = error;

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        const delay = calculateBackoffDelay(attempt);
        await sleep(delay);
        continue;
      }

      // Other client errors (4xx) - not retryable
      throw new NINVerificationError(
        errorData.error || errorData.message || `Verification failed with status ${response.status}`,
        'VERIFICATION_FAILED',
        false,
      );

    } catch (error) {
      // Handle NINVerificationError
      if (error instanceof NINVerificationError) {
        // If not retryable, throw immediately
        if (!error.retryable) {
          throw error;
        }

        // If retryable and not last attempt, continue to retry
        lastError = error;
        if (attempt < maxAttempts) {
          const delay = calculateBackoffDelay(attempt);
          await sleep(delay);
          continue;
        }

        // Last attempt failed, throw the error
        throw error;
      }

      // Handle network errors (TypeError for fetch failures)
      if (error instanceof TypeError) {
        const networkError = new NINVerificationError(
          'Network error. Please check your connection and try again.',
          'NETWORK_ERROR',
          true,
        );
        lastError = networkError;

        // Retry network errors
        if (attempt < maxAttempts) {
          const delay = calculateBackoffDelay(attempt);
          await sleep(delay);
          continue;
        }

        throw networkError;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new NINVerificationError(
          'Request timed out. Please try again.',
          'TIMEOUT',
          true,
        );
        lastError = timeoutError;

        if (attempt < maxAttempts) {
          const delay = calculateBackoffDelay(attempt);
          await sleep(delay);
          continue;
        }

        throw timeoutError;
      }

      // Unknown error
      const unknownError = new NINVerificationError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'UNKNOWN_ERROR',
        true,
      );
      lastError = unknownError;

      if (attempt < maxAttempts) {
        const delay = calculateBackoffDelay(attempt);
        await sleep(delay);
        continue;
      }

      throw unknownError;
    }
  }

  // Should never reach here, but throw last error if we do
  throw lastError || new NINVerificationError(
    'Verification failed after all retry attempts',
    'MAX_RETRIES_EXCEEDED',
    false,
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NINVerificationError) {
    return error.retryable;
  }
  return false;
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof NINVerificationError) {
    switch (error.code) {
      case 'INVALID_FORMAT':
        return 'Please enter a valid 11-digit NIN.';
      case 'INVALID_NIN':
        return 'The NIN you entered is invalid. Please check and try again.';
      case 'NIN_NOT_FOUND':
        return 'NIN not found in the database. Please verify your NIN is correct.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many verification attempts. Please wait a few minutes and try again.';
      case 'AUTH_ERROR':
        return 'Authentication required. Please log in and try again.';
      case 'SERVER_ERROR':
        return 'The verification service is temporarily unavailable. Please try again in a few moments.';
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection and try again.';
      case 'TIMEOUT':
        return 'The request timed out. Please try again.';
      case 'MAX_RETRIES_EXCEEDED':
        return 'Verification failed after multiple attempts. Please try again later or contact support.';
      default:
        return error.message || 'An error occurred during verification. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
