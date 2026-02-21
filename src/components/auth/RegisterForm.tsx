import {
  MailOpenIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { use, useState } from "react";
import * as z from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator-extended";
import { useAppForm } from "@/hooks/form";
import { httpClient } from "@/lib/api/client";
import { authClient, useSession } from "@/lib/auth-client";
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

// RegisterForm component for user registration
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
      return "/dashboard"; // Client users go directly to dashboard
    } else {
      return "/register/step2"; // Lawyers start at step 2 (Personal Information)
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
          userType,
          // onboarding_completed removed - handled by new registration system
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

          console.error("[RegisterForm] Registration error:", error);
          toastManager.add({
            title: "Registration failed",
            description: errorMessage,
            type: "error",
          });
          return;
        }
        
        console.log("[RegisterForm] Registration successful, data:", data);
        console.log("[RegisterForm] User role from signup:", data.user?.role);
        console.log("[RegisterForm] User type param:", userType);

        // Fetch fresh session to verify - with retries
        console.log("[RegisterForm] Fetching fresh session...");
        let fresh = await authClient.getSession({ 
          fetchOptions: { cache: "no-cache" } 
        });

        console.log("[RegisterForm] Fresh session after signup:", fresh);
        console.log("[RegisterForm] Fresh session user:", fresh.data?.user);
        console.log("[RegisterForm] Fresh session role:", fresh.data?.user?.role);

        // If no session, wait a bit and retry
        if (!fresh.data?.user) {
          console.log("[RegisterForm] No session found, waiting 500ms and retrying...");
          await new Promise(resolve => setTimeout(resolve, 500));
          fresh = await authClient.getSession({ 
            fetchOptions: { cache: "no-cache" } 
          });
          console.log("[RegisterForm] Retry session result:", fresh);
        }

        // Success
        toastManager.add({
          title: "Thank you for signing up",
          description: "Your account has been created successfully",
          type: "success",
        });

        // TEMPORARY: Bypass role check, use userType param instead
        console.log("[RegisterForm] BYPASSING role check - using userType param:", userType);
        const targetRoute = userType === "user" ? "/onboarding/" : "/register/step2";
        console.log("[RegisterForm] Navigating to:", targetRoute);
        
        // Small delay to ensure session is fully set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (userType === "user") {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/register/step2" });
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
    <div className={cn("flex flex-col gap-6")}>
      {step === "email" ? (
        <>
          {/* Step 1: Email and Name */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Get started with GetaLawyer today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  emailForm.handleSubmit();
                }}
              >
                <FieldGroup>
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
                        label="Email Address"
                        placeholder="m@example.com"
                        startIcon={MailOpenIcon}
                      />
                    )}
                  </emailForm.AppField>

                  <Field>
                    <Button
                      size="lg"
                      type="submit"
                      className="w-full"
                      disabled={emailFormIsDisabled}
                    >
                      {checkEmailMutation.isPending
                        ? "Checking..."
                        : emailFormIsDisabled
                          ? "Processing..."
                          : "Continue"}
                    </Button>
                  </Field>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator variant="dashed" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Field className="gap-3 grid grid-cols-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialAuth("apple")}
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" aria-label="Apple logo">
                        <title>Apple</title>
                        <path
                          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                          fill="currentColor"
                        />
                      </svg>
                      Apple
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialAuth("google")}
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" aria-label="Google logo">
                        <title>Google</title>
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Google
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="hover:text-primary underline underline-offset-4">
                      Sign in
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          
          <FieldDescription className="px-6 text-xs text-center">
            By continuing, you agree to our{" "}
            <a href="/terms" className="hover:text-primary underline underline-offset-4">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="hover:text-primary underline underline-offset-4">Privacy Policy</a>.
          </FieldDescription>
        </>
      ) : (
        <>
          {/* Step 2: Password Setup */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Set your password</CardTitle>
              <CardDescription>
                Create a secure password for {registrationData.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  passwordForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <passwordForm.AppField name="password">
                    {(field) => (
                      <field.PasswordPassField
                        label="Password"
                        withStrengthMeter={true}
                      />
                    )}
                  </passwordForm.AppField>

                  <passwordForm.AppField name="confirmPassword">
                    {(field) => (
                      <field.PasswordPassField label="Confirm Password" />
                    )}
                  </passwordForm.AppField>

                  <Field>
                    <Button
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={passwordFormIsDisabled}
                    >
                      {passwordFormIsDisabled
                        ? "Creating account..."
                        : "Create account"}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => setStep("email")}
                      disabled={passwordFormIsDisabled}
                      className="p-0 h-auto"
                    >
                      ← Back to email
                    </Button>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
