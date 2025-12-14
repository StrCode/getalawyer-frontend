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

  postFormData: async <T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit,
  ): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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

export interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface SpecializationResponse {
  specializations: Array<Specialization>;
}

export interface OnBoardingRequest {
  country: string;
  state: string;
  specializationIds: Array<string>;
}

export interface OnboardingStatusResponse {
  success: boolean;
  onboarding_completed: boolean;
}

export interface Profile {
  userId: string;
  name: string;
  email: string;
  image: any;
  role: string;
  onboardingCompleted: boolean;
  clientId: string;
  company: any;
  country: string;
  state: string;
  phoneNumber: any;
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

interface OnBoardingLawyerBasics {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
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
    getLawyerProfile: () => httpClient.getAuth("/api/lawyers/profile"),
    basicsSetup: (data: OnBoardingLawyerBasics) =>
      httpClient.patch<AuthResponse>(
        "/api/lawyers/onboarding/practice-info",
        data,
      ),
    // credentialsSetup: (data) =>
    // httpClient.patch<AuthResponse>("/api/lawyers/credentials", data),
  },
};

export { httpClient };
