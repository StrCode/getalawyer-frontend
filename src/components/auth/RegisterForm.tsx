import {
  LockComputerIcon,
  LockKeyIcon,
  MailOpenIcon,
  UserCircleIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/hooks/form";
import { httpClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toastManager } from "../ui/toast";

// Step 1: Email and Name validation
const emailSchema = z.object({
  name: z.string().min(2, { error: "Please enter your full name" }),
  email: z.email({ error: "Please enter a valid email address" }),
});

// Step 2: Password validation
const passwordSchema = z
  .object({
    password: z
      .string({ error: "Please enter a password" })
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    confirmPassword: z.string({
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step = "email" | "password";

export function RegisterForm({ userType }: { userType: "user" | "lawyer" }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
  });

  // Email check mutation
  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return httpClient.get<{ success: boolean; exists: boolean }>(
        `/api/checks/${encodeURIComponent(email)}`,
      );
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toastManager.add({
        title: "Error checking email",
        description:
          error.message || "Failed to verify email. Please try again.",
        type: "error",
      });
    },
  });

  const handleRegistrationComplete = (userType: "user" | "lawyer") => {
    if (userType === "user") {
      return "/onboarding/client/location";
    } else {
      return "onboarding/lawyer/step-1";
    }
  };

  // Email form (Step 1) - Just validates and moves to next step
  const emailForm = useAppForm({
    defaultValues: {
      name: registrationData.name,
      email: registrationData.email,
    },
    validators: {
      onBlur: emailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);

        // Check if email exists
        const response = await checkEmailMutation.mutateAsync(value.email);

        if (response.exists) {
          toastManager.add({
            title: "Email already exists",
            description:
              "An account with this email already exists. Please sign in instead.",
            type: "error",
          });
          return;
        }

        // Save the data and move to password step
        setRegistrationData({
          name: value.name,
          email: value.email,
        });
        setStep("password");
      } catch (error: any) {
        console.error("Error checking email:", error);
        toastManager.add({
          title: "Something went wrong",
          description: "Failed to verify email. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Password form (Step 2) - Actually creates the account
  const passwordForm = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);

        const { data, error } = await authClient.signUp.email({
          name: registrationData.name,
          email: registrationData.email,
          password: value.password,
          onboarding_completed: false,
        });

        if (error) {
          // Handle specific error types
          let errorMessage = "Failed to create account";

          if (error.message?.includes("already exists")) {
            errorMessage = "An account with this email already exists";
          } else if (error.message?.includes("password")) {
            errorMessage = "Password does not meet requirements";
          } else if (error.message) {
            errorMessage = error.message;
          }

          toastManager.add({
            title: "Registration failed",
            description: errorMessage,
            type: "error",
          });
          return;
        }

        // Success
        console.log("User created:", data);

        toastManager.add({
          title: "Thank you for signing up",
          description: "Your account has been created successfully",
          type: "success",
        });

        if (userType === "user") {
          navigate({ to: "/onboarding/client/location" });
        } else {
          navigate({ to: "/onboarding/lawyer/basics" });
        }
      } catch (error: any) {
        console.error("Unexpected error during sign up:", error);
        toastManager.add({
          title: "Something went wrong",
          description: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSocialAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);

    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: handleRegistrationComplete(userType),
    });

    setIsLoading(false);

    if (error) {
      toastManager.add({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with " + provider,
        type: "error",
      });
    }
  };

  const emailFormIsDisabled =
    emailForm.state.isSubmitting || isLoading || checkEmailMutation.isPending;
  const passwordFormIsDisabled = passwordForm.state.isSubmitting || isLoading;

  return (
    <div>
      {step === "email" ? (
        <>
          {/* Step 1: Email and Name */}
          <div>
            <div
              className="mx-auto p-4 rounded-full size-24"
              style={{
                borderImage:
                  "linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
                background:
                  "linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
              }}
            >
              <div className="flex justify-center items-center gap-1 bg-white shadow-sm p-2.5 border border-gray-200 rounded-full size-16">
                <HugeiconsIcon icon={UserEdit01Icon} className="size-8" />
              </div>
            </div>
            <div className={cn("flex flex-col gap-4")}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  emailForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <a
                      href="#"
                      className="flex flex-col items-center gap-2 font-medium"
                    >
                      <span className="sr-only">GetaLawyer.</span>
                    </a>
                    <h1 className="font-bold text-xl">Welcome to GetaLawyer</h1>
                  </div>
                  <emailForm.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Full Name"
                        placeholder="Enter your full name"
                        startIcon={UserCircleIcon}
                      />
                    )}
                  </emailForm.AppField>

                  <emailForm.AppField name="email">
                    {(field) => (
                      <field.TextField
                        label="Email"
                        placeholder="Enter your email address"
                        startIcon={MailOpenIcon}
                      />
                    )}
                  </emailForm.AppField>

                  <Field className="gap-1.5">
                    <Button
                      size="lg"
                      variant="default"
                      type="submit"
                      disabled={emailFormIsDisabled}
                    >
                      {checkEmailMutation.isPending
                        ? "Checking email..."
                        : emailFormIsDisabled
                          ? "Processing..."
                          : "Continue"}
                    </Button>
                  </Field>

                  <FieldSeparator>Or</FieldSeparator>

                  <Field className="gap-4 grid sm:grid-cols-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialAuth("apple")}
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Apple
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialAuth("google")}
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </FieldDescription>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Step 2: Password Setup */}
          <div className="">
            <div
              className="mx-auto p-4 rounded-full size-24"
              style={{
                borderImage:
                  "linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
                background:
                  "linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
              }}
            >
              <div className="flex justify-center items-center gap-1 bg-white shadow-sm p-2.5 border border-gray-200 rounded-full size-16">
                <HugeiconsIcon icon={LockComputerIcon} className="size-8" />
              </div>
            </div>
            <h2 className="mt-4 font-bold text-2xl text-center">
              Password Setup
            </h2>
            <p className="mt-2 text-gray-600 text-sm text-center">
              Set up a secure password for {registrationData.email}
            </p>
            <Separator className="m-4" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                passwordForm.handleSubmit();
              }}
              className="space-y-6"
            >
              <passwordForm.AppField name="password">
                {(field) => (
                  <field.PasswordPassField
                    label="New Password"
                    withStrengthMeter={true}
                  />
                )}
              </passwordForm.AppField>

              <passwordForm.AppField name="confirmPassword">
                {(field) => (
                  <field.PasswordPassField label="Confirm Password" />
                )}
              </passwordForm.AppField>
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full"
                  type="submit"
                  disabled={passwordFormIsDisabled}
                >
                  {passwordFormIsDisabled
                    ? "Creating account..."
                    : "Create account"}
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setStep("email")}
                  disabled={passwordFormIsDisabled}
                >
                  ← Back to email
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
