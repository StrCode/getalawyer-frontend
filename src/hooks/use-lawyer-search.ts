import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { AutocompleteResponse, FiltersResponse, SearchParams, SearchResponse } from '@/types/lawyer-search';

export function useLawyerSearch(params: SearchParams) {
  return useQuery<SearchResponse>({
    queryKey: ['lawyer-search', params],
    queryFn: () => api.search.searchLawyers(params),
    // Always enabled - API supports pagination without search query
    staleTime: 30000, // 30 seconds
  });
}

export function useAutocomplete(query: string) {
  return useQuery<AutocompleteResponse>({
    queryKey: ['lawyer-autocomplete', query],
    queryFn: () => api.search.autocomplete(query),
    enabled: query.length >= 2,
    staleTime: 60000, // 1 minute
  });
}

export function useSearchFilters(params?: { q?: string; minExperience?: number; maxExperience?: number }) {
  return useQuery<FiltersResponse>({
    queryKey: ['lawyer-filters', params],
    queryFn: () => api.search.getFilters(params),
    staleTime: 300000, // 5 minutes
  });
}
