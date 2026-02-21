import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AccountCreationFormData,
  PersonalInfoFormData,
  PracticeInfoFormData,
  ProfessionalInfoFormData,
} from '@/lib/api/registration';
import { registrationAPI } from '@/lib/api/registration';

// ============================================================================
// Query Keys
// ============================================================================

export const registrationQueryKeys = {
  status: ['registration', 'status'] as const,
  step2: ['registration', 'step2'] as const,
  step4: ['registration', 'step4'] as const,
  step5: ['registration', 'step5'] as const,
  summary: ['registration', 'summary'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch registration status
 * Requirements: 9.1, 10.2
 */
export function useRegistrationStatus() {
  return useQuery({
    queryKey: registrationQueryKeys.status,
    queryFn: () => registrationAPI.getRegistrationStatus(),
    staleTime: 0, // Always fetch fresh status
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch personal information (Step 2)
 * Requirements: 2.1
 */
export function usePersonalInfo() {
  return useQuery({
    queryKey: registrationQueryKeys.step2,
    queryFn: () => registrationAPI.getPersonalInfo(),
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Hook to fetch professional information (Step 4)
 * Requirements: 4.1
 */
export function useProfessionalInfo() {
  return useQuery({
    queryKey: registrationQueryKeys.step4,
    queryFn: () => registrationAPI.getProfessionalInfo(),
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Hook to fetch practice information (Step 5)
 * Requirements: 5.1
 */
export function usePracticeInfo() {
  return useQuery({
    queryKey: registrationQueryKeys.step5,
    queryFn: () => registrationAPI.getPracticeInfo(),
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Hook to fetch registration summary (Step 7)
 * Requirements: 7.1
 */
export function useRegistrationSummary() {
  return useQuery({
    queryKey: registrationQueryKeys.summary,
    queryFn: () => registrationAPI.getRegistrationSummary(),
    enabled: false, // Only fetch when explicitly called
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create account (Step 1)
 * Requirements: 1.5
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AccountCreationFormData) => 
      registrationAPI.createAccount(data),
    onSuccess: (response) => {
      // Store token and lawyer_id in localStorage
      // Requirements: 1.6
      localStorage.setItem('lawyer_token', response.token);
      localStorage.setItem('lawyer_id', response.lawyer_id);
      
      // Invalidate status to refetch with new registration status
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.status });
    },
  });
}

/**
 * Hook to save personal information (Step 2)
 * Requirements: 2.5
 */
export function useSavePersonalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonalInfoFormData) => 
      registrationAPI.savePersonalInfo(data),
    onSuccess: () => {
      // Invalidate personal info cache and status
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.step2 });
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.status });
    },
  });
}

/**
 * Hook to verify NIN (Step 3)
 * Requirements: 3.2
 * 
 * No retries - NIN verification should only be attempted once per user action
 */
export function useVerifyNIN() {
  return useMutation({
    mutationFn: ({ nin, consent }: { nin: string; consent: boolean }) => 
      registrationAPI.verifyNIN(nin, consent),
    retry: false, // No automatic retries - user must manually retry if needed
  });
}

/**
 * Hook to confirm NIN (Step 3)
 * Requirements: 3.6
 */
export function useConfirmNIN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirmed: boolean) => registrationAPI.confirmNIN(confirmed),
    onSuccess: () => {
      // Invalidate status to refetch with new registration status
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.status });
    },
  });
}

/**
 * Hook to save professional information (Step 4)
 * Requirements: 4.5
 */
export function useSaveProfessionalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfessionalInfoFormData) => 
      registrationAPI.saveProfessionalInfo(data),
    onSuccess: () => {
      // Invalidate professional info cache and status
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.step4 });
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.status });
    },
  });
}

/**
 * Hook to save practice information (Step 5)
 * Requirements: 5.7
 */
export function useSavePracticeInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PracticeInfoFormData) => 
      registrationAPI.savePracticeInfo(data),
    onSuccess: () => {
      // Invalidate practice info cache and status
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.step5 });
      queryClient.invalidateQueries({ queryKey: registrationQueryKeys.status });
    },
  });
}

/**
 * Hook to submit application (Step 6, formerly step 7 - document upload removed)
 * Requirements: 7.9
 */
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => registrationAPI.submitApplication(),
    onSuccess: () => {
      // Clear local storage draft data
      // Requirements: 9.7
      localStorage.removeItem('registration_draft');
      
      // Invalidate all registration queries
      queryClient.invalidateQueries({ queryKey: ['registration'] });
    },
  });
}
