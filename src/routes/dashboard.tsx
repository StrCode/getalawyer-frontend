import { Button } from "@/components/ui/button";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.navigate({ to: "/" });
					},
				},
			});
		} catch (error) {
			console.error("Sign out failed:", error);
		}
	};

	if (isPending) {
		return <div>Loading...</div>;
	}

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
