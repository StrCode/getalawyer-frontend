import { useAppForm } from "@/hooks/form";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import * as z from "zod/v4";
import { ArrowLeftIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { AuthCardHeader } from "./AuthCardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

const forgotPasswordSchema = z.object({
	email: z.email().min(1, { error: "Please enter an email address" }),
});

export function ForgotPasswordForm({
	...props
}: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate();

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onBlur: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.forgetPassword.emailOtp(
				{
					email: value.email,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/verify-otp",
							search: {
								email: form.state.values.email,
							},
						});
					},
					onError: (error) => {},
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
								placeholder="Enter the email address"
								startIcon={MailIcon}
							/>
						)}
					</form.AppField>
				</CardPanel>
				<CardFooter className="flex mt-4 flex-col gap-4">
					<Button
						disabled={isSubmitting}
						size={"lg"}
						variant="default"
						type="submit"
						className="w-full text-sm text-white bg-[#19603E]"
					>
						Reset Password
					</Button>
					<Link className="text-sm" to={"/login"}>
						<div className="text-center flex gap-2 items-center flex-row">
							<ArrowLeftIcon size={"14"} />
							Back to Login
						</div>
					</Link>
				</CardFooter>
			</form>
		</Card>
	);
}
