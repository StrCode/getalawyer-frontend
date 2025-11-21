import { Button } from "@/components/ui/button";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { data: session, error, isPending } = authClient.useSession();
	if (!isPending && error) {
		router.navigate({ to: "/login" });
	}

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.navigate({ to: "/login" });
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
