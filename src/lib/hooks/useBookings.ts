import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Booking, UpdateLawyerBookingInput } from '../../types/booking';
import { getLawyerBookings, updateLawyerBooking } from '../api/bookings';
import { queryKeys } from '../query-client';

// Query hook for fetching lawyer bookings
export function useLawyerBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.lawyer,
    queryFn: getLawyerBookings,
  });
}

// Mutation hook for updating lawyer booking status with optimistic updates
export function useUpdateLawyerBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLawyerBookingInput }) =>
      updateLawyerBooking(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.lawyer });

      // Snapshot previous value
      const previousBookings = queryClient.getQueryData<Booking[]>(queryKeys.bookings.lawyer);

      // Optimistically update the booking
      if (previousBookings) {
        queryClient.setQueryData<Booking[]>(
          queryKeys.bookings.lawyer,
          previousBookings.map((booking) =>
            booking.id === id ? { ...booking, ...data } : booking
          )
        );
      }

      return { previousBookings };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lawyer, context.previousBookings);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer });
    },
  });
}
