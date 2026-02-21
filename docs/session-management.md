# Session Management Documentation

## Overview

The GetaLawyer application uses **Better Auth** as its authentication and session management solution. Sessions are managed using HTTP-only cookies for security, with both client-side and server-side session handling.

## Authentication Library

### Better Auth
- **Library**: `better-auth` with React integration
- **Version**: Latest (check package.json)
- **Documentation**: https://www.better-auth.com/

### Key Features
- Cookie-based session management
- Social authentication (Google, Apple)
- Email/Password authentication
- Email OTP support
- Role-based access control
## Session Architecture

### Client-Side Session Management

#### Auth Client Configuration
**File**: `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  fetchOptions: {
    credentials: "include", // CRITICAL: Enables cookie transmission
  },
  plugins: [
    // Extends user model with custom fields
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        registration_status: {
          type: "string",
          required: false,
        },
      },
    }),
    emailOTPClient(),   // Email OTP support
  ],
});

// Exported hooks and methods
export const {
  getSession,      // Get current session
  useSession,      // React hook for session
  signIn,          // Sign in methods
  signUp,          // Sign up methods
  signOut,         // Sign out method
  forgetPassword,  // Password reset
  resetPassword,   // Password reset confirmation
} = authClient;
```

#### Session Hook Usage

The `useSession()` hook is used throughout the application to access session data:

```typescript
import { authClient } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = authClient.useSession();
  
  // session structure:
  // {
  //   user: {
  //     id: string;
  //     name: string;
  //     email: string;
  //     role: string;
  //     registration_status?: string; // For lawyers: step1-step7, submitted, approved, rejected
  //     image?: string;
  //   };
  //   session: {
  //     token: string;
  //     expiresAt: string;
  //   };
  // }
  
  if (isPending) return <div>Loading...</div>;
  if (!session?.user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {session.user.name}</div>;
}
```

### Server-Side Session Management

#### Server Function for Session Retrieval
**File**: `src/functions/get-user.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth-client";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const request = getRequest();
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Check if auth token exists in cookies
    const hasAuthToken = cookieHeader.includes("auth.token=");
    
    if (!hasAuthToken) {
      return null;
    }

    // Get session from Better Auth API
    const session = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: cookieHeader,
        },
      },
    });

    return session.data || null;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
});
```

## Cookie Management

### Cookie Structure

Better Auth uses HTTP-only cookies for session management:

```
Cookie Name: auth.token
Cookie Attributes:
  - HttpOnly: true (prevents JavaScript access)
  - Secure: true (HTTPS only in production)
  - SameSite: Lax (CSRF protection)
  - Path: /
  - Max-Age: Session duration (configurable)
```

### Cookie Flow

1. **Login/Registration**:
   - User submits credentials
   - Backend validates and creates session
   - Backend sets `auth.token` cookie in response
   - Cookie automatically included in subsequent requests

2. **Authenticated Requests**:
   - Browser automatically sends cookie with requests
   - Backend validates cookie and retrieves session
   - Session data returned to client

3. **Logout**:
   - Client calls `signOut()`
   - Backend invalidates session
   - Backend clears cookie
   - Client state updated

## Route Protection

### Protected Routes Structure

**File**: `src/routes/(protected)/route.tsx`

```typescript
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async () => {
    // Server-side session check
    const session = await getUser();
    
    // Uncomment to enforce authentication
    /* if (!session?.user) {
      throw redirect({ to: "/login" });
    } */
    
    // Make session available to child routes
    return { session };
  },
  component: () => <Outlet />,
});
```

### Role-Based Access Control

```typescript
// User roles
type UserRole = 
  | 'user'           // Regular client
  | 'lawyer'         // Lawyer

// Permission checks based on role
const isLawyer = (role: string) => role === 'lawyer';
const isClient = (role: string) => role === 'user';
```

## Authentication Flows

### Registration Flow

1. **Email & Name Collection** (Step 1):
   ```typescript
   // Check if email exists
   const response = await httpClient.get(
     `/api/checks/${encodeURIComponent(email)}`
   );
   
   if (response.exists) {
     // Show error
     return;
   }
   
   // Move to password step
   setStep("password");
   ```

2. **Password & Account Creation** (Step 2):
   ```typescript
   const { data, error } = await authClient.signUp.email({
     name: registrationData.name,
     email: registrationData.email,
     password: value.password,
     userType,  // 'user' or 'lawyer'
     // onboarding_completed removed - handled by new registration system
   });
   
   if (error) {
     // Handle error
     return;
   }
   
   // Redirect based on user type
   if (userType === 'user') {
     navigate({ to: "/dashboard" });
   } else {
     navigate({ to: "/register/step1" }); // New 7-step registration
   }
   ```

### Login Flow

```typescript
const { data, error } = await authClient.signIn.email({
  email: formData.email,
  password: formData.password,
});

if (error) {
  // Handle error
  return;
}

// Session automatically established via cookie
// Redirect to dashboard
navigate({ to: "/dashboard" });
```

### Social Authentication Flow

```typescript
const { data, error } = await authClient.signIn.social({
  provider: 'google', // or 'apple'
  callbackURL: '/dashboard', // or '/register/step1' for lawyers
});

// User redirected to OAuth provider
// After approval, redirected back with session cookie
```

### Logout Flow

```typescript
import { signOut } from "@/lib/auth-client";

const handleLogout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('registration-draft');
    localStorage.removeItem('offline-operation-queue');
    
    // Sign out (clears cookie)
    await signOut();
    
    // Redirect to home
    navigate({ to: '/' });
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/';
  }
};
```

## Session State Management

### Client-Side Session State

Better Auth manages session state internally using React Context:

```typescript
// Internal state structure (managed by Better Auth)
interface SessionState {
  data: Session | null;
  isPending: boolean;
  error: Error | null;
}

// Usage in components
const { data: session, isPending, error } = authClient.useSession();
```

### Session Persistence

- **Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Duration**: Configurable on backend (typically 7-30 days)
- **Refresh**: Automatic token refresh handled by Better Auth
- **Expiration**: Session expires after inactivity period

### Session Synchronization

Better Auth automatically synchronizes session state across:
- Multiple browser tabs
- Multiple windows
- After page refresh
- After network reconnection

## API Request Authentication

### Authenticated API Calls

**File**: `src/lib/api/client.ts`

```typescript
// Authenticated request helper
async function requestAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return makeRequest<T>(endpoint, {
    ...options,
    credentials: "include", // CRITICAL: Sends cookies
  });
}

// HTTP method helpers
const httpClient = {
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
};
```

### Request Flow with Authentication

```
Client Request
    ↓
Include credentials: "include"
    ↓
Browser automatically attaches auth.token cookie
    ↓
Backend receives request with cookie
    ↓
Backend validates session
    ↓
Backend processes request
    ↓
Backend sends response
    ↓
Client receives response
```

## Session Validation

### Client-Side Validation

```typescript
// Check if user is authenticated
const isAuthenticated = !!session?.user;

// Check if user has specific role
const hasRole = (role: string) => session?.user?.role === role;

// Check if user has completed registration (for lawyers)
const hasCompletedRegistration = session?.user?.registration_status === 'approved';
```

### Server-Side Validation

```typescript
// In route beforeLoad
const session = await getUser();

if (!session?.user) {
  throw redirect({ to: "/login" });
}

// Role-based validation
if (session.user.role !== 'lawyer') {
  throw redirect({ to: "/dashboard" });
}
```

## Session Refresh & Expiration

### Automatic Token Refresh

Better Auth handles token refresh automatically:
- Checks token expiration before requests
- Refreshes token if near expiration
- Updates cookie with new token
- Transparent to the application

### Session Expiration Handling

```typescript
// Better Auth automatically handles expired sessions
// When session expires:
// 1. useSession() returns null
// 2. Protected routes redirect to login
// 3. API requests return 401 Unauthorized

// Manual session check
const checkSession = async () => {
  const session = await authClient.getSession();
  
  if (!session.data) {
    // Session expired or invalid
    navigate({ to: "/login" });
  }
};
```

## Local Storage Usage

While session is cookie-based, local storage is used for:

### 1. Registration Progress (Lawyers)
```typescript
// Store registration form drafts
localStorage.setItem('registration-draft', JSON.stringify(formData));

// Registration progress is tracked server-side via registration_status
```

### 2. Offline Queue
```typescript
// Store operations for offline support
localStorage.setItem('offline-operation-queue', JSON.stringify(queue));
```

### 3. User Preferences
```typescript
// Store UI preferences (not sensitive data)
localStorage.setItem('theme', 'dark');
localStorage.setItem('sidebar-collapsed', 'true');
```

## Security Considerations

### Cookie Security

1. **HttpOnly**: Prevents XSS attacks (JavaScript cannot access)
2. **Secure**: HTTPS only in production
3. **SameSite**: CSRF protection
4. **Short-lived**: Tokens expire after period of inactivity

### Session Security Best Practices

1. **Never store sensitive data in localStorage**
   - Session tokens are in HTTP-only cookies
   - Only store non-sensitive UI state

2. **Validate on every request**
   - Server validates session on each API call
   - Client checks session before rendering protected content

3. **Clear data on logout**
   - Remove all local storage items
   - Invalidate server session
   - Clear cookies

4. **Handle session expiration gracefully**
   - Redirect to login when session expires
   - Show appropriate error messages
   - Preserve user's intended destination

## Migration to Nuxt

### Recommended Approach

1. **Use Nuxt Auth Module**:
   ```bash
   npm install @sidebase/nuxt-auth
   ```

2. **Configure Auth**:
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['@sidebase/nuxt-auth'],
     auth: {
       baseURL: process.env.API_URL,
       provider: {
         type: 'local',
         endpoints: {
           signIn: { path: '/api/auth/login', method: 'post' },
           signOut: { path: '/api/auth/logout', method: 'post' },
           signUp: { path: '/api/auth/register', method: 'post' },
           getSession: { path: '/api/auth/session', method: 'get' },
         },
         token: {
           signInResponseTokenPointer: '/token',
           type: 'Bearer',
           cookieName: 'auth.token',
           headerName: 'Authorization',
           maxAgeInSeconds: 60 * 60 * 24 * 7, // 7 days
         },
       },
       globalAppMiddleware: true,
     },
   });
   ```

3. **Use Composables**:
   ```typescript
   // In components
   const { data: session, status } = useAuth();
   const { signIn, signOut } = useAuth();
   
   // In middleware
   export default defineNuxtRouteMiddleware((to, from) => {
     const { status } = useAuth();
     
     if (status.value === 'unauthenticated') {
       return navigateTo('/login');
     }
   });
   ```

4. **Cookie Configuration**:
   ```typescript
   // Server-side cookie handling
   const cookies = useCookie('auth.token', {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 60 * 60 * 24 * 7, // 7 days
   });
   ```

### Key Differences

| React/Better Auth | Nuxt Auth |
|-------------------|-----------|
| `authClient.useSession()` | `useAuth()` |
| `authClient.signIn.email()` | `signIn()` |
| `authClient.signOut()` | `signOut()` |
| `getUser()` server function | `useAuth()` with SSR |
| Route `beforeLoad` | Nuxt middleware |
| Cookie via Better Auth | Cookie via Nuxt Auth |

### Migration Checklist

- [ ] Install `@sidebase/nuxt-auth`
- [ ] Configure auth module in `nuxt.config.ts`
- [ ] Create auth composables
- [ ] Implement middleware for protected routes
- [ ] Update API client to use Nuxt's `$fetch`
- [ ] Convert `useSession()` calls to `useAuth()`
- [ ] Update login/register forms
- [ ] Test cookie handling
- [ ] Test SSR session validation
- [ ] Test role-based access control

## Troubleshooting

### Common Issues

1. **Session not persisting**:
   - Check `credentials: "include"` in fetch options
   - Verify cookie domain matches
   - Check CORS configuration

2. **Session lost on refresh**:
   - Ensure cookies are HTTP-only
   - Check cookie expiration
   - Verify server session validation

3. **Unauthorized errors**:
   - Check if session expired
   - Verify cookie is being sent
   - Check backend session validation

4. **Social auth not working**:
   - Verify OAuth credentials
   - Check callback URL configuration
   - Ensure HTTPS in production

This documentation provides a complete overview of session management in the GetaLawyer application for your Nuxt migration.