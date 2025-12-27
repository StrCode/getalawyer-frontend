import { useCallback, useEffect, useState } from 'react';

/**
 * Network connection status
 */
export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

/**
 * Network event types
 */
export type NetworkEventType = 'online' | 'offline' | 'change';

/**
 * Network event listener
 */
export type NetworkEventListener = (status: NetworkStatus) => void;

/**
 * Get current network status from browser APIs
 */
function getCurrentNetworkStatus(): NetworkStatus {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  // Get connection info if available (Chrome/Edge)
  const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
  
  return {
    isOnline,
    isOffline: !isOnline,
    connectionType: connection?.type || null,
    effectiveType: connection?.effectiveType || null,
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
    saveData: connection?.saveData || false
  };
}

/**
 * Hook for monitoring network status with detailed connection information
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(getCurrentNetworkStatus);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState<number>(0);

  const updateNetworkStatus = useCallback(() => {
    const newStatus = getCurrentNetworkStatus();
    const previousStatus = networkStatus;
    
    setNetworkStatus(newStatus);
    
    // Track online/offline transitions
    if (newStatus.isOnline && !previousStatus.isOnline) {
      setLastOnlineTime(new Date());
      if (lastOfflineTime) {
        setOfflineDuration(Date.now() - lastOfflineTime.getTime());
      }
    } else if (!newStatus.isOnline && previousStatus.isOnline) {
      setLastOfflineTime(new Date());
    }
  }, [networkStatus, lastOfflineTime]);

  useEffect(() => {
    // Set initial online time if we start online
    if (networkStatus.isOnline && !lastOnlineTime) {
      setLastOnlineTime(new Date());
    }

    // Listen for online/offline events
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  // Periodic connectivity check (every 30 seconds when offline)
  useEffect(() => {
    if (!networkStatus.isOnline) {
      const interval = setInterval(() => {
        // Try to fetch a small resource to verify connectivity
        fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        })
        .then(() => {
          if (!networkStatus.isOnline) {
            updateNetworkStatus();
          }
        })
        .catch(() => {
          // Still offline, do nothing
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [networkStatus.isOnline, updateNetworkStatus]);

  return {
    ...networkStatus,
    lastOnlineTime,
    lastOfflineTime,
    offlineDuration,
    
    // Utility methods
    hasSlowConnection: networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g',
    hasFastConnection: networkStatus.effectiveType === '4g' || (networkStatus.downlink && networkStatus.downlink > 10),
    shouldSaveData: networkStatus.saveData || networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g',
    
    // Manual refresh
    refresh: updateNetworkStatus
  };
}

/**
 * Hook for network event listeners
 */
export function useNetworkEventListener(
  eventType: NetworkEventType | Array<NetworkEventType>,
  listener: NetworkEventListener,
  deps: Array<any> = []
) {
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const events = Array.isArray(eventType) ? eventType : [eventType];
    
    if (events.includes('online') && networkStatus.isOnline) {
      listener(networkStatus);
    }
    
    if (events.includes('offline') && networkStatus.isOffline) {
      listener(networkStatus);
    }
    
    if (events.includes('change')) {
      listener(networkStatus);
    }
  }, [networkStatus, listener, ...deps]);
}

/**
 * Hook for detecting when network comes back online
 */
export function useOnlineDetection(callback: (status: NetworkStatus) => void) {
  const [wasOffline, setWasOffline] = useState(false);
  
  useNetworkEventListener(['online', 'offline'], (status) => {
    if (status.isOnline && wasOffline) {
      callback(status);
      setWasOffline(false);
    } else if (status.isOffline) {
      setWasOffline(true);
    }
  });
}

/**
 * Hook for network-aware operations
 */
export function useNetworkAwareOperation() {
  const networkStatus = useNetworkStatus();
  
  const executeWhenOnline = useCallback(
    (operation: () => Promise<any> | any) => {
      return new Promise((resolve, reject) => {
        if (networkStatus.isOnline) {
          try {
            const result = operation();
            if (result instanceof Promise) {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // Queue operation for when network comes back
          const handleOnline = () => {
            try {
              const result = operation();
              if (result instanceof Promise) {
                result.then(resolve).catch(reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
            window.removeEventListener('online', handleOnline);
          };
          
          window.addEventListener('online', handleOnline);
        }
      });
    },
    [networkStatus.isOnline]
  );

  const shouldDeferOperation = useCallback(() => {
    return networkStatus.isOffline || networkStatus.shouldSaveData;
  }, [networkStatus.isOffline, networkStatus.shouldSaveData]);

  return {
    networkStatus,
    executeWhenOnline,
    shouldDeferOperation,
    canExecuteNow: networkStatus.isOnline && !networkStatus.shouldSaveData
  };
}