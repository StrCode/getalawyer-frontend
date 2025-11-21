import { Button } from "@/components/ui/button";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getUser();
		console.log(session);
		return { session };
	},
	loader: async ({ context }) => {
		console.log(context.session);
		if (!context.session) {
		}
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const router = useRouter();

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
