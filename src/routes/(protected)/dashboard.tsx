import { Button } from "@/components/ui/button";
import { useOnboardingStatus } from "@/hooks/use-boarding";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/(protected)/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, error, isPending } = authClient.useSession();
	if (!isPending && error) {
		navigate({ to: "/login" });
	}

	const { data, isLoading } = useOnboardingStatus();

	useEffect(() => {
		if (!isLoading && data && !data.onboarding_completed) {
			navigate({ to: "/onboarding/location" });
		}
	}, [data, isLoading, navigate]);

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
