import { authClient } from "../auth-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Unauthenticated request (no credentials)
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authenticated request (with credentials)
async function requestAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Always include credentials
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
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

export interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface SpecializationResponse {
  specializations: Specialization[];
}

export interface OnBoardingRequest {
  country: string;
  state: string;
  specializationIds: string[];
}

export interface OnboardingStatusResponse {
  success: boolean;
  onboarding_completed: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

// API wrapper
export const api = {
  countries: {
    getCountries: () =>
      httpClient.getAuth('/api/countries'),
    getStatesbyCountry: (code: string) =>
      httpClient.getAuth(`/api/countries/${code}/states`)
  },
  checks: {
    // Authenticated - requires credentials
    checkBoarding: () =>
      httpClient.getAuth<OnboardingStatusResponse>("/api/boards"),
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
  },
  client: {
    // Authenticated - requires credentials
    completeOnBoarding: (data: OnBoardingRequest) =>
      httpClient.post<AuthResponse>("/api/clients/onboarding/complete", data),
  },
};

export { httpClient };
