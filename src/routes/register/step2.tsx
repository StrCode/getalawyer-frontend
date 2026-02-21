import { createFileRoute } from '@tanstack/react-router';
import { PersonalInfoForm } from '@/components/registration/PersonalInfoForm';
import { RegistrationLayout } from '@/components/registration/shared/RegistrationLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { TOTAL_STEPS } from '@/constants/registration';
import { registrationRouteGuard } from '@/lib/guards/registration-guards';
import { generateAuthPageSEO } from '@/utils/seo';

/**
 * Step 2: Personal Information Route
 * 
 * First step in the 5-step lawyer registration process (after account creation at /auth/register).
 * Requires authentication and proper registration status.
 * 
 * Features:
 * - Personal information form with validation
 * - State/LGA dependent dropdown
 * - Date picker for date of birth
 * - Pre-fills form with existing data
 * - Progress indicator showing Step 1 of 5
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 10.1
 */
export const Route = createFileRoute('/register/step2')({
  beforeLoad: async () => {
    console.log("[Step2Route] beforeLoad triggered");
    await registrationRouteGuard(2);
    console.log("[Step2Route] Guard passed, loading component");
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: 'Personal Information - Lawyer Registration',
    description: 'Provide your personal information. Step 1 of 5 in the lawyer registration process.',
    path: '/register/step2',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={1} totalSteps={TOTAL_STEPS}>
        <PersonalInfoForm />
      </RegistrationLayout>
    </>
  );
}
