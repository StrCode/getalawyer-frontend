import { createFileRoute } from '@tanstack/react-router';
import { NINVerificationForm } from '@/components/registration/NINVerificationForm';
import { RegistrationLayout } from '@/components/registration/shared/RegistrationLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { TOTAL_STEPS } from '@/constants/registration';
import { registrationRouteGuard } from '@/lib/guards/registration-guards';
import { generateAuthPageSEO } from '@/utils/seo';

/**
 * Step 3: NIN Verification Route
 * 
 * Second step in the 5-step lawyer registration process.
 * Requires authentication and proper registration status.
 * 
 * Features:
 * - NIN verification form with consent checkbox
 * - Verification result display with photo and details
 * - Name mismatch warning
 * - Confirm/reject flow
 * - Progress indicator showing Step 2 of 5
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 10.1
 */
export const Route = createFileRoute('/register/step3')({
  beforeLoad: async () => {
    await registrationRouteGuard(3);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: 'NIN Verification - Lawyer Registration',
    description: 'Verify your identity using your National Identification Number. Step 2 of 5 in the lawyer registration process.',
    path: '/register/step3',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={2} totalSteps={TOTAL_STEPS}>
        <NINVerificationForm />
      </RegistrationLayout>
    </>
  );
}
