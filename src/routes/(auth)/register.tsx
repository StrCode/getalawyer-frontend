import { createFileRoute } from "@tanstack/react-router";

import { Register } from "@/components/auth/Register";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-8 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<Register />
			</div>
		</div>
	);
}
