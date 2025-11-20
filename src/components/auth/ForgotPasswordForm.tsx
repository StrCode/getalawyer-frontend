import { useAppForm } from "@/hooks/form";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import * as z from "zod/v4";
import { LockKeyholeIcon, MailIcon } from "lucide-react";
import { AuthCardHeader } from "./AuthCardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

const forgotPasswordSchema = z.object({
	email: z.email().min(1, { error: "Please enter an email address" }),
});

// type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
	...props
}: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate({ from: "/forgot-password" });

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onBlur: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.forgetPassword(
				{
					email: value.email,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/verify-otp",
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

	const { isSubmitting } = form.state;

	return (
		<Card>
			<AuthCardHeader
				icon={LockKeyholeIcon}
				title="Forgot your Password?"
				description="Enter your email to reset your password."
				showSeparator={true}
			/>
			<CardPanel>
				<Form>
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email Address"
								placeholder="Enter the email address"
								startIcon={MailIcon}
							/>
						)}
					</form.AppField>
				</Form>
			</CardPanel>
			<CardFooter className="flex flex-col gap-4">
				<Button
					size={"lg"}
					variant="default"
					type="submit"
					className="w-full text-sm text-white bg-[#19603E]"
				>
					Reset Password
				</Button>
				<div className="text-center">
					<p className="text-gray-600 text-xs">Don't have access anymore?</p>
					<Button
						disabled={isSubmitting}
						variant="link"
						className="text-xs text-stone-950 underline"
					>
						Try another method
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
