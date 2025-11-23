import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import Header from "@/components/AppHeader";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)")({
	component: AppLayoutComponent,
});

function AppLayoutComponent() {
	const navigate = useNavigate();
	const { data: session, error, isPending } = authClient.useSession();
	if (!isPending && error) {
		navigate({ to: "/login" });
	} else if (session?.user) {
		navigate({ to: "/dashboard" });
	}
	return (
		<div>
			<Header />
			<Outlet />
		</div>
	);
}
