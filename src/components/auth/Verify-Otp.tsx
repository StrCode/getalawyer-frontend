import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	InputOTP,
	InputOTPSeparator,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { UserCheck2Icon } from "lucide-react";
import { AuthCardHeader } from "./AuthCardHeader";
import * as z from "zod";
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

const otpSchema = z.object({
	pin: z.string().min(6, {
		message: "Your one-time password must be 6 characters.",
	}),
});

interface VerifyOTPProps extends React.ComponentProps<typeof Card> {
	email?: string;
	type?: "forget-password" | "email-verification";
}

export function VerifyOTP({
	email = "",
	type = "forget-password",
	...props
}: VerifyOTPProps) {
	const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
	const [isResending, setIsResending] = useState(false);
	const [resendAttempts, setResendAttempts] = useState(0);
	const MAX_RESEND_ATTEMPTS = 5;

	useEffect(() => {
		if (timeLeft <= 0) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleResendCode = async () => {
		if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
			// toast.error("Maximum resend attempts reached. Please try again later.");
			return;
		}

		setIsResending(true);
		try {
			await authClient.emailOtp.sendVerificationOtp(
				{
					email: email,
					type: type,
				},
				{
					onSuccess: () => {
						// Reset timer to 5 minutes
						setTimeLeft(300);
						setResendAttempts((prev) => prev + 1);
						// toast.success("Verification code sent successfully!");
					},
					onError: (error) => {
						// toast.error(error.error.message || "Failed to resend code");
					},
				},
			);
		} catch (error) {
			console.error("Failed to resend code:", error);
		} finally {
			setIsResending(false);
		}
	};

	const form = useAppForm({
		defaultValues: {
			pin: "",
		},
		validators: {
			onBlur: otpSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.checkVerificationOtp(
				{
					email: email,
					type: type,
					otp: value.pin,
				},
				{
					onSuccess: () => {
						// Handle success (e.g., navigate to next page)
					},
					onError: (error) => {
						// toast.error(error.error.message || error.error.statusText);
						form.setErrorMap({
							onSubmit: error.error.message || error.error.statusText,
						});
					},
				},
			);
		},
	});

	return (
		<Card {...props}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AuthCardHeader
					icon={UserCheck2Icon}
					title="Enter Verification Code"
					description={`We've sent a code to ${email}`}
				/>
				<CardPanel>
					<Separator className="my-6" />
					<form.Field name="pin">
						{(field) => (
							<Field>
								<InputOTP
									maxLength={6}
									required
									containerClassName="gap-4"
									value={field.state.value}
									onChange={field.handleChange}
								>
									<InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
									</InputOTPGroup>
									<InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-600 mt-2">
										{/* {field.state.meta.errors[0]} */}
									</p>
								)}
							</Field>
						)}
					</form.Field>
				</CardPanel>
				<CardFooter className="flex my-6 flex-col gap-4">
					<Button
						size={"lg"}
						variant="default"
						type="submit"
						className="w-full text-white bg-[#19603E]"
						disabled={form.state.isSubmitting}
					>
						{form.state.isSubmitting ? "Verifying..." : "Submit"}
					</Button>
					<div className="text-center">
						<p className="text-gray-600 text-sm">
							Experiencing issues receiving the code?
						</p>
						{resendAttempts >= MAX_RESEND_ATTEMPTS ? (
							<p className="text-sm text-red-600 mt-1">
								Maximum resend attempts reached. Please try again later.
							</p>
						) : (
							<>
								<Button
									variant="link"
									className="text-sm text-stone-950 underline"
									onClick={handleResendCode}
									disabled={isResending || timeLeft > 0}
									type="button"
								>
									{isResending ? "Sending..." : "Resend"}
								</Button>
								{timeLeft > 0 && (
									<p className="text-sm text-gray-500 mt-1">
										Available in{" "}
										<span className="font-semibold text-stone-950">
											{formatTime(timeLeft)}
										</span>
									</p>
								)}
								{resendAttempts > 0 && (
									<p className="text-xs text-gray-400 mt-1">
										{resendAttempts} of {MAX_RESEND_ATTEMPTS} attempts used
									</p>
								)}
							</>
						)}
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
