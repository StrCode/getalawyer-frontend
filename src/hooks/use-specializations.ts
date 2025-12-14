import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface Specialization {
  id: string; // UUID
  name: string;
  description?: string;
}

export function useSpecializations() {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: () => api.specialization.getAll(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
