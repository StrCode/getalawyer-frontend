import { Link, useNavigate } from "@tanstack/react-router";
import * as z from "zod/v4";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon, LockComputerIcon, LockKeyIcon, Mail02Icon } from "@hugeicons/core-free-icons"
import { toastManager } from "../ui/toast";
import { Separator } from "../ui/separator-extended";
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.email().min(1, { error: "Please enter an email address" }),
});

export function ForgotPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        await authClient.forgetPassword.emailOtp(
          {
            email: value.email,
          },
          {
            onSuccess: () => {
              toastManager.add({
                description: `We've sent a verification code to ${value.email}`,
                title: "Check your email",
                type: "success",
              });

              navigate({
                to: "/verify-otp",
                search: {
                  email: value.email,
                },
              });
            },
            onError: (error) => {
              toastManager.add({
                title: error.error.message,
                type: "error",
              });
            },
          },
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { isSubmitting } = form.state;
  const isDisabled = isSubmitting || isLoading;

  return (
    <Card {...props}>

      <CardHeader className="flex flex-col items-center justify-center text-center">
        <div
          className="size-24 mx-auto rounded-full p-4"
          style={{
            borderImage: "linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
            background:
              "linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
          }}
        >
          <div className="border border-gray-200 shadow-sm size-16 flex justify-center items-center gap-1 bg-white rounded-full p-2.5">
            <HugeiconsIcon icon={LockComputerIcon} className="size-8" />
          </div>
        </div>
        <CardTitle className="text-2xl/snug">
          Forgot your Password?
        </CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
        <Separator className="mt-4" />
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email Address"
                placeholder="Enter your email address"
                startIcon={Mail02Icon}
              />
            )}
          </form.AppField>
        </CardContent>
        <CardFooter className="flex mt-4 flex-col gap-4">
          <Button
            disabled={isDisabled}
            size={"lg"}
            variant="default"
            type="submit"
            className="w-full text-sm text-white bg-[#19603E] hover:bg-[#19603E]/90"
          >
            {isDisabled ? "Sending code..." : "Reset Password"}
          </Button>
          <Link className="text-sm" to={"/login"}>
            <div className="text-center flex gap-2 items-center flex-row hover:underline">
              <HugeiconsIcon icon={ArrowLeftIcon} size={14} />
              Back to Login
            </div>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
