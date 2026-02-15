import { Mail02Icon } from "@hugeicons/core-free-icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod/v4";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { toastManager } from "@/components/ui/toast";
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator-extended";

export function LoginForm({ ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate({
    from: "/",
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z.string("Please enter your password"),
    rememberMe: z.boolean(),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onChange: loginSchema,
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
            rememberMe: value.rememberMe,
          },
          {
            onSuccess: async () => {
              toastManager.add({
                title: "Sign in successful",
                type: "success",
              });
              
              // Reload the page to refresh the session
              window.location.href = "/dashboard";
            },
            onError: (error) => {
              toastManager.add({
                description: error.error.message,
                title: "Login unsuccessful",
                type: "error",
              });
              setIsLoading(false);
            },
          },
        );
      } catch {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-4")} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <div className="flex flex-col items-center gap-6 text-center">
            <Link to="/" className="flex items-center">
              <Logo className="h-8" />
            </Link>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl tracking-tight">Welcome back</h1>
              <FieldDescription className="text-muted-foreground">
                Enter your credentials to access your account
              </FieldDescription>
            </div>
          </div>

          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email Address"
                placeholder="m@example.com"
                startIcon={Mail02Icon}
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label="Password"
                placeholder="m@example.com"
              />
            )}
          </form.AppField>

          <div className="flex flex-row justify-between items-center text-sm">
            <form.AppField name="rememberMe">
              {(field) => <field.CheckboxField label="Remember me" />}
            </form.AppField>

            <Link className="hover:underline whitespace-nowrap" to={"/forgot-password"}>
              Forgot password?
            </Link>
          </div>

          <Field className="pt-2">
            <Button size={"lg"} type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </Field>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <Separator variant="dashed" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Field className="gap-3 grid sm:grid-cols-2">
            <Button variant="outline" type="button" size="lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" aria-label="Apple logo">
                <title>Apple</title>
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
            </Button>
            <Button variant="outline" type="button" size="lg">
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
        </FieldGroup>
      </form>
      
      <div className="text-muted-foreground text-sm text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="hover:text-primary underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
