import { createFileRoute } from "@tanstack/react-router";
import { RegisterPassword } from "@/components/register/lawyer/register-password";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export const Route = createFileRoute("/(header1)/register-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<RegisterPassword />
			</div>
		</div>
	)
}
