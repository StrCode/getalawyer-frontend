import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/onboarding/")({
	beforeLoad: async ({ context }) => {
		// Get session from parent protected route context
		const { session } = context;

		// Safety check - this shouldn't happen since parent route protects it
		if (!session?.user) {
			throw redirect({
				to: "/login",
			});
		}

		// If onboarding is already completed, redirect to dashboard
		if (session.user.onboarding_completed) {
			throw redirect({
				to: "/dashboard",
				replace: true,
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
