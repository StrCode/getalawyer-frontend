import { Button } from "@/components/ui/button";
import InputPhoneNumber from "@/components/input.phonenumber";
import {
	Card,
	CardPanel,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MailOpenIcon, UserCircleIcon, UserPenIcon } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { toastManager } from "@/components/ui/toast";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/lib/api/client";
import * as z from "zod/v4";

const registerSchema = z.object({
	name: z.string().min(2, { error: "Name must be at least 2 characters" }),
	email: z.email().min(1, { error: "Please enter a valid email address" }),
	phone: z.string().optional(),
});

export function Register({ ...props }: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const checkEmailMutation = useMutation({
		mutationFn: (email: string) =>
			httpClient.get<{ success: boolean; isExists: boolean }>(
				`/api/checks/${encodeURIComponent(email)}`,
			),
		onSuccess: (response, email) => {
			// If email exists, redirect to password page with user data
			if (response.success && !response.isExists) {
				navigate({
					to: "/register-password",
					search: {
						email,
						name: form.state.values.name,
						phone: form.state.values.phone,
					},
				});
			} else {
				// Email exists - show error toast
				toastManager.add({
					title: "Email already exists",
					description:
						"This email is already registered. Please use another email.",
					type: "error",
				});
				form.state.values.email = "";
			}
		},
		onError: (error: Error) => {
			toastManager.add({
				title: "Error checking email",
				description:
					error.message || "Failed to verify email. Please try again.",
				type: "error",
			});
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
		validators: {
			onBlur: registerSchema,
		},
		onSubmit: async ({ value }) => {
			// Check if email exists before proceeding
			checkEmailMutation.mutate(value.email);
		},
	});

	const handleSocialAuth = async (provider: "google" | "apple") => {
		setIsLoading(true);

		const { data, error } = await authClient.signIn.social({
			provider,
			callbackURL: "/dashboard",
		});

		setIsLoading(false);

		if (error) {
			toastManager.add({
				title: "Sign in failed",
				type: "error",
			});
		}
	};

	const { isSubmitting } = form.state;
	const isDisabled = isSubmitting || isLoading || checkEmailMutation.isPending;

	return (
		<Card {...props} className="border-0 shadow-none">
			<CardHeader className="flex flex-col items-center justify-center">
				<div
					className="size-24 flex items-center justify-center rounded-full p-4"
					style={{
						borderImage:
							"linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
						background:
							"linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
					}}
				>
					<div className="border border-gray-200 shadow-sm size-16 flex justify-center items-center gap-1 bg-white rounded-full p-2.5">
						<UserPenIcon className="size-8" />
					</div>
				</div>
				<CardTitle className="font-medium text-2xl/snug">
					Create an account
				</CardTitle>
				<CardDescription>Enter your details to register</CardDescription>
			</CardHeader>
			<CardPanel>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.AppField name="name">
						{(field) => (
							<field.TextField
								label="Full Name"
								placeholder="Enter the email address"
								startIcon={UserCircleIcon}
							/>
						)}
					</form.AppField>

					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email"
								placeholder="Enter the email address"
								startIcon={MailOpenIcon}
							/>
						)}
					</form.AppField>

					{/* <form.AppField name="phone"> */}
					{/* 	{(field) => ( */}
					{/* 		<Field className="w-full gap-1.5"> */}
					{/* 			<InputPhoneNumber */}
					{/* 				value={field.state.value} */}
					{/* 				onChange={(value) => field.handleChange(value)} */}
					{/* 				onBlur={field.handleBlur} */}
					{/* 				disabled={isDisabled} */}
					{/* 			/> */}
					{/* 			{field.state.meta.errors.length > 0 && ( */}
					{/* 				<span className="text-sm text-red-600"> */}
					{/* 					{field.state.meta.errors[0]} */}
					{/* 				</span> */}
					{/* 			)} */}
					{/* 		</Field> */}
					{/* 	)} */}
					{/* </form.AppField> */}
					{/**/}
					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								or with
							</span>
						</div>
					</div>

					<Field className="grid gap-4 grid-cols-2">
						<Button
							variant="outline"
							type="button"
							disabled={isDisabled}
							onClick={() => handleSocialAuth("apple")}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
									fill="currentColor"
								/>
							</svg>
						</Button>
						<Button
							variant="outline"
							type="button"
							disabled={isDisabled}
							onClick={() => handleSocialAuth("google")}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
						</Button>
					</Field>

					<Field className="gap-1.5 my-2">
						<Button
							size="xs"
							variant="outline"
							type="submit"
							disabled={isDisabled}
							className="w-full rounded-2xl text-white hover:text-white gap-1 border p-2.5 opacity-100"
							style={{
								background:
									"linear-gradient(0deg, #19603E, #19603E), linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%)",
								boxShadow: "0px 0px 0px 1px #19603E, 0px 1px 2px 0px #0E121B3D",
							}}
						>
							{checkEmailMutation.isPending
								? "Checking email..."
								: isDisabled
									? "Processing..."
									: "Continue"}
						</Button>
					</Field>
				</form>
			</CardPanel>
		</Card>
	);
}
