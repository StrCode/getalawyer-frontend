const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: Array<number>;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 0, // Disabled - TanStack Query handles retries at the hook level
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Enhanced error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Sleep utility for retry delays
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay
const calculateDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  const exponentialDelay = baseDelay * (2 ** (attempt - 1));
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
  return Math.min(jitteredDelay, maxDelay);
};

// Enhanced request function with retry logic
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
    try {
      // Don't set Content-Type for FormData - let browser handle it
      const isFormData = options.body instanceof FormData;
      const defaultHeaders: Record<string, string> = isFormData 
        ? { Accept: "application/json" }
        : { "Content-Type": "application/json", Accept: "application/json" };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "An error occurred",
          message: "An error occurred",
        }));

        const apiError = new ApiError(
          errorData.error || errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code,
          errorData.details,
        );

        // Don't retry client errors (4xx) except for specific cases
        if (response.status >= 400 && response.status < 500 && 
            !retryConfig.retryableStatuses.includes(response.status)) {
          throw apiError;
        }

        // Don't retry on the last attempt
        if (attempt > retryConfig.maxRetries) {
          throw apiError;
        }

        // Check if this status code should be retried
        if (!retryConfig.retryableStatuses.includes(response.status)) {
          throw apiError;
        }

        lastError = apiError;
      } else {
        return response.json();
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Unknown error');
      lastError = errorInstance;
      
      // Don't retry on the last attempt
      if (attempt > retryConfig.maxRetries) {
        throw lastError;
      }

      // Don't retry non-network errors
      if (!(error instanceof ApiError) && errorInstance.name !== 'TypeError') {
        throw lastError;
      }
    }

    // Wait before retrying
    if (attempt <= retryConfig.maxRetries) {
      const delay = calculateDelay(attempt, retryConfig.baseDelay, retryConfig.maxDelay);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

// Unauthenticated request (no credentials)
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return makeRequest<T>(endpoint, options);
}

// Authenticated request (with credentials)
async function requestAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return makeRequest<T>(endpoint, {
    ...options,
    credentials: "include", // Always include credentials
  });
}

// HTTP method helpers
const httpClient = {
  // Unauthenticated methods
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  // Authenticated methods
  getAuth: <T>(endpoint: string, options?: RequestInit) =>
    requestAuth<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    requestAuth<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  postBlob: async (endpoint: string, data?: unknown, options?: RequestInit): Promise<Blob> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/octet-stream",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Export failed",
        message: "Export failed",
      }));
      throw new ApiError(
        errorData.error || errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code,
        errorData.details,
      );
    }

    return response.blob();
  },

  postFormData: async <T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit,
  ): Promise<T> => {
    return requestAuth<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    requestAuth<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    requestAuth<T>(endpoint, {
      ...options,
      method: "DELETE",
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    requestAuth<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Type definitions for API responses
interface CheckEmailResponse {
  success: boolean;
  exists: boolean;
  user?: {
    email: string;
    name: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
    };
  };
}

// Enhanced type definitions based on API specification
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type OnboardingStep = "practice_info" | "documents" | "specializations" | "submitted";
export type DocumentType = "bar_license" | "certification";

export interface Lawyer {
  id: string;
  userId: string;
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
  applicationStatus: ApplicationStatus;
  onboardingStep: OnboardingStep;
  reviewNotes?: string;
  experienceDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LawyerDocument {
  id: string;
  lawyerId: string;
  type: DocumentType;
  url: string;
  publicId: string;
  originalName?: string;
  createdAt: string;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface OnboardingStatusResponse {
  currentStep: OnboardingStep;
  lawyer: Lawyer | null;
  documents: Array<LawyerDocument>;
  specializations: Array<Specialization>;
}

interface SpecializationResponse {
  specializations: Array<Specialization>;
}

export interface OnBoardingRequest {
  country: string;
  state: string;
  specializationIds: Array<string>;
}

export interface Profile {
  userId: string;
  name: string;
  email: string;
  image: unknown;
  role: string;
  onboardingCompleted: boolean;
  clientId: string;
  company: unknown;
  country: string;
  state: string;
  phoneNumber: unknown;
  clientCreatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  profile: Profile;
}

interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
  state: string;
  country: string;
}

export interface CountriesRequest {
  success: boolean;
  data: Array<Countries>;
}

export interface Countries {
  code2: string;
  code3: string;
  name: string;
  capital: string;
  region: string;
  subregion: string;
  states: Array<State>;
}

export interface State {
  code: string;
  name: string;
  subdivision: string;
}

// Form Input Types
export interface PracticeInfoInput {
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
}

export interface DocumentInput {
  type: DocumentType;
  url: string;
  publicId: string;
  originalName?: string;
}

export interface DocumentsInput {
  documents: Array<DocumentInput>;
}

export interface SpecializationInput {
  specializationId: string;
  yearsOfExperience: number;
}

export interface CompleteOnboardingInput {
  specializations: Array<SpecializationInput>;
  experienceDescription?: string;
}

// Legacy types for backward compatibility
interface OnBoardingLawyerBasics {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
}

interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document: {
    id: string;
    type: 'bar_license' | 'certification';
    url: string;
    publicId: string;
    originalName: string;
    createdAt: string;
  };
}

interface DocumentMetadata {
  documentType: 'bar_certificate' | 'law_degree' | 'license' | 'other';
  description?: string;
  expiryDate?: string;
}

interface CredentialsData {
  barNumber: string;
  admissionYear: number;
  lawSchool: string;
  graduationYear: number;
  currentFirm?: string;
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    metadata: DocumentMetadata;
  }>;
}

// Standard API Response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: string;
}

// API wrapper
export const api = {
  countries: {
    getCountries: () => httpClient.getAuth<CountriesRequest>("/api/countries"),
    getStatesbyCountry: (code: string) =>
      httpClient.getAuth(`/api/countries/${code}/states`),
  },
  checks: {
    // Authenticated - requires credentials
    checkBoarding: () =>
      httpClient.getAuth<{ success: boolean; onboarding_completed: boolean }>("/api/boards"),
  },
  auth: {
    // Public - no credentials needed
    checkEmail: (email: string) =>
      httpClient.get<CheckEmailResponse>(
        `/api/auth/check-email?email=${encodeURIComponent(email)}`,
      ),
    // Public - registration doesn't need existing credentials
    register: (data: RegisterRequest) =>
      httpClient.post<AuthResponse>("/api/auth/register", data),
    // Public - login doesn't need existing credentials
    login: (data: LoginRequest) =>
      httpClient.post<AuthResponse>("/api/auth/login", data),
  },
  specialization: {
    // Public - can view specializations without auth
    getAll: () =>
      httpClient.get<SpecializationResponse>("/api/specializations"),
    // Get specialization by ID
    getById: (id: string) =>
      httpClient.get<{ specialization: Specialization }>(`/api/specializations/${id}`),
  },
  client: {
    // Authenticated - requires credentials
    getProfile: () => httpClient.getAuth<ProfileResponse>("/api/clients/me"),
    uploadAvatar: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await httpClient.postFormData<{
        success: boolean;
        imageUrl: string;
      }>("/api/clients/upload-avatar", formData);

      return response.imageUrl;
    },
    updateProfile: (data: UpdateProfileRequest) =>
      httpClient.patch<AuthResponse>("/api/clients/me", data),
    completeOnBoarding: (data: OnBoardingRequest) =>
      httpClient.post<AuthResponse>("/api/clients/onboarding/complete", data),
  },
  lawyer: {
    // Enhanced lawyer onboarding endpoints based on API specification
    
    // Get comprehensive onboarding status
    getOnboardingStatus: () =>
      httpClient.getAuth<OnboardingStatusResponse>("/api/lawyers/onboarding/status"),

    // Step 1: Save practice information (basics step)
    savePracticeInfo: (data: PracticeInfoInput) =>
      httpClient.patch<ApiResponse<Lawyer>>("/api/lawyers/onboarding/practice-info", data),

    // Step 2: Save documents (credentials step)
    saveDocuments: (data: DocumentsInput) =>
      httpClient.patch<ApiResponse>("/api/lawyers/onboarding/documents", data),

    // Step 3: Complete onboarding with specializations
    completeOnboarding: (data: CompleteOnboardingInput) =>
      httpClient.post<ApiResponse<{
        lawyerId: string;
        specializationCount: number;
        status: "pending";
      }>>("/api/lawyers/onboarding/complete", data),

    // Legacy endpoints for backward compatibility
    getLawyerProfile: () => httpClient.getAuth("/api/lawyers/profile"),
    
    basicsSetup: (data: OnBoardingLawyerBasics) =>
      httpClient.patch<AuthResponse>(
        "/api/lawyers/onboarding/practice-info",
        data,
      ),
    
    // Document upload endpoints
    uploadDocument: async (
      file: File, 
      _metadata: DocumentMetadata,
      _onProgress?: (progress: number) => void
    ): Promise<DocumentUploadResponse> => {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", "bar_license");

      return httpClient.postFormData<DocumentUploadResponse>(
        "/api/lawyers/upload-document", 
        formData
      );
    },

    // Get uploaded documents
    getDocuments: () => 
      httpClient.getAuth<{ success: boolean; documents: Array<LawyerDocument> }>(
        "/api/lawyers/documents"
      ),

    // Delete document
    deleteDocument: (documentId: string) =>
      httpClient.delete<ApiResponse>(`/api/lawyers/documents/${documentId}`),

    // Update document metadata
    updateDocumentMetadata: (documentId: string, metadata: DocumentMetadata) =>
      httpClient.patch<ApiResponse>(`/api/lawyers/documents/${documentId}`, { metadata }),

    // Document lifecycle management endpoints
    moveDocumentToPermanent: (documentId: string) =>
      httpClient.patch<ApiResponse>(`/api/lawyers/documents/${documentId}/move-permanent`),

    cleanupOnboarding: () =>
      httpClient.delete<ApiResponse>("/api/lawyers/onboarding/cleanup"),

    getDocumentAuditTrail: (documentId: string) =>
      httpClient.getAuth<{ auditTrail: Array<{
        action: string;
        timestamp: string;
        userId: string;
        details?: string;
      }> }>(`/api/lawyers/documents/${documentId}/audit`),

    // Legacy credentials setup
    credentialsSetup: (data: CredentialsData) =>
      httpClient.patch<AuthResponse>(
        "/api/lawyers/onboarding/credentials", 
        data
      ),
  },
  subscriptions: {
    // Initialize subscription payment
    initialize: () =>
      httpClient.post<ApiResponse<{
        redirectUrl: string;
        reference: string;
        subscriptionId: string;
      }>>("/api/subscriptions/initialize"),

    // Get subscription status
    getStatus: () =>
      httpClient.getAuth<ApiResponse<{
        hasActiveSubscription: boolean;
        subscription: {
          id: string;
          status: 'active' | 'pending' | 'expired' | 'cancelled' | 'failed_renewal';
          subscriptionStartDate: string;
          subscriptionEndDate: string;
          nextBillingDate: string;
          daysRemaining: number;
          cardLast4: string;
          bank: string;
          autoRenewEnabled: boolean;
        } | null;
      }>>("/api/subscriptions/status"),

    // Verify payment after Paystack callback
    verify: (reference: string) =>
      httpClient.getAuth<ApiResponse<{
        status: 'active' | 'pending' | 'error';
        subscription?: {
          id: string;
          status: string;
          subscriptionEndDate: string;
        };
        message?: string;
      }>>(`/api/subscriptions/verify/${reference}`),
  },
  search: {
    // Search lawyers - Public endpoint
    searchLawyers: (params: {
      q?: string;
      specializations?: string[];
      minExperience?: number;
      maxExperience?: number;
      page?: number;
      limit?: number;
      sortBy?: 'relevance' | 'experience' | 'recent';
    }) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.append('q', params.q);
      if (params.specializations?.length) {
        // Join specializations with comma instead of repeating the parameter
        searchParams.append('specializations', params.specializations.join(','));
      }
      if (params.minExperience !== undefined) searchParams.append('minExperience', String(params.minExperience));
      if (params.maxExperience !== undefined) searchParams.append('maxExperience', String(params.maxExperience));
      if (params.page) searchParams.append('page', String(params.page));
      if (params.limit) searchParams.append('limit', String(params.limit));
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      
      return httpClient.get<any>(`/api/search/lawyers?${searchParams.toString()}`);
    },

    // Autocomplete suggestions - Public endpoint
    autocomplete: (q: string) => {
      const searchParams = new URLSearchParams({ q });
      return httpClient.get<any>(`/api/search/autocomplete?${searchParams.toString()}`);
    },

    // Get available filters - Public endpoint
    getFilters: (params?: {
      q?: string;
      minExperience?: number;
      maxExperience?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.q) searchParams.append('q', params.q);
      if (params?.minExperience !== undefined) searchParams.append('minExperience', String(params.minExperience));
      if (params?.maxExperience !== undefined) searchParams.append('maxExperience', String(params.maxExperience));
      
      return httpClient.get<any>(`/api/search/filters?${searchParams.toString()}`);
    },
  },
};

export { httpClient };
