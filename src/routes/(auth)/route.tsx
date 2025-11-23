import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Header from "@/components/AppHeader";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/(auth)")({
	component: AppLayoutComponent,
	beforeLoad: async ({ search }) => {
		const user = await getCurrentUser();

		if (user) {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
});

function AppLayoutComponent() {
	return (
		<div>
			<Header />
			<Outlet />
		</div>
	);
}
