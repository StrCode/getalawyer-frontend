import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkStatus, useOnlineDetection } from './use-network-status';

/**
 * Queued operation types
 */
export type OperationType = 'save' | 'upload' | 'submit' | 'delete' | 'update';

/**
 * Queued operation interface
 */
export interface QueuedOperation {
  id: string;
  type: OperationType;
  operation: () => Promise<any>;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: number; // Lower number = higher priority
  description: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onRetry?: (retryCount: number) => void;
}

/**
 * Queue status
 */
export interface QueueStatus {
  totalOperations: number;
  pendingOperations: number;
  failedOperations: number;
  completedOperations: number;
  isProcessing: boolean;
  lastProcessedAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
}

/**
 * Hook for managing offline operation queue
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<Array<QueuedOperation>>([]);
  const [status, setStatus] = useState<QueueStatus>({
    totalOperations: 0,
    pendingOperations: 0,
    failedOperations: 0,
    completedOperations: 0,
    isProcessing: false,
    lastProcessedAt: null,
    lastErrorAt: null,
    lastError: null
  });
  
  const { isOnline } = useNetworkStatus();
  const processingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offline-operation-queue');
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        const restoredQueue = parsedQueue.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          // Note: Functions can't be serialized, so operations need to be re-registered
          operation: () => Promise.reject(new Error('Operation needs to be re-registered'))
        }));
        setQueue(restoredQueue);
      } catch (error) {
        console.error('Failed to restore offline queue:', error);
        localStorage.removeItem('offline-operation-queue');
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    const queueToSave = queue.map(({ operation, onSuccess, onError, onRetry, ...rest }) => rest);
    localStorage.setItem('offline-operation-queue', JSON.stringify(queueToSave));
    
    // Update status
    setStatus(prev => ({
      ...prev,
      totalOperations: queue.length,
      pendingOperations: queue.filter(op => op.retryCount < op.maxRetries).length,
      failedOperations: queue.filter(op => op.retryCount >= op.maxRetries).length,
      completedOperations: prev.completedOperations
    }));
  }, [queue]);

  // Add operation to queue
  const addOperation = useCallback((
    type: OperationType,
    operation: () => Promise<any>,
    data: any,
    options: {
      description: string;
      priority?: number;
      maxRetries?: number;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
      onRetry?: (retryCount: number) => void;
    }
  ) => {
    const queuedOperation: QueuedOperation = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      operation,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 5,
      description: options.description,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onRetry: options.onRetry
    };

    setQueue(prev => {
      const newQueue = [...prev, queuedOperation];
      // Sort by priority (lower number = higher priority)
      return newQueue.sort((a, b) => a.priority - b.priority);
    });

    // If online, try to process immediately
    if (isOnline) {
      processQueue();
    }

    return queuedOperation.id;
  }, [isOnline]);

  // Remove operation from queue
  const removeOperation = useCallback((id: string) => {
    setQueue(prev => prev.filter(op => op.id !== id));
  }, []);

  // Update operation in queue
  const updateOperation = useCallback((id: string, updates: Partial<QueuedOperation>) => {
    setQueue(prev => prev.map(op => 
      op.id === id ? { ...op, ...updates } : op
    ));
  }, []);

  // Process queue
  const processQueue = useCallback(async () => {
    if (processingRef.current || !isOnline) {
      return;
    }

    processingRef.current = true;
    setStatus(prev => ({ ...prev, isProcessing: true }));

    const pendingOperations = queue.filter(op => op.retryCount < op.maxRetries);
    
    for (const operation of pendingOperations) {
      try {
        const result = await operation.operation();
        
        // Operation succeeded
        operation.onSuccess?.(result);
        removeOperation(operation.id);
        
        setStatus(prev => ({
          ...prev,
          completedOperations: prev.completedOperations + 1,
          lastProcessedAt: new Date(),
          lastError: null,
          lastErrorAt: null
        }));
        
      } catch (error) {
        // Operation failed
        const newRetryCount = operation.retryCount + 1;
        
        if (newRetryCount >= operation.maxRetries) {
          // Max retries reached
          operation.onError?.(error);
          setStatus(prev => ({
            ...prev,
            lastError: error instanceof Error ? error.message : 'Unknown error',
            lastErrorAt: new Date()
          }));
        } else {
          // Schedule retry
          operation.onRetry?.(newRetryCount);
          updateOperation(operation.id, { retryCount: newRetryCount });
          
          // Exponential backoff: 2^retryCount seconds
          const retryDelay = Math.pow(2, newRetryCount) * 1000;
          retryTimeoutRef.current = setTimeout(() => {
            processQueue();
          }, retryDelay);
        }
      }
    }

    processingRef.current = false;
    setStatus(prev => ({ ...prev, isProcessing: false }));
  }, [isOnline, queue, removeOperation, updateOperation]);

  // Process queue when coming back online
  useOnlineDetection(() => {
    if (queue.length > 0) {
      processQueue();
    }
  });

  // Clear completed and failed operations
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(op => op.retryCount < op.maxRetries));
  }, []);

  const clearFailed = useCallback(() => {
    setQueue(prev => prev.filter(op => op.retryCount < op.maxRetries));
  }, []);

  const clearAll = useCallback(() => {
    setQueue([]);
    localStorage.removeItem('offline-operation-queue');
  }, []);

  // Retry failed operations
  const retryFailed = useCallback(() => {
    setQueue(prev => prev.map(op => 
      op.retryCount >= op.maxRetries 
        ? { ...op, retryCount: 0 }
        : op
    ));
    
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Get operations by type
  const getOperationsByType = useCallback((type: OperationType) => {
    return queue.filter(op => op.type === type);
  }, [queue]);

  // Get pending operations
  const getPendingOperations = useCallback(() => {
    return queue.filter(op => op.retryCount < op.maxRetries);
  }, [queue]);

  // Get failed operations
  const getFailedOperations = useCallback(() => {
    return queue.filter(op => op.retryCount >= op.maxRetries);
  }, [queue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Queue state
    queue,
    status,
    
    // Queue operations
    addOperation,
    removeOperation,
    updateOperation,
    processQueue,
    
    // Queue management
    clearCompleted,
    clearFailed,
    clearAll,
    retryFailed,
    
    // Queue queries
    getOperationsByType,
    getPendingOperations,
    getFailedOperations,
    
    // Status checks
    hasOperations: queue.length > 0,
    hasPendingOperations: status.pendingOperations > 0,
    hasFailedOperations: status.failedOperations > 0,
    isProcessing: status.isProcessing
  };
}

/**
 * Hook for queuing specific operation types
 */
export function useQueuedSave() {
  const { addOperation, status } = useOfflineQueue();
  
  const queueSave = useCallback((
    saveOperation: () => Promise<any>,
    data: any,
    description: string,
    callbacks?: {
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
    }
  ) => {
    return addOperation('save', saveOperation, data, {
      description,
      priority: 1, // High priority for saves
      maxRetries: 5,
      ...callbacks
    });
  }, [addOperation]);

  return {
    queueSave,
    hasPendingSaves: status.pendingOperations > 0,
    isProcessingSaves: status.isProcessing
  };
}

/**
 * Hook for queuing upload operations
 */
export function useQueuedUpload() {
  const { addOperation, status, getOperationsByType } = useOfflineQueue();
  
  const queueUpload = useCallback((
    uploadOperation: () => Promise<any>,
    fileData: any,
    description: string,
    callbacks?: {
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
      onRetry?: (retryCount: number) => void;
    }
  ) => {
    return addOperation('upload', uploadOperation, fileData, {
      description,
      priority: 2, // Medium-high priority for uploads
      maxRetries: 3,
      ...callbacks
    });
  }, [addOperation]);

  const getUploadOperations = useCallback(() => {
    return getOperationsByType('upload');
  }, [getOperationsByType]);

  return {
    queueUpload,
    getUploadOperations,
    hasPendingUploads: getUploadOperations().some(op => op.retryCount < op.maxRetries),
    isProcessingUploads: status.isProcessing && getUploadOperations().length > 0
  };
}