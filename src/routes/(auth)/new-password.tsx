import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NewPassword } from "@/components/auth/new-password";
import { SEOHead } from "@/components/seo/SEOHead";
import { toastManager } from "@/components/ui/toast";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { generateAuthPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/(auth)/new-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<{
    email: string;
    otp: string;
  } | null>(null);

  const seoMetadata = generateAuthPageSEO({
    title: PAGE_SEO_CONFIG.newPassword.title,
    description: PAGE_SEO_CONFIG.newPassword.description,
    path: '/new-password',
  });

  useEffect(() => {
    const email = sessionStorage.getItem("reset_email");
    const otp = sessionStorage.getItem("reset_otp");

    if (!email || !otp) {
      toastManager.add({
        title: "Session expired",
        description: "Please start the password reset process again.",
        type: "error",
      });
      navigate({ to: "/login" });
      return;
    }

    setCredentials({ email, otp });
  }, [navigate]);

  const handleSuccess = () => {
    // Clear session storage after successful reset
    sessionStorage.removeItem("reset_email");
    sessionStorage.removeItem("reset_otp");
    navigate({ to: "/dashboard" });
  };

  if (!credentials) {
    return null; // or a loading spinner
  }
  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <div className="flex justify-center items-center px-4 pt-8">
        <div className="w-full max-w-sm">
          <NewPassword
            email={credentials.email}
            otp={credentials.otp}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
}
