import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import * as z from "zod/v4";
import { email } from "node_modules/zod/v4/core/regexes.d.cts";
import AuthOTPVerify from "@/components/auth/otp-verify";
import { authClient } from "@/lib/auth-client";
import { toastManager } from "@/components/ui/toast";


const verifyOTPSearchSchema = z.object({
  email: z.email(),
});

export const Route = createFileRoute("/(auth)/verify-otp")({
  component: RouteComponent,
  validateSearch: verifyOTPSearchSchema,
  beforeLoad: ({ search }) => {
    // Redirect if email is missing or invalid
    if (!search.email) {
      throw redirect({
        to: "/login",
        search: {
          error: "Please enter your email first",
        },
      });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate()
  const { email } = Route.useSearch();

  async function submitCode(code: string) {
    await authClient.emailOtp.checkVerificationOtp(
      {
        email: email,
        type: "forget-password",
        otp: code,
      },
      {
        onSuccess: () => {
          // Store email and otp in session storage
          sessionStorage.setItem("reset_email", email);
          sessionStorage.setItem("reset_otp", code);

          toastManager.add({
            title: "Verification successful",
            description: "Please proceed to set your new password.",
            type: "success",
          });

          navigate({ to: "/new-password" });
        },
        onError: (error) => {
          toastManager.add({
            title: error.error.message,
            type: "error",
          });
        },
      },
    );
  }

  const handleResendCode = async () => {
    try {
      await authClient.emailOtp.sendVerificationOtp(
        {
          email: email,
          type: "forget-password",
        },
        {
          onSuccess: () => {
          },
          onError: (error) => {
            toastManager.add({
              title: error.error.message,
              type: "error",
            });
          },
        },
      );
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  return (
    <div className="flex pt-8 justify-center items-center px-4">
      <div className="w-full max-w-sm">
        <AuthOTPVerify
          deliveryMethod="email"
          deliveryAddress={email}
          onSubmit={async (code) =>
            submitCode(code)
          }
          onResend={(method) => {
            /* resend code */
            handleResendCode()
          }}
        />
      </div>
    </div>
  );
}

