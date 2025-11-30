import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react"; // Import useEffect
import { toastManager } from "@/components/ui/toast";

export const Route = createFileRoute("/(protected)/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, error, isPending } = authClient.useSession();

	// 1. Handle redirects inside useEffect
	useEffect(() => {
		if (!isPending) {
			if (error || !session) {
				navigate({ to: "/login" });
			} else if (session.user && !session.user.onboarding_completed) {
				navigate({ to: "/onboarding/client/location" });
			}
		}
	}, [isPending, session, error, navigate]);

	// 2. IMPORTANT: Return a loader while checking auth
	if (isPending) {
		return <div>Loading session...</div>;
	}

	// 3. Safety guard: If no session exists (and redirect hasn't happened yet), return null
	if (!session?.user) return null;

	const verifyEmail = async (email: string) => {
		try {
			await authClient.sendVerificationEmail({
				email: email,
				callbackURL: `${import.meta.env.VITE_APP_URL}/dashboard`,
				fetchOptions: {
					onSuccess: () => {
						toastManager.add({
							title: "check your email to verify",
						});
					},
				},
			});
		} catch (error) {
			console.error("Verification failed:", error);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate({ to: "/login" }),
			},
		});
	};

	return (
		<div className="p-4 space-y-4">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<p>Welcome {session.user.name}</p>

			<Button size="lg" variant="destructive" onClick={handleSignOut}>
				Sign Out
			</Button>

			<div className="flex items-center gap-4">
				<span>
					The email is{" "}
					{session.user.emailVerified ? "Verified" : "Not Verified"}
				</span>
				{!session.user.emailVerified && (
					<Button
						onClick={() => verifyEmail(session.user.email)}
						variant="secondary"
					>
						Verify Email Address
					</Button>
				)}
			</div>
		</div>
	);
}
