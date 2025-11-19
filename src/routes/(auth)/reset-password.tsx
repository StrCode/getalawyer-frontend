import { createFileRoute } from "@tanstack/react-router";
import { ResetPassword } from "@/components/register/lawyer/reset-password";

export const Route = createFileRoute("/(auth)/reset-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<ResetPassword />
			</div>
		</div>
	);
}
