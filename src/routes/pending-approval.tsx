import { createFileRoute, redirect } from '@tanstack/react-router';
import { PendingApprovalDashboard } from '@/components/registration/PendingApprovalDashboard';
import { SEOHead } from '@/components/seo/SEOHead';
import { registrationAPI } from '@/lib/api/registration';
// import { getSession } from '@/lib/auth-client';
import { generateAuthPageSEO } from '@/utils/seo';

/**
 * Pending Approval Route
 * 
 * Displays the pending approval dashboard for lawyers who have
 * submitted their registration application and are awaiting
 * administrative review.
 * 
 * Features:
 * - Authentication guard - requires user to be logged in (COMMENTED OUT)
 * - Status check - only accessible if registration status is 'submitted'
 * - Redirects to appropriate page if status is not 'submitted'
 * - SEO metadata for the page
 * - Auto-refresh status every 30 seconds
 * 
 * Requirements:
 * - 7.12: Redirect to pending approval dashboard after submission
 * - 9.3: Display pending approval status for submitted applications
 * - 10.1: Authentication guard for protected pages
 */
export const Route = createFileRoute('/pending-approval')({
  beforeLoad: async () => {
    // Step 1: Check authentication (COMMENTED OUT - allows access without login)
    // Requirement 10.1: Authentication guard
    /*
    const session = await getSession();
    
    if (!session?.user) {
      // Redirect to login if not authenticated
      throw redirect({
        to: '/login',
        search: {
          redirect: '/pending-approval',
        },
      });
    }
    */

    // Step 2: Check registration status
    // Requirement 9.3: Only allow access if status is 'submitted'
    try {
      const statusResponse = await registrationAPI.getRegistrationStatus();
      const currentStatus = statusResponse.registration_status;

      // If status is not 'submitted', redirect to appropriate page
      if (currentStatus === 'approved') {
        // Approved users should go to main dashboard
        throw redirect({
          to: '/dashboard',
        });
      }
      
      if (currentStatus === 'rejected') {
        // Rejected users can restart registration from auth/register
        throw redirect({
          to: '/auth/register',
          search: { type: 'lawyer' },
        });
      }
      
      // If status is step1-step7, redirect to the correct registration step
      if (currentStatus.startsWith('step')) {
        throw redirect({
          to: `/register/${currentStatus}`,
        });
      }

      // Status is 'submitted' - allow access to pending approval page
    } catch (error) {
      // If error is a redirect, re-throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
      
      // For other errors, log and allow access
      // (component will handle error display)
      console.error('Error checking registration status:', error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: 'Application Pending Approval - Lawyer Registration',
    description: 'Your lawyer registration application has been submitted and is pending administrative review.',
    path: '/pending-approval',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <PendingApprovalDashboard />
    </>
  );
}


