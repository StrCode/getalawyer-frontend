import * as z from "zod";
import { toastManager } from "../ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";

interface NewPasswordComponentProps {
  email: string;
  otp: string;
  onSuccess: () => void;
}

const passwordSchema = z
  .object({
    password: z
      .string({ message: "Please enter a password" })
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    confirmPassword: z.string({
      message: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function NewPassword({
  email,
  otp,
  onSuccess,
}: NewPasswordComponentProps) {
  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: passwordSchema,
      onSubmit: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.emailOtp.resetPassword(
          {
            password: value.password,
            otp: otp,
            email: email,
          },
          {
            onSuccess: () => {
              toastManager.add({
                title: "Password reset successful",
                description:
                  "Your password has been changed. Please login with your new password.",
                type: "success",
              });
              onSuccess();
            },
            onError: (error) => {
              toastManager.add({
                title: "Failed to reset password",
                description:
                  error.error.message ||
                  "An error occurred while resetting your password. Please try again.",
                type: "error",
              });
            },
          },
        );
      } catch (error) {
        toastManager.add({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    },
  });

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <form.AppField name="password">
            {(field) => (
              <field.PasswordPassField
                label="New Password"
                withStrengthMeter={true}
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => <field.PasswordPassField label="Confirm Password" />}
          </form.AppField>
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            size="lg"
            variant="default"
            className="w-full"
            type="submit"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

}
