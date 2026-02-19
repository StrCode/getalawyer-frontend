import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ConnectCalendarInput } from '../../types/calendar';
import {
  connectCalendar,
  disconnectCalendar,
  getCalendarConnection,
} from '../api/calendar';
import { queryKeys } from '../query-client';

// Query hook for fetching calendar connection status
export function useCalendarConnection() {
  return useQuery({
    queryKey: queryKeys.calendar.connection,
    queryFn: getCalendarConnection,
  });
}

// Mutation hook for connecting calendar
export function useConnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectCalendarInput) => connectCalendar(data),
    onSuccess: () => {
      // Invalidate calendar connection cache to refetch the status
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.connection });
    },
  });
}

// Mutation hook for disconnecting calendar
export function useDisconnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () => {
      // Invalidate calendar connection cache to refetch the status
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.connection });
    },
  });
}
