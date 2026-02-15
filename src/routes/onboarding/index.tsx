import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/onboarding/")({
	beforeLoad: async () => {
		// Get the current session from server
		const session = await getUser();

		if (!session?.user) {
			// If no session, redirect to login
			throw redirect({
				to: "/login",
			});
		}

		// Check user role and redirect to appropriate onboarding flow
		const userRole = session.user.role;

		if (userRole === "lawyer") {
			// Redirect to lawyer onboarding (route groups with parentheses are pathless)
			throw redirect({
				to: "/onboarding/basics",
			});
		} else {
			// Default to client onboarding for 'user' role or any other role
			throw redirect({
				to: "/onboarding/client-location",
			});
		}
	},
});
