import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/hooks/form";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { UserCheck2Icon } from "lucide-react";
import { Button } from '@/components/ui/button'
import * as z from "zod/v4"

export function Login({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate({ from: "/" });

  const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string("Please enter your password"),
    rememberMe: z.boolean()
  });


  const form = useAppForm({
    defaultValues: {
      email: "bellos@yahoo.com",
      password: "denmark12345",
      rememberMe: false
    },
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            // toast.success("Sign in successful");
          },
          onError: (error) => {
            // toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
  });


  return (
    <Card className="w-full border-0 before:shadow-none shadow-none ring-0">
      <CardHeader className="text-center">
        <div
          className="size-24 mx-auto rounded-full p-4"
          style={{
            borderImage:
              "linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
            background:
              "linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
          }}
        >
          <div className="border border-gray-200 shadow-sm size-16 flex justify-center items-center gap-1 bg-white rounded-full p-2.5">
            <UserCheck2Icon className="size-8" />
          </div>
        </div>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription> Enter your details to login.</CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
        <CardPanel>
          <div className="flex flex-col gap-4">
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email Address"
                  placeholder="Enter the email address"
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.PasswordField
                  label="Password"
                  placeholder="Enter your Password"
                />
              )}
            </form.AppField>

            <div className="w-full relative flex flex-row items-center justify-center">
              <Separator className={"my-2"} orientation="horizontal" />
              <p className="absolute px-4 bg-white text-xs text-[#868C98]">
                OR
              </p>
            </div>

            <Field className="grid gap-4 grid-cols-2">
              <Button variant="outline" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                    fill="currentColor"
                  />
                </svg>
              </Button>
              <Button variant="outline" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </Field>
            <Field
              className={"py-1 flex flex-row items-center justify-between"}
            >
              <form.Field name="rememberMe">
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                    <FieldLabel htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Keep me logged in
                    </FieldLabel>
                  </div>
                )}
              </form.Field>
              <Button
                type="button"
                className="px-0 font-medium text-sm/snug text-[#5C5C5C]"
                size={"sm"}
                variant="ghost"
              >
                Forgot password?
              </Button>
            </Field>

          </div>
        </CardPanel>
        <CardFooter>
          <Button
            size={"lg"}
            variant="default"
            type="submit"
            className="w-full text-white bg-[#19603E] hover:bg-[#19603E]/80"
          >
            Login
          </Button>
        </CardFooter>
      </form>
    </Card >
  );
}
