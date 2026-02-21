import { createFileRoute } from "@tanstack/react-router";
import { PracticeInfoForm } from "@/components/registration/PracticeInfoForm";
import { RegistrationLayout } from "@/components/registration/shared/RegistrationLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { TOTAL_STEPS } from "@/constants/registration";
import { registrationRouteGuard } from "@/lib/guards/registration-guards";
import { generateAuthPageSEO } from "@/utils/seo";

/**
 * Step 5: Practice Information Route
 *
 * Fourth step in the 5-step lawyer registration process.
 * Requires authentication and proper registration status.
 *
 * Features:
 * - Practice information form with validation
 * - Practice type, firm name (conditional), practice areas, states, office address fields
 * - Conditional firm name validation
 * - Multi-select for practice areas and states
 * - Pre-fills form with existing data
 * - Progress indicator showing Step 4 of 5
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 10.1
 */
export const Route = createFileRoute("/register/step5")({
  beforeLoad: async () => {
    await registrationRouteGuard(5);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: "Practice Information - Lawyer Registration",
    description:
      "Provide details about your legal practice and specializations. Step 4 of 5 in the lawyer registration process.",
    path: "/register/step5",
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={4} totalSteps={TOTAL_STEPS}>
        <PracticeInfoForm />
      </RegistrationLayout>
    </>
  );
}
