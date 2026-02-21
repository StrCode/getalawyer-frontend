import { createFileRoute } from "@tanstack/react-router";
// import { DocumentUploadForm } from "@/components/registration/DocumentUploadForm"; // Removed - Step 6 document upload removed from flow
import { RegistrationLayout } from "@/components/registration/shared/RegistrationLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { TOTAL_STEPS } from "@/constants/registration";
import { registrationRouteGuard } from "@/lib/guards/registration-guards";
import { generateAuthPageSEO } from "@/utils/seo";

/**
 * Step 6: Document Upload Route
 * 
 * NOTE: This step has been removed from the registration flow.
 * Step 5 (Practice Info) now goes directly to Step 7 (Review & Submit).
 * This route is kept for backward compatibility but should not be accessed.
 *
 * Sixth step in the 7-step lawyer registration process.
 * Requires authentication and proper registration status.
 *
 * Features:
 * - Document upload form with validation
 * - File upload inputs for Call to Bar Certificate, LLB Certificate, and Passport Photo
 * - File type and size validation
 * - File preview functionality
 * - Upload progress indicators
 * - Progress indicator showing Step 6 of 7
 * - SEO metadata for the page
 * - Authentication guard
 * - Status-based navigation enforcement
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 10.1
 */
export const Route = createFileRoute("/register/step6")({
  beforeLoad: async () => {
    await registrationRouteGuard(6);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: "Document Upload - Lawyer Registration",
    description:
      "Upload your credentials and passport photo for verification. Step 6 of 7 in the lawyer registration process.",
    path: "/register/step6",
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <RegistrationLayout currentStep={5} totalSteps={TOTAL_STEPS}>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            Document upload step has been removed. Redirecting...
          </p>
        </div>
        {/* <DocumentUploadForm /> */}
      </RegistrationLayout>
    </>
  );
}
