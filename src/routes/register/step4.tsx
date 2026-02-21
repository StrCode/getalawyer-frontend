import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalInfoForm } from "@/components/registration/ProfessionalInfoForm";
import { RegistrationLayout } from "@/components/registration/shared/RegistrationLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { TOTAL_STEPS } from "@/constants/registration";
import { registrationRouteGuard } from "@/lib/guards/registration-guards";
import { generateAuthPageSEO } from "@/utils/seo";

/**
 * Step 4: Professional Information Route
 *
 * Third step in the 5-step lawyer registration process.
 * Requires authentication and proper registration status.
 *
 * Features:
 * - Professional information form with validation
 * - Bar number, year of call, law school, university, LLB year fields
 * - Year ordering validation (year of call >= LLB year)
 * - Future date prevention
 * - Pre-fills form with existing data
 * - Progress indicator showing Step 3 of 5
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.1
 */
export const Route = createFileRoute("/register/step4")({
  beforeLoad: async () => {
    await registrationRouteGuard(4);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: "Professional Information - Lawyer Registration",
    description:
      "Provide your professional credentials and qualifications. Step 3 of 5 in the lawyer registration process.",
    path: "/register/step4",
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={3} totalSteps={TOTAL_STEPS}>
        <ProfessionalInfoForm />
      </RegistrationLayout>
    </>
  );
}
