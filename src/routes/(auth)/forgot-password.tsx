import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateAuthPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: PAGE_SEO_CONFIG.forgotPassword.title,
    description: PAGE_SEO_CONFIG.forgotPassword.description,
    path: '/forgot-password',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <div className="flex justify-center items-center px-4 pt-8">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </>
  );
}
