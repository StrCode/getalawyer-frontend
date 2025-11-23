import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/onboarding/client")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, error, isPending } = authClient.useSession();
	if ((!isPending && error) || !session?.user) {
		navigate({ to: "/login" });
	} else if (session?.user.onboarding_completed) {
		navigate({ to: "/dashboard" });
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto py-12 px-4">
				<div className="bg-white rounded-lg shadow-lg p-8">
					<h1 className="text-3xl font-bold mb-2">
						Welcome, {session?.user.name}!
					</h1>
					<p className="text-gray-600 mb-8">Let's complete your profile</p>
					<Outlet />
				</div>
			</div>
		</div>
	);
}
