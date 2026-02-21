import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/client';

// TanStack Query client with retry logic and cache configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 3 times for server/network errors
        return failureCount < 3;
      },
      
      // Exponential backoff with jitter
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for critical data
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Don't auto-retry mutations
      retry: false,
    },
  },
});

// Query key factory for consistent cache keys
export const queryKeys = {
  // Consultation Types
  consultationTypes: {
    all: ['consultation-types'] as const,
    detail: (id: string) => ['consultation-types', id] as const,
  },
  
  // Availability
  availability: {
    schedule: ['availability', 'schedule'] as const,
    exceptions: ['availability', 'exceptions'] as const,
  },
  
  // Bookings
  bookings: {
    client: ['bookings', 'client'] as const,
    lawyer: ['bookings', 'lawyer'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  
  // Available Slots
  availableSlots: (lawyerId: string, consultationTypeId: string, startDate: string, endDate: string) =>
    ['available-slots', lawyerId, consultationTypeId, startDate, endDate] as const,
  
  // Lawyers
  lawyers: {
    all: ['lawyers'] as const,
    detail: (id: string) => ['lawyers', id] as const,
    public: (id: string) => ['lawyers', 'public', id] as const,
  },
  
  // Calendar
  calendar: {
    connection: ['calendar', 'connection'] as const,
  },
  
  // Registration
  registration: {
    status: ['registration', 'status'] as const,
    step2: ['registration', 'step2'] as const,
    step4: ['registration', 'step4'] as const,
    step5: ['registration', 'step5'] as const,
    summary: ['registration', 'summary'] as const,
  },
};
