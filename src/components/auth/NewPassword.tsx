import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import * as z from "zod"; // Standard import
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { AuthCardHeader } from "./AuthCardHeader";
import { LockKeyholeIcon } from "lucide-react";

interface NewPasswordProps {
	email?: string;
	otp?: string;
	onSuccess?: () => void;
}

export function NewPassword({ email, otp, onSuccess }: NewPasswordProps) {
	// 1. Fix: Align Schema with UI (only 2 fields needed)
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

	const form = useAppForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onBlur: passwordSchema,
			// You usually also want onChange or onSubmit validation
			onSubmit: passwordSchema,
		},
		onSubmit: async ({ value }) => {
			if (!email || !otp) {
				// handle missing credentials
				//TODO: check this error issues
				return;
			}

			await authClient.emailOtp.resetPassword(
				{
					password: value.password,
					otp: otp,
					email: email,
				},
				{
					onSuccess: () => {
						onSuccess?.();
					},
					onError: (error) => {
						form.setErrorMap({
							onSubmit: error.error.message || "Failed to reset password",
						});
					},
				},
			);
		},
	});

	return (
		<Card>
			<AuthCardHeader
				icon={LockKeyholeIcon}
				title="Set new password"
				description="Your new password must be different to previously used passwords."
				showSeparator={true}
			/>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardPanel className="flex flex-col gap-4">
					<form.AppField name="password">
						{(field) => (
							<field.PasswordPassField
								label="New Password"
								withStrengthMeter={true}
							/>
						)}
					</form.AppField>

					<form.AppField name="confirmPassword">
						{(field) => <field.PasswordPassField label="New Password" />}
					</form.AppField>
				</CardPanel>
				<CardFooter className="mt-6">
					<Button
						size={"lg"}
						variant={"default"}
						className="w-full"
						type="submit"
						// Optional: Disable if password isn't strong enough or loading
						// disabled={form.isSubmitting || strengthScore < 3}
					>
						Submit
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
