import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(protected)/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, error, isPending } = authClient.useSession();
	if (!isPending && error) {
		// navigate({ to: "/login" });
		redirect({ to: "/login" });
	} else if (session?.user && !session?.user.onboarding_completed) {
		redirect({ to: "/onboarding/client/location" });
	}

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate({ to: "/login" });
					},
				},
			});
		} catch (error) {
			console.error("Sign out failed:", error);
		}
	};

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.user.name}</p>
			<Button size="lg" variant="destructive" onClick={handleSignOut}>
				Sign Out
			</Button>
		</div>
	);
}
