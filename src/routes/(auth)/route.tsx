import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/AppHeader";

export const Route = createFileRoute("/(auth)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Header />
			<Outlet />
		</div>
	);
}
