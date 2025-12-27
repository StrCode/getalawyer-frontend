import { type ReactNode, useEffect, useState } from 'react';
import { onboardingSyncService } from '../../lib/onboarding-sync';

interface OnboardingSyncProviderProps {
  children: ReactNode;
  enableAutoSync?: boolean;
}

interface SyncStatus {
  isInitialized: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

/**
 * Provider component that initializes and manages onboarding synchronization
 * Should be placed high in the component tree, ideally in the app root
 */
export function OnboardingSyncProvider({ 
  children, 
  enableAutoSync = true
}: OnboardingSyncProviderProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isInitialized: false,
    lastSyncTime: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const initializeSync = async () => {
      try {
        if (enableAutoSync) {
          await onboardingSyncService.initializeSync();
        }
        
        if (mounted) {
          setSyncStatus({
            isInitialized: true,
            lastSyncTime: onboardingSyncService.getLastSyncTime(),
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to initialize onboarding sync:', error);
        if (mounted) {
          setSyncStatus({
            isInitialized: true,
            lastSyncTime: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    initializeSync();

    return () => {
      mounted = false;
      if (enableAutoSync) {
        onboardingSyncService.cleanup();
      }
    };
  }, [enableAutoSync]);

  // Update sync status periodically
  useEffect(() => {
    if (!syncStatus.isInitialized) return;

    const updateSyncStatus = () => {
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: onboardingSyncService.getLastSyncTime(),
      }));
    };

    const interval = setInterval(updateSyncStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [syncStatus.isInitialized]);

  // Listen for sync events
  useEffect(() => {
    const handleSyncComplete = () => {
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: onboardingSyncService.getLastSyncTime(),
        error: null,
      }));
    };

    const handleSyncError = (event: CustomEvent) => {
      setSyncStatus(prev => ({
        ...prev,
        error: event.detail.error,
      }));
    };

    window.addEventListener('onboardingSyncComplete', handleSyncComplete);
    window.addEventListener('onboardingSyncError', handleSyncError as EventListener);

    return () => {
      window.removeEventListener('onboardingSyncComplete', handleSyncComplete);
      window.removeEventListener('onboardingSyncError', handleSyncError as EventListener);
    };
  }, []);

  return (
    <>
      {children}
      {/* Optional: Add a debug component in development */}
      {process.env.NODE_ENV === 'development' && (
        <OnboardingSyncDebugInfo syncStatus={syncStatus} />
      )}
    </>
  );
}

/**
 * Debug component to show sync status in development
 */
function OnboardingSyncDebugInfo({ syncStatus }: { syncStatus: SyncStatus }) {
  const [isVisible, setIsVisible] = useState(false);

  if (!syncStatus.isInitialized) {
    return null;
  }

  return (
    <button 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        cursor: 'pointer',
        border: 'none',
      }}
      onClick={() => setIsVisible(!isVisible)}
      type="button"
    >
      {isVisible ? (
        <div>
          <div>🔄 Onboarding Sync</div>
          <div>Last sync: {syncStatus.lastSyncTime && syncStatus.lastSyncTime instanceof Date && !isNaN(syncStatus.lastSyncTime.getTime()) ? syncStatus.lastSyncTime.toLocaleTimeString() : 'Never'}</div>
          <div>Status: {syncStatus.error ? '❌ Error' : '✅ OK'}</div>
          {syncStatus.error && <div>Error: {syncStatus.error}</div>}
          <div>Syncing: {onboardingSyncService.isSyncing() ? 'Yes' : 'No'}</div>
        </div>
      ) : (
        <div>🔄</div>
      )}
    </button>
  );
}

/**
 * Hook to access sync status from components
 */
export function useOnboardingSyncStatus() {
  const [status, setStatus] = useState({
    isInitialized: false,
    lastSyncTime: onboardingSyncService.getLastSyncTime(),
    isSyncing: onboardingSyncService.isSyncing(),
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        isInitialized: true,
        lastSyncTime: onboardingSyncService.getLastSyncTime(),
        isSyncing: onboardingSyncService.isSyncing(),
      });
    };

    // Update immediately
    updateStatus();

    // Update periodically
    const interval = setInterval(updateStatus, 1000);

    // Listen for sync events
    const handleSyncStart = () => updateStatus();
    const handleSyncComplete = () => updateStatus();

    window.addEventListener('onboardingSyncStart', handleSyncStart);
    window.addEventListener('onboardingSyncComplete', handleSyncComplete);

    return () => {
      clearInterval(interval);
      window.removeEventListener('onboardingSyncStart', handleSyncStart);
      window.removeEventListener('onboardingSyncComplete', handleSyncComplete);
    };
  }, []);

  return status;
}