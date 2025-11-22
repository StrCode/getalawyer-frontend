import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/hooks/form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field } from "@/components/ui/field";
import { UserCheck2Icon } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import { AuthButton } from "./AuthButton";
import { AuthCardHeader } from "./AuthCardHeader";
import { toastManager } from "@/components/ui/toast";

import * as z from "zod/v4";
import Loader from "./loader";

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const loginSchema = z.object({
		email: z.email("Invalid email address"),
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
			onBlur: loginSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					rememberMe: value.rememberMe,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toastManager.add({
							title: "Sign in successful",
							type: "success",
						});
					},
					onError: (error) => {
						toastManager.add({
							description: error.error.message,
							title: "Login unsuccessful",
							type: "error",
						});
					},
				},
			);
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<Card className="w-full border-0 before:shadow-none shadow-none ring-0">
			<AuthCardHeader
				icon={UserCheck2Icon}
				title="Login to your account"
				description="Enter your details to login."
			/>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardPanel>
					<div className="flex flex-col gap-6">
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

						<Field className="flex flex-row items-end justify-between">
							<form.AppField name="rememberMe">
								{(field) => <field.CheckboxField label="Remember me" />}
							</form.AppField>

							<Link
								to="/forgot-password"
								type="button"
								className="px-0 font-medium text-sm/snug"
							>
								Forgot password?
							</Link>
						</Field>

						<AuthButton isLoading={form.state.isSubmitting}>Login</AuthButton>
					</div>
				</CardPanel>
				<CardFooter className="flex flex-col">
					<div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
						<hr className="border-dashed" />
						<span className="text-muted-foreground text-xs">
							Or continue With
						</span>
						<hr className="border-dashed" />
					</div>

					<div className="w-full grid grid-cols-2 gap-3">
						<GoogleLoginButton />
						<FacebookLoginButton />
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
