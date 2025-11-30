import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAppForm } from "@/hooks/form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { UserCheck2Icon } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import { AuthButton } from "./AuthButton";
import { AuthCardHeader } from "./AuthCardHeader";
import { toastManager } from "@/components/ui/toast";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import * as z from "zod/v4";
import Loader from "./loader";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";

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

		/*<Card
			className={cn(
				"w-[400px] rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] p-5",
				"shadow-[0_1px_1px_oklch(from_var(--border)_l_c_h_/_0.2),0_2px_2px_oklch(from_var(--border)_l_c_h_/_0.2),0_1px_1px_oklch(from_var(--border)_l_c_h_/_0.2)]",
				"max-sm:w-full max-sm:p-4",
			)}
		>
			<CardHeader>
				<CardTitle
					className={cn("ml-1", "max-sm:text-xl max-sm:leading-[1.3]")}
				>
					Sign In
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="flex flex-col gap-4">
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
				</form>
			</CardContent>
			<CardFooter className="flex flex-col gap-4">
				<Button className="w-full">Sign In</Button>
			</CardFooter>
			<div className="flex items-center gap-4">
				<div className="h-px flex-1 bg-[var(--border)]" />
				<span
					className={cn(
						"px-2 font-normal text-[var(--muted-foreground)] text-xs leading-5",
						"max-sm:text-[0.8125rem]",
					)}
				>
					OR
				</span>
				<div className="h-px flex-1 bg-[var(--border)]" />
			</div>
			<div className="flex flex-col gap-3">
				<Button
					className={cn(
						"relative flex w-full gap-2",
						"max-sm:min-h-11 max-sm:gap-2.5 max-sm:text-[0.9375rem]",
					)}
					variant="outline"
				>
					<AppleIcon
						className={cn(
							"-ml-2 h-5 w-5",
							"max-sm:-ml-1 max-sm:h-[1.125rem] max-sm:w-[1.125rem]",
						)}
					/>
					Apple
				</Button>
				<Button
					className={cn(
						"relative flex w-full gap-2",
						"max-sm:min-h-11 max-sm:gap-2.5 max-sm:text-[0.9375rem]",
					)}
					variant="outline"
				>
					<GoogleIcon
						className={cn("h-5 w-5", "max-sm:h-[1.125rem] max-sm:w-[1.125rem]")}
					/>
					Google
				</Button>
			</div>
			<div
				className={cn(
					"-ml-5 -mr-5 -mb-5 -mt-2 w-[calc(100%+40px)] rounded-b-[var(--radius-lg)] bg-[var(--mix-card-35-trans)] py-5 text-center text-sm leading-5",
					"max-sm:-ml-4 max-sm:-mr-4 max-sm:-mb-4 max-sm:w-[calc(100%+2rem)] max-sm:py-4 max-sm:text-[0.9375rem]",
				)}
			>
				<span className="text-[var(--muted-foreground)]">No account? </span>
				<span className="cursor-pointer text-[var(--secondary-foreground)]">
					Sign up
				</span>
			</div>
		</Card>*/
	);
}

function AppleIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
				fill="currentColor"
			/>
		</svg>
	);
}
function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
				fill="currentColor"
			/>
		</svg>
	);
}
