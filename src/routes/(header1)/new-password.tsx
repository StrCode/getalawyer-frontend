import { createFileRoute } from "@tanstack/react-router";
import { NewPassword } from "@/components/register/lawyer/new-password";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export const Route = createFileRoute("/(header1)/new-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<NewPassword />
			</div>
		</div>
	)
}
