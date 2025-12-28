import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// Query keys for admin operations
export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  applications: (filters?: Record<string, unknown>) => ['admin', 'applications', filters] as const,
  users: (filters?: Record<string, unknown>) => ['admin', 'users', filters] as const,
  lawyers: (filters?: Record<string, unknown>) => ['admin', 'lawyers', filters] as const,
  clients: (filters?: Record<string, unknown>) => ['admin', 'clients', filters] as const,
  statistics: (params?: Record<string, unknown>) => ['admin', 'statistics', params] as const,
};

// Dashboard queries
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: () => api.admin.getDashboard(),
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// Application queries
export function useAdminApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
  query?: string;
  sortBy?: string;
  sortOrder?: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  return useQuery({
    queryKey: adminQueryKeys.applications(params),
    queryFn: () => api.admin.getApplications(params),
  });
}

export function useAdminApplication(id: string) {
  return useQuery({
    queryKey: ['admin', 'application', id],
    queryFn: () => api.admin.getApplication(id),
    enabled: !!id,
  });
}

// Application mutations
export function useApproveApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) =>
      api.admin.approveApplication(id, { reviewNotes }),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, feedback }: { id: string; reason: string; feedback: string }) =>
      api.admin.rejectApplication(id, { reason, feedback }),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
    },
  });
}

// User queries
export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  query?: string;
  userType?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => api.admin.getUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => api.admin.getUser(id),
    enabled: !!id,
  });
}

// User mutations
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, reason, banExpires }: { 
      id: string; 
      status: 'suspend' | 'reactivate' | 'flag'; 
      reason: string; 
      banExpires?: string;
    }) =>
      api.admin.updateUserStatus(id, { status, reason, banExpires }),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name, email, role }: { 
      id: string; 
      name?: string; 
      email?: string; 
      role?: string;
    }) =>
      api.admin.updateUserProfile(id, { name, email, role }),
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
    },
  });
}

// Lawyer queries
export function useAdminLawyers(params: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  return useQuery({
    queryKey: adminQueryKeys.lawyers(params),
    queryFn: () => api.admin.getLawyers(params),
  });
}

export function useAdminLawyer(id: string) {
  return useQuery({
    queryKey: ['admin', 'lawyer', id],
    queryFn: () => api.admin.getLawyer(id),
    enabled: !!id,
  });
}

// Client queries
export function useAdminClients(params: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  return useQuery({
    queryKey: adminQueryKeys.clients(params),
    queryFn: () => api.admin.getClients(params),
  });
}

export function useAdminClient(id: string) {
  return useQuery({
    queryKey: ['admin', 'client', id],
    queryFn: () => api.admin.getClient(id),
    enabled: !!id,
  });
}

// Statistics queries
export function useAdminStatistics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  metrics?: string;
}) {
  return useQuery({
    queryKey: adminQueryKeys.statistics(params),
    queryFn: () => api.admin.getStatistics(params),
  });
}

// Export mutations
export function useExportData() {
  return useMutation({
    mutationFn: (config: {
      type: 'users' | 'applications' | 'audit_log' | 'statistics';
      format: 'csv' | 'excel' | 'pdf';
      filters?: Record<string, any>;
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      columns?: string[];
    }) => api.admin.exportData(config),
  });
}