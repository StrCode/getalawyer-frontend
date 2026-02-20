import { useQuery } from '@tanstack/react-query';
import { getLawyer, getLawyers, getPublicLawyerProfile } from '../api/lawyers';
import { queryKeys } from '../query-client';

// Query hook for fetching all lawyers with stale-while-revalidate caching
export function useLawyers() {
  return useQuery({
    queryKey: queryKeys.lawyers.all,
    queryFn: getLawyers,
    // Stale-while-revalidate: data is considered fresh for 5 minutes
    // but will be revalidated in the background
    staleTime: 5 * 60 * 1000,
  });
}

// Query hook for fetching a single lawyer with consultation types
export function useLawyer(id: string) {
  return useQuery({
    queryKey: queryKeys.lawyers.detail(id),
    queryFn: () => getLawyer(id),
    enabled: !!id,
    // Stale-while-revalidate caching
    staleTime: 5 * 60 * 1000,
  });
}

// Query hook for fetching public lawyer profile
export function usePublicLawyerProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.lawyers.public(id),
    queryFn: () => getPublicLawyerProfile(id),
    enabled: !!id,
    // Stale-while-revalidate caching
    staleTime: 5 * 60 * 1000,
  });
}
