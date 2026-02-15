import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateAuthPageSEO } from "@/utils/seo";

// Define the search params type
type RegisterSearch = {
  type?: "user" | "lawyer";
};

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
  // Validate search params
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type:
        search.type === "user" || search.type === "lawyer"
          ? search.type
          : undefined,
    };
  },
});

function RouteComponent() {
  const { type } = Route.useSearch();

  const [userType, _] = useState<"user" | "lawyer">(
    type || "user",
  );

  const seoMetadata = generateAuthPageSEO({
    title: PAGE_SEO_CONFIG.register.title,
    description: PAGE_SEO_CONFIG.register.description,
    path: '/register',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <div className="flex justify-center items-center px-4 py-8">
        <div className="w-full max-w-md">
          <RegisterForm userType={userType} />
        </div>
      </div>
    </>
  );
}
