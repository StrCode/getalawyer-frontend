import { createFileRoute } from "@tanstack/react-router";
import { NewPassword } from "@/components/auth/NewPassword";

export const Route = createFileRoute("/(auth)/new-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<NewPassword />
			</div>
		</div>
	);
}
