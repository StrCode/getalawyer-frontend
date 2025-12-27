import type { ApplicationStatus as StoreApplicationStatus } from '../stores/enhanced-onboarding-store';
import { useEnhancedOnboardingStore } from '../stores/enhanced-onboarding-store';
import type { OnboardingStatusResponse, OnboardingStep } from './api/client';
import { api } from './api/client';

// Status synchronization service
export class OnboardingSyncService {
  private static instance: OnboardingSyncService;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): OnboardingSyncService {
    if (!OnboardingSyncService.instance) {
      OnboardingSyncService.instance = new OnboardingSyncService();
    }
    return OnboardingSyncService.instance;
  }

  /**
   * Initialize status synchronization on app load
   */
  async initializeSync(): Promise<void> {
    try {
      await this.syncOnboardingStatus();
      this.startPeriodicSync();
    } catch (error) {
      console.error('Failed to initialize onboarding sync:', error);
      // Don't throw - allow app to continue with cached state
    }
  }

  /**
   * Sync onboarding status with backend
   */
  async syncOnboardingStatus(): Promise<OnboardingStatusResponse | null> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return null;
    }

    this.syncInProgress = true;
    console.log('Starting onboarding sync...');

    // Emit sync start event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('onboardingSyncStart'));
    }

    try {
      console.log('Calling API to get onboarding status...');
      const response = await api.lawyer.getOnboardingStatus();
      console.log('Received onboarding status response:', response);
      
      this.updateStoreFromBackend(response);
      this.lastSyncTime = new Date();
      
      // Emit sync complete event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboardingSyncComplete', {
          detail: { response, syncTime: this.lastSyncTime }
        }));
      }
      
      console.log('Onboarding sync completed successfully');
      return response;
    } catch (error) {
      console.error('Failed to sync onboarding status:', error);
      
      // Emit sync error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboardingSyncError', {
          detail: { error: error instanceof Error ? error.message : 'Unknown error' }
        }));
      }
      
      return null;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Update the Zustand store with backend data
   */
  private updateStoreFromBackend(response: OnboardingStatusResponse): void {
    const store = useEnhancedOnboardingStore.getState();

    console.log('Updating store from backend:', response);

    // Update current step based on backend response
    if (response.currentStep !== store.currentStep) {
      console.log(`Setting current step from ${store.currentStep} to ${response.currentStep}`);
      store.setCurrentStep(response.currentStep);
    }

    // Update completed steps based on current step progression
    const completedSteps = this.calculateCompletedSteps(response.currentStep);
    console.log('Calculated completed steps:', completedSteps);
    completedSteps.forEach(step => {
      if (!store.completedSteps.includes(step)) {
        console.log(`Marking step ${step} as completed`);
        store.markStepCompleted(step);
      }
    });

    // Update form data if available from backend
    if (response.lawyer) {
      const { lawyer } = response;
      console.log('Updating practice info and credentials from lawyer data:', lawyer);
      
      // Update practice info from lawyer profile
      store.updatePracticeInfo({
        phoneNumber: lawyer.phoneNumber || '',
        country: lawyer.country || '',
        state: lawyer.state || '',
        // These fields need to be fetched from user profile separately
        firstName: store.practiceInfo.firstName || '', 
        lastName: store.practiceInfo.lastName || '',
        email: store.practiceInfo.email || '',
        middleName: store.practiceInfo.middleName || '',
        city: store.practiceInfo.city || '',
      });

      // Update credentials from lawyer profile
      store.updateCredentials({
        barNumber: lawyer.barLicenseNumber || '',
        admissionYear: store.credentials.admissionYear, // Keep existing if not provided
        lawSchool: store.credentials.lawSchool || '', // Keep existing if not provided
        graduationYear: store.credentials.graduationYear, // Keep existing if not provided
        currentFirm: store.credentials.currentFirm || '', // Keep existing if not provided
      });

      // Update application status
      const mappedStatus = this.mapApplicationStatus(lawyer.applicationStatus);
      if (mappedStatus !== store.applicationStatus) {
        console.log(`Setting application status from ${store.applicationStatus} to ${mappedStatus}`);
        store.setApplicationStatus(mappedStatus);
      }
    }

    // Update documents if available
    if (response.documents?.length > 0) {
      console.log('Updating documents from backend:', response.documents);
      // Clear existing documents and add from backend
      const currentDocuments = store.documents;
      for (const doc of currentDocuments) {
        store.removeDocument(doc.id);
      }
      
      for (const doc of response.documents) {
        store.addDocument({
          id: doc.id,
          type: doc.type,
          originalName: doc.originalName || 'Unknown',
          url: doc.url,
          publicId: doc.publicId,
          fileSize: 0, // Not available from backend
          uploadStatus: 'completed',
          uploadedAt: new Date(doc.createdAt),
        });
      }
    }

    // Update specializations if available
    if (response.specializations?.length > 0) {
      console.log('Updating specializations from backend:', response.specializations);
      // Clear existing specializations
      const currentSpecs = store.specializations;
      for (const spec of currentSpecs) {
        store.removeSpecialization(spec.specializationId);
      }
      
      // Add specializations from backend
      // Note: Backend doesn't provide years of experience per specialization
      // This would need to be enhanced in the backend API
      for (const spec of response.specializations) {
        store.addSpecialization({
          specializationId: spec.id,
          yearsOfExperience: 0, // Default value - backend doesn't provide this
          description: spec.description,
        });
      }
    }

    // Clear any unsaved changes since we just synced
    store.updateLastSaved();
    console.log('Store update completed');
  }

  /**
   * Calculate completed steps based on current step
   */
  private calculateCompletedSteps(currentStep: OnboardingStep): Array<OnboardingStep> {
    const stepOrder: Array<OnboardingStep> = [
      'practice_info',
      'documents', 
      'specializations',
      'submitted'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1) return [];

    // For submitted status, all previous steps are completed
    if (currentStep === 'submitted') {
      return ['practice_info', 'documents', 'specializations'];
    }

    // All steps before current step are considered completed
    return stepOrder.slice(0, currentIndex);
  }

  /**
   * Map backend application status to frontend status
   */
  private mapApplicationStatus(backendStatus: string): StoreApplicationStatus {
    switch (backendStatus) {
      case 'pending':
        return 'under_review';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'in_progress';
    }
  }

  /**
   * Handle status changes (e.g., from webhooks or polling)
   */
  async handleStatusChange(newStatus: StoreApplicationStatus): Promise<void> {
    const store = useEnhancedOnboardingStore.getState();
    
    if (newStatus !== store.applicationStatus) {
      store.setApplicationStatus(newStatus);
      
      // Trigger a full sync to get updated data
      await this.syncOnboardingStatus();
      
      // Emit custom event for UI components to react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboardingStatusChanged', {
          detail: { newStatus, previousStatus: store.applicationStatus }
        }));
      }
    }
  }

  /**
   * Start periodic sync (every 5 minutes)
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncOnboardingStatus();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Force sync (useful for manual refresh)
   */
  async forceSync(): Promise<OnboardingStatusResponse | null> {
    this.syncInProgress = false; // Reset flag to allow immediate sync
    return this.syncOnboardingStatus();
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPeriodicSync();
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }
}

// Export singleton instance
export const onboardingSyncService = OnboardingSyncService.getInstance();

// Hook for React components to use the sync service
export function useOnboardingSync() {
  const store = useEnhancedOnboardingStore();

  return {
    // Sync methods
    initializeSync: () => onboardingSyncService.initializeSync(),
    syncStatus: () => onboardingSyncService.syncOnboardingStatus(),
    forceSync: () => onboardingSyncService.forceSync(),
    
    // Status info
    lastSyncTime: onboardingSyncService.getLastSyncTime(),
    isSyncing: onboardingSyncService.isSyncing(),
    
    // Store state
    currentStep: store.currentStep,
    applicationStatus: store.applicationStatus,
    isLoading: store.isLoading,
    
    // Actions
    handleStatusChange: (status: StoreApplicationStatus) => 
      onboardingSyncService.handleStatusChange(status),
  };
}

// Utility function to redirect user to correct step based on backend status
export function redirectToCurrentStep(currentStep: OnboardingStep): string {
  const stepRoutes: Record<OnboardingStep, string> = {
    practice_info: '/onboarding/lawyer/basics',
    documents: '/onboarding/lawyer/credentials',
    specializations: '/onboarding/lawyer/specializations',
    submitted: '/onboarding/lawyer/status', // Show status page for submitted applications
  };

  return stepRoutes[currentStep] || '/onboarding/lawyer/basics';
}

// Function to check if user should be redirected based on their current progress
export async function checkAndRedirectToCurrentStep(): Promise<string | null> {
  try {
    console.log('Checking current step for redirect...');
    const response = await onboardingSyncService.syncOnboardingStatus();
    
    if (response) {
      const targetRoute = redirectToCurrentStep(response.currentStep);
      console.log(`User should be on step ${response.currentStep}, redirecting to ${targetRoute}`);
      return targetRoute;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to check current step for redirect:', error);
    return null;
  }
}

// Auto-initialize sync service when module is imported
if (typeof window !== 'undefined') {
  // Initialize on next tick to allow store to be ready
  setTimeout(() => {
    console.log('Auto-initializing onboarding sync service...');
    onboardingSyncService.initializeSync().then(() => {
      console.log('Onboarding sync service auto-initialization completed');
    }).catch(error => {
      console.warn('Auto-initialization of onboarding sync failed:', error);
      // Don't throw - allow app to continue
    });
  }, 100);
}