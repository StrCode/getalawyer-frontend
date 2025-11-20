import { redirect } from "@tanstack/react-router";

export function requireAuth(context: { session: any }) {
	if (!context.session?.user) {
		throw redirect({ to: "/login" });
	}
}

export function requireGuest(context: { session: any }, currentPath?: string) {
	if (context.session?.user) {
		// Don't redirect if already on a guest page to prevent loops
		if (currentPath === "/login" || currentPath === "/signup") {
			return;
		}
		throw redirect({ to: "/dashboard" });
	}
}
