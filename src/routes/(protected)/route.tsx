import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			This is the router
			<Outlet />
		</div>
	);
}
