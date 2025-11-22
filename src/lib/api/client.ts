const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

// HTTP method helpers
const httpClient = {
	get: <T>(endpoint: string, options?: RequestInit) =>
		request<T>(endpoint, { ...options, method: "GET" }),

	post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
		request<T>(endpoint, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		}),

	put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
		request<T>(endpoint, {
			...options,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		}),

	delete: <T>(endpoint: string, options?: RequestInit) =>
		request<T>(endpoint, { ...options, method: "DELETE" }),
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

interface LoginRequest {
	email: string;
	password: string;
}

// API wrapper
export const api = {
	auth: {
		checkEmail: (email: string) =>
			httpClient.get<CheckEmailResponse>(
				`/api/auth/check-email?email=${encodeURIComponent(email)}`,
			),

		register: (data: RegisterRequest) =>
			httpClient.post<AuthResponse>("/api/auth/register", data),

		login: (data: LoginRequest) =>
			httpClient.post<AuthResponse>("/api/auth/login", data),
	},
};

export { httpClient };
