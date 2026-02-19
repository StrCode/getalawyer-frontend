import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConsultationType,
  CreateConsultationTypeInput,
  UpdateConsultationTypeInput,
} from '../../types/booking';
import {
  createConsultationType,
  deleteConsultationType,
  getConsultationType,
  getConsultationTypes,
  updateConsultationType,
} from '../api/consultation-types';
import { queryKeys } from '../query-client';

// Query hook for fetching all consultation types
export function useConsultationTypes() {
  return useQuery({
    queryKey: queryKeys.consultationTypes.all,
    queryFn: getConsultationTypes,
  });
}

// Query hook for fetching a single consultation type
export function useConsultationType(id: string) {
  return useQuery({
    queryKey: queryKeys.consultationTypes.detail(id),
    queryFn: () => getConsultationType(id),
    enabled: !!id,
  });
}

// Mutation hook for creating a consultation type
export function useCreateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsultationTypeInput) => createConsultationType(data),
    onSuccess: () => {
      // Invalidate consultation types cache to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationTypes.all });
    },
  });
}

// Mutation hook for updating a consultation type
export function useUpdateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConsultationTypeInput }) =>
      updateConsultationType(id, data),
    onSuccess: (updatedType) => {
      // Invalidate both the list and the specific consultation type
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationTypes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationTypes.detail(updatedType.id) });
    },
  });
}

// Mutation hook for deleting a consultation type with optimistic updates
export function useDeleteConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConsultationType(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.consultationTypes.all });

      // Snapshot previous value
      const previousTypes = queryClient.getQueryData<ConsultationType[]>(
        queryKeys.consultationTypes.all
      );

      // Optimistically update by removing the deleted type
      if (previousTypes) {
        queryClient.setQueryData<ConsultationType[]>(
          queryKeys.consultationTypes.all,
          previousTypes.filter((type) => type.id !== id)
        );
      }

      return { previousTypes };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTypes) {
        queryClient.setQueryData(queryKeys.consultationTypes.all, context.previousTypes);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationTypes.all });
    },
  });
}
