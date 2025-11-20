import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import * as z from "zod";

export const Route = createFileRoute("/(auth)/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<ForgotPasswordForm />
			</div>
		</div>
	);
}
