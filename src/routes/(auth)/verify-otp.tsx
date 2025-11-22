import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";
import { VerifyOTP } from "@/components/auth/Verify-Otp";
import * as z from "zod/v4";

const verifyOTPSearchSchema = z.object({
	email: z.email(),
});

export const Route = createFileRoute("/(auth)/verify-otp")({
	component: RouteComponent,
	validateSearch: verifyOTPSearchSchema,
	beforeLoad: ({ search }) => {
		// Redirect if email is missing or invalid
		if (!search.email) {
			throw redirect({
				to: "/login",
				// Optional: add a message via search params
				search: {
					error: "Please enter your email first",
				},
			});
		}
	},
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return (
		<div className="flex pt-8 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<VerifyOTP email={email} />
			</div>
		</div>
	);
}
