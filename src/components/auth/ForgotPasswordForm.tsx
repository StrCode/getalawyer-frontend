import { useAppForm } from "@/hooks/form";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import * as z from "zod/v4";
import { ArrowLeftIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { AuthCardHeader } from "./AuthCardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toastManager } from "../ui/toast";
import { useState } from "react";
import { APIError } from "better-auth";

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
			<AuthCardHeader
				icon={LockKeyholeIcon}
				title="Forgot your Password?"
				description="Enter your email to reset your password."
				showSeparator={true}
			/>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardPanel>
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email Address"
								placeholder="Enter your email address"
								startIcon={MailIcon}
							/>
						)}
					</form.AppField>
				</CardPanel>
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
							<ArrowLeftIcon size={14} />
							Back to Login
						</div>
					</Link>
				</CardFooter>
			</form>
		</Card>
	);
}
