/**
 * NIN Verification Service
 * 
 * Handles National Identification Number (NIN) verification via external API
 * with retry logic and comprehensive error handling.
 * 
 * MOCK MODE: When backend is not available, use these test NINs:
 * - Valid NINs: 12345678901, 98765432101, 55555555555
 * - Invalid NINs: 11111111111, 22222222222, 33333333333
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Mock mode flag - set to true to use mock data instead of API calls
const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_NIN === 'true';

// Valid test NINs for mock mode
const VALID_TEST_NINS = ['12345678901', '98765432101', '55555555555'];

// Mock data for valid NINs
const MOCK_NIN_DATA: Record<string, NINVerificationData> = {
  '12345678901': {
    verified: true,
    firstName: 'Chioma',
    lastName: 'Okafor',
    middleName: 'Adaeze',
  },
  '98765432101': {
    verified: true,
    firstName: 'Emeka',
    lastName: 'Nwosu',
    middleName: 'Chukwuemeka',
  },
  '55555555555': {
    verified: true,
    firstName: 'Aisha',
    lastName: 'Mohammed',
  },
};

/**
 * NIN Verification Request
 */
export interface NINVerificationRequest {
  nin: string;
  consent: boolean;
}

/**
 * NIN Verification Response Data
 */
export interface NINVerificationData {
  verified: boolean;
  firstName: string;
  lastName: string;
  middleName?: string;
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
  ) {
    super(message);
    this.name = 'NINVerificationError';
  }
}

/**
 * Sleep utility for mock mode delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verify NIN via external API
 * 
 * @param nin - The 11-digit National Identification Number
 * @param consent - User consent for NDPR compliance (required)
 * @returns Promise resolving to verification response
 * @throws NINVerificationError for errors
 * 
 * Requirements: 3.2, 3.3, 3.4, 8.2, 8.5
 * 
 * MOCK MODE TEST NINs:
 * Valid: 12345678901, 98765432101, 55555555555
 * Invalid: 11111111111, 22222222222, 33333333333
 */
export async function verifyNIN(nin: string, consent: boolean = true): Promise<NINVerificationResponse> {
  // Validate NIN format before making API calls
  if (!nin || nin.length !== 11 || !/^\d{11}$/.test(nin)) {
    throw new NINVerificationError(
      'Invalid NIN format. NIN must be exactly 11 digits.',
      'INVALID_FORMAT',
    );
  }

  // Mock mode - simulate API responses without backend
  if (USE_MOCK_MODE) {
    // Simulate network delay
    await sleep(1500);

    if (VALID_TEST_NINS.includes(nin)) {
      // Valid NIN - return success
      const mockData = MOCK_NIN_DATA[nin];
      const fullName = [mockData.firstName, mockData.middleName, mockData.lastName]
        .filter(Boolean)
        .join(' ');
      return {
        success: true,
        data: mockData,
        message: `[MOCK] NIN verified successfully for ${fullName}`,
      };
    } else {
      // Invalid NIN - return error
      return {
        success: false,
        error: `[MOCK] NIN not found in database. This is a test NIN. Valid test NINs: ${VALID_TEST_NINS.join(', ')}`,
        message: 'NIN verification failed',
      };
    }
  }

  try {
    const response = await fetch(`${API_URL}/api/register/step3/verify-nin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Include session cookies
      body: JSON.stringify({ nin, consent }),
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
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Invalid NIN or missing consent',
        'VALIDATION_ERROR',
      );
    }

    if (response.status === 404) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Lawyer profile not found. Complete practice info first.',
        'LAWYER_NOT_FOUND',
      );
    }

    if (response.status === 409) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'NIN has already been verified for this account.',
        'NIN_ALREADY_VERIFIED',
      );
    }

    if (response.status === 422) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'NIN verification failed. Please check the number and try again.',
        'NIN_VERIFICATION_FAILED',
      );
    }

    if (response.status === 424) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Third-party verification service error. Please try again later.',
        'NIN_SERVICE_THIRD_PARTY_FAILURE',
      );
    }

    if (response.status === 429) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Too many verification attempts. Please try again later.',
        'NIN_SERVICE_RATE_LIMITED',
      );
    }

    if (response.status === 502) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Invalid response from verification service. Please contact support.',
        'NIN_SERVICE_INVALID_RESPONSE',
      );
    }

    if (response.status === 503) {
      const code = errorData.code === 'NIN_SERVICE_MISCONFIGURED' 
        ? 'NIN_SERVICE_MISCONFIGURED' 
        : 'NIN_SERVICE_UNAVAILABLE';
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Verification service is currently unavailable. Please try again later.',
        code,
      );
    }

    if (response.status === 504) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Verification request timed out. Please try again.',
        'NIN_SERVICE_TIMEOUT',
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Authentication required',
        'UNAUTHORIZED',
      );
    }

    if (response.status >= 500) {
      throw new NINVerificationError(
        errorData.error || errorData.message || 'Verification service temporarily unavailable',
        'SERVER_ERROR',
      );
    }

    // Other client errors (4xx)
    throw new NINVerificationError(
      errorData.error || errorData.message || `Verification failed with status ${response.status}`,
      'VERIFICATION_FAILED',
    );

  } catch (error) {
    // Re-throw NINVerificationError as-is
    if (error instanceof NINVerificationError) {
      throw error;
    }

    // Handle network errors (TypeError for fetch failures)
    if (error instanceof TypeError) {
      throw new NINVerificationError(
        'Network error. Please check your connection and try again.',
        'NETWORK_ERROR',
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NINVerificationError(
        'Request timed out. Please try again.',
        'TIMEOUT',
      );
    }

    // Unknown error
    throw new NINVerificationError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'UNKNOWN_ERROR',
    );
  }
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof NINVerificationError) {
    switch (error.code) {
      case 'INVALID_FORMAT':
        return 'Please enter a valid 11-digit NIN.';
      case 'VALIDATION_ERROR':
        return 'Please check that your NIN is exactly 11 digits.';
      case 'LAWYER_NOT_FOUND':
        return 'Please complete your practice information before verifying your NIN.';
      case 'NIN_ALREADY_VERIFIED':
        return 'Your NIN has already been verified. You can proceed to the next step.';
      case 'NIN_VERIFICATION_FAILED':
        return 'We could not verify this NIN. Please check the number and try again.';
      case 'NIN_SERVICE_TIMEOUT':
        return 'The verification is taking longer than expected. Please try again.';
      case 'NIN_SERVICE_UNAVAILABLE':
        return 'The verification service is temporarily unavailable. Please try again in a few minutes.';
      case 'NIN_SERVICE_RATE_LIMITED':
        return 'Too many verification attempts. Please wait a few minutes before trying again.';
      case 'NIN_SERVICE_THIRD_PARTY_FAILURE':
        return 'There was an issue with the verification service. Please try again later.';
      case 'NIN_SERVICE_INVALID_RESPONSE':
        return 'Invalid response from verification service. Please contact support.';
      case 'NIN_SERVICE_MISCONFIGURED':
        return 'Verification service configuration error. Please contact support.';
      case 'UNAUTHORIZED':
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
