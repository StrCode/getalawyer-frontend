import { redirect } from '@tanstack/react-router';
import { type RegistrationStatus, registrationAPI } from '@/lib/api/registration';
import { getSession } from '@/lib/auth-client';

/**
 * Registration Route Guards
 * 
 * Centralized authentication and status-based navigation enforcement
 * for the 5-step lawyer registration system (document upload removed).
 * 
 * Requirements:
 * - 8.3: Navigation guards for future steps
 * - 8.4: Backward navigation allowance
 * - 9.1: Status check on page load
 * - 9.2: Redirect to correct step based on status
 * - 9.3: Redirect to pending approval when submitted
 * - 9.4: Redirect to main dashboard when approved
 * - 10.1: Authentication guard for protected steps
 * - 10.2: Validate registration status on backend
 * - 10.3: Prevent step skipping via URL manipulation
 */

/**
 * Map registration status to the corresponding step route
 * Note: step1 is now handled by /auth/register, so registration starts at step2
 * Note: step6 (document upload) has been removed, step7 is now the final step
 */
const STATUS_TO_ROUTE: Record<RegistrationStatus, string> = {
  step1: '/register/step2', // step1 status maps to step2 route (Personal Information)
  step2: '/register/step2',
  step3: '/register/step3',
  step4: '/register/step4',
  step5: '/register/step5',
  step6: '/register/step7', // step6 status now maps to step7 (Review & Submit) - document upload removed
  step7: '/register/step7',
  submitted: '/pending-approval',
  approved: '/dashboard',
  rejected: '/auth/register', // Allow restart from auth register
};

/**
 * Get the step number from a registration status
 */
function getStepNumber(status: RegistrationStatus): number {
  const stepMatch = status.match(/^step(\d+)$/);
  return stepMatch ? Number.parseInt(stepMatch[1], 10) : 0;
}

/**
 * Check if a user can access a specific step based on their current status
 * 
 * Rules:
 * - Users can access their current step
 * - Users can access previous completed steps (backward navigation)
 * - Users cannot skip ahead to future steps
 * - Submitted applications redirect to pending approval
 * - Approved applications redirect to dashboard
 * - Rejected applications can restart from step 1
 */
function canAccessStep(
  currentStatus: RegistrationStatus,
  targetStep: number
): { allowed: boolean; redirectTo?: string } {
  // Handle special statuses
  if (currentStatus === 'submitted') {
    return { allowed: false, redirectTo: '/pending-approval' };
  }
  
  if (currentStatus === 'approved') {
    return { allowed: false, redirectTo: '/dashboard' };
  }
  
  if (currentStatus === 'rejected') {
    // Rejected users can access any step to restart registration
    return { allowed: true };
  }

  const currentStep = getStepNumber(currentStatus);
  
  // Allow access to current step or any previous step (backward navigation)
  // Requirement 8.4: Backward navigation allowance
  if (targetStep <= currentStep) {
    return { allowed: true };
  }
  
  // Prevent access to future steps
  // Requirement 8.3: Navigation guards for future steps
  // Requirement 10.3: Prevent step skipping via URL manipulation
  return { allowed: false, redirectTo: STATUS_TO_ROUTE[currentStatus] };
}

/**
 * Registration route guard for protected steps (steps 2-7)
 * 
 * This function should be used in the beforeLoad hook of each registration step route.
 * It performs the following checks:
 * 1. Authentication check - redirects to login if not authenticated
 * 2. Registration status check - fetches current status from backend
 * 3. Navigation enforcement - redirects to correct step if user tries to skip ahead
 * 
 * @param targetStep - The step number the user is trying to access (1-7)
 * @param requireAuth - Whether authentication is required (default: true, false for step 1)
 * 
 * Requirements:
 * - 10.1: Authentication guard for protected steps
 * - 10.2: Validate registration status on backend
 * - 9.1: Status check on page load
 * - 9.2: Redirect to correct step based on status
 */
export async function registrationRouteGuard(
  targetStep: number,
  requireAuth = true
): Promise<void> {
  console.log(`[RegistrationGuard] Checking access to step ${targetStep}, requireAuth:`, requireAuth);
  
  // TEMPORARY: Disable auth check to debug session issue
  console.log("[RegistrationGuard] TEMPORARILY BYPASSING AUTH CHECK FOR DEBUGGING");
  
  // Step 1: Check authentication (skip for step 1)
  // Requirement 10.1: Authentication guard for protected steps
  if (requireAuth) {
    const session = await getSession();
    console.log("[RegistrationGuard] Session check result:", session);
    console.log("[RegistrationGuard] User from session:", session?.user);
    console.log("[RegistrationGuard] User role:", session?.user?.role);
    
    if (!session?.user) {
      // Redirect to login if not authenticated
      console.log("[RegistrationGuard] No user found, BUT ALLOWING ACCESS FOR DEBUGGING");
      // TEMPORARY: Comment out redirect
      // throw redirect({
      //   to: '/login',
      //   search: {
      //     redirect: `/register/step${targetStep}`,
      //   },
      // });
    } else {
      console.log("[RegistrationGuard] User authenticated, proceeding to status check");
    }
  }

  // Step 2: Check registration status
  // Requirement 10.2: Validate registration status on backend
  // Requirement 9.1: Status check on page load
  console.log("[RegistrationGuard] TEMPORARILY BYPASSING STATUS CHECK FOR DEBUGGING");
  // TEMPORARY: Comment out status check
  // try {
  //   console.log("[RegistrationGuard] Fetching registration status from API");
  //   const statusResponse = await registrationAPI.getRegistrationStatus();
  //   const currentStatus = statusResponse.registration_status;
  //   console.log("[RegistrationGuard] Current registration status:", currentStatus);

  //   // Step 3: Enforce navigation rules
  //   // Requirement 9.2: Redirect to correct step based on status
  //   const accessCheck = canAccessStep(currentStatus, targetStep);
  //   console.log("[RegistrationGuard] Access check result:", accessCheck);
    
  //   if (!accessCheck.allowed && accessCheck.redirectTo) {
  //     console.log("[RegistrationGuard] Access denied, redirecting to:", accessCheck.redirectTo);
  //     throw redirect({
  //       to: accessCheck.redirectTo,
  //     });
  //   }
    
  //   console.log("[RegistrationGuard] Access granted to step", targetStep);
  // } catch (error) {
  //   // If status check fails, allow access (will handle error in component)
  //   // This prevents blocking users if the API is temporarily unavailable
  //   console.error('[RegistrationGuard] Error checking registration status:', error);
  // }
  
  console.log("[RegistrationGuard] ALLOWING ACCESS (DEBUG MODE)");
}

/**
 * Get the correct route for a given registration status
 * 
 * This is used by the /register index route to redirect users
 * to the appropriate step based on their current status.
 * 
 * Requirements:
 * - 9.1: Status check on page load
 * - 9.2: Redirect to correct step based on status
 * - 9.3: Redirect to pending approval when submitted
 * - 9.4: Redirect to main dashboard when approved
 */
export function getRouteForStatus(status: RegistrationStatus): string {
  return STATUS_TO_ROUTE[status];
}

/**
 * Check if backward navigation is allowed from current step to target step
 * 
 * Requirements:
 * - 8.4: Backward navigation allowance
 */
export function isBackwardNavigationAllowed(
  currentStatus: RegistrationStatus,
  targetStep: number
): boolean {
  if (currentStatus === 'rejected') {
    return true; // Rejected users can navigate anywhere
  }
  
  const currentStep = getStepNumber(currentStatus);
  return targetStep < currentStep;
}
