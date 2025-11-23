// hooks/useAuth.ts
import { getSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	onboarding_completed: boolean;
}

export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		throw redirect({
			to: "/login",
			search: {
				redirect: window.location.pathname,
			},
		});
	}

	return { user };
}

export async function requireGuest() {
	const user = await getCurrentUser();

	if (user) {
		throw redirect({
			to: "/",
		});
	}

	return {};
}

export const getCurrentUser = async () => {
	const session = await getSession();

	if (!session?.data?.user) {
		return null;
	}

	const user = session.data.user;
	return user;
};

// Custom hook for auth state
export function useAuth() {
	return useQuery({
		queryKey: ["user", "session"],
		queryFn: () => getCurrentUser(),
		staleTime: 50 * 60 * 1000, // 5 minutes
		retry: false,
	});
}
