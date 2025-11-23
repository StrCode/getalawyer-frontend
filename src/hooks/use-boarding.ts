import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/**
 * Hook to check current user's onboarding status
 * Automatically caches for 5 minutes
 */
export function useOnboardingStatus() {
	return useQuery({
		queryKey: ["boarding"],
		queryFn: async () => api.checks.checkBoarding(),
		staleTime: 50 * 60 * 3000, // 5 minutes
	});
}
