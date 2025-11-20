import { Outlet, createFileRoute } from "@tanstack/react-router";
import Header from "@/components/AppHeader";

export const Route = createFileRoute("/(auth)")({
	component: AppLayoutComponent,
});

function AppLayoutComponent() {
	return (
		<div>
			<Header />
			<Outlet />
		</div>
	)
}
