import { createFileRoute } from '@tanstack/react-router';
import { RegistrationSummary } from '@/components/registration/RegistrationSummary';
import { RegistrationLayout } from '@/components/registration/shared/RegistrationLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { TOTAL_STEPS } from '@/constants/registration';
import { registrationRouteGuard } from '@/lib/guards/registration-guards';
import { generateAuthPageSEO } from '@/utils/seo';

/**
 * Step 7: Review and Submit Route (now Step 5 - document upload removed)
 *
 * Final step in the 5-step lawyer registration process.
 * Requires authentication and proper registration status.
 *
 * Features:
 * - Registration summary display with all collected data
 * - Edit buttons for each section to navigate back to specific steps
 * - Submit button with confirmation dialog
 * - Success message and navigation to pending approval dashboard
 * - Progress indicator showing Step 5 of 5
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 10.1
 */
export const Route = createFileRoute('/register/step7')({
  beforeLoad: async () => {
    await registrationRouteGuard(7);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: 'Review & Submit - Lawyer Registration',
    description:
      'Review all your information and submit your lawyer registration application. Step 5 of 5 in the registration process.',
    path: '/register/step7',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={5} totalSteps={TOTAL_STEPS}>
        <RegistrationSummary />
      </RegistrationLayout>
    </>
  );
}
