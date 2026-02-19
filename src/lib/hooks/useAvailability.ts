import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AvailabilityException,
  CreateExceptionInput,
  WeeklySchedule,
} from '../../types/availability';
import {
  createAvailabilityException,
  deleteAvailabilityException,
  getAvailabilityExceptions,
  getAvailabilitySchedule,
  updateAvailabilitySchedule,
} from '../api/availability';
import { queryKeys } from '../query-client';

// Query hook for fetching availability schedule
export function useAvailabilitySchedule() {
  return useQuery({
    queryKey: queryKeys.availability.schedule,
    queryFn: getAvailabilitySchedule,
  });
}

// Mutation hook for updating availability schedule
export function useUpdateAvailabilitySchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: WeeklySchedule) => updateAvailabilitySchedule(schedule),
    onSuccess: () => {
      // Invalidate schedule cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule });
      
      // Invalidate all available-slots queries since availability changed
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

// Query hook for fetching availability exceptions
export function useAvailabilityExceptions() {
  return useQuery({
    queryKey: queryKeys.availability.exceptions,
    queryFn: getAvailabilityExceptions,
  });
}

// Mutation hook for creating an availability exception
export function useCreateAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExceptionInput) => createAvailabilityException(data),
    onMutate: async (newException) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.availability.exceptions });

      // Snapshot previous value
      const previousExceptions = queryClient.getQueryData<AvailabilityException[]>(
        queryKeys.availability.exceptions
      );

      // Optimistically add the new exception (with temporary ID)
      if (previousExceptions) {
        const optimisticException: AvailabilityException = {
          id: `temp-${Date.now()}`,
          lawyerId: 'current-lawyer', // Will be replaced by server response
          startDate: newException.startDate,
          endDate: newException.endDate,
          reason: newException.reason,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<AvailabilityException[]>(
          queryKeys.availability.exceptions,
          [...previousExceptions, optimisticException]
        );
      }

      return { previousExceptions };
    },
    onError: (_err, _newException, context) => {
      // Rollback on error
      if (context?.previousExceptions) {
        queryClient.setQueryData(queryKeys.availability.exceptions, context.previousExceptions);
      }
    },
    onSuccess: () => {
      // Invalidate exceptions cache to refetch with real data
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions });
      
      // Invalidate all available-slots queries since availability changed
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

// Mutation hook for deleting an availability exception with optimistic updates
export function useDeleteAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAvailabilityException(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.availability.exceptions });

      // Snapshot previous value
      const previousExceptions = queryClient.getQueryData<AvailabilityException[]>(
        queryKeys.availability.exceptions
      );

      // Optimistically remove the deleted exception
      if (previousExceptions) {
        queryClient.setQueryData<AvailabilityException[]>(
          queryKeys.availability.exceptions,
          previousExceptions.filter((exception) => exception.id !== id)
        );
      }

      return { previousExceptions };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousExceptions) {
        queryClient.setQueryData(queryKeys.availability.exceptions, context.previousExceptions);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions });
      
      // Invalidate all available-slots queries since availability changed
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}
