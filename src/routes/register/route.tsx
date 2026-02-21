import { createFileRoute, redirect } from '@tanstack/react-router';
import { registrationAPI } from '@/lib/api/registration';
import { getSession } from '@/lib/auth-client';
import { getRouteForStatus } from '@/lib/guards/registration-guards';

/**
 * Registration Parent Route
 * 
 * This is a layout route for the 7-step lawyer registration system.
 * It checks the user's current registration status and redirects
 * them to the appropriate step when accessing /register directly.
 * 
 * Flow:
 * 1. Check if user is authenticated
 * 2. If not authenticated, redirect to step 1 (account creation)
 * 3. If authenticated, fetch registration status from backend
 * 4. Redirect to the correct step based on status
 * 
 * Requirements:
 * - 9.1: Status check on page load
 * - 9.2: Redirect to correct step based on status
 * - 9.3: Redirect to pending approval when submitted
 * - 9.4: Redirect to main dashboard when approved
 */
export const Route = createFileRoute('/register')({
  beforeLoad: async ({ location }) => {
    console.log("[RegisterRoute] beforeLoad triggered, pathname:", location.pathname);
    
    // Only redirect if accessing /register directly (not a child route)
    if (location.pathname === '/register' || location.pathname === '/register/') {
      console.log("[RegisterRoute] Accessing /register directly, checking auth");
      
      // Step 1: Check authentication
      const session = await getSession();
      console.log("[RegisterRoute] Session check result:", session);
      console.log("[RegisterRoute] User from session:", session?.data?.user);
      
      if (!session?.data?.user) {
        // Not authenticated - redirect to auth register page
        console.log("[RegisterRoute] No user found, redirecting to /auth/register");
        throw redirect({
          to: '/auth/register' as any,
          search: { type: 'lawyer' } as any,
        });
      }

      console.log("[RegisterRoute] User authenticated, fetching registration status");

      // Step 2: Fetch registration status
      // Requirement 9.1: Status check on page load
      try {
        const statusResponse = await registrationAPI.getRegistrationStatus();
        const currentStatus = statusResponse.registration_status;
        console.log("[RegisterRoute] Registration status:", currentStatus);

        // Step 3: Redirect to correct route based on status
        // Requirement 9.2: Redirect to correct step based on status
        // Requirement 9.3: Redirect to pending approval when submitted
        // Requirement 9.4: Redirect to main dashboard when approved
        const targetRoute = getRouteForStatus(currentStatus);
        console.log("[RegisterRoute] Redirecting to:", targetRoute);
        
        throw redirect({
          to: targetRoute,
        });
      } catch (error) {
        // If status check fails, default to step 2 (first step after account creation)
        console.error('[RegisterRoute] Error checking registration status:', error);
        console.log("[RegisterRoute] Defaulting to /register/step2");
        throw redirect({
          to: '/register/step2',
        });
      }
    }
    
    console.log("[RegisterRoute] Not accessing /register directly, allowing through");
  },
});

