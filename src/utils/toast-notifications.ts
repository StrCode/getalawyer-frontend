import { toastManager } from '@/components/ui/toast';
import { getErrorMessage, isNetworkError, isSessionTimeoutError } from './error-handler';

/**
 * Shows a success toast notification
 */
export function showSuccessToast(title: string, description?: string) {
  toastManager.add({
    title,
    description,
    type: 'success',
    duration: 5000,
  });
}

/**
 * Shows an error toast notification
 */
export function showErrorToast(title: string, description?: string) {
  toastManager.add({
    title,
    description,
    type: 'error',
    duration: 7000,
  });
}

/**
 * Shows an info toast notification
 */
export function showInfoToast(title: string, description?: string) {
  toastManager.add({
    title,
    description,
    type: 'info',
    duration: 5000,
  });
}

/**
 * Shows a warning toast notification
 */
export function showWarningToast(title: string, description?: string) {
  toastManager.add({
    title,
    description,
    type: 'warning',
    duration: 6000,
  });
}

/**
 * Shows a loading toast notification
 */
export function showLoadingToast(title: string, description?: string) {
  return toastManager.add({
    title,
    description,
    type: 'loading',
    duration: Number.POSITIVE_INFINITY, // Don't auto-dismiss
  });
}

/**
 * Shows an API error toast with user-friendly message
 */
export function showApiErrorToast(error: unknown, customTitle?: string) {
  const message = getErrorMessage(error);
  
  // Special handling for session timeout
  if (isSessionTimeoutError(error)) {
    showErrorToast('Session Expired', message);
    return;
  }
  
  // Special handling for network errors
  if (isNetworkError(error)) {
    showErrorToast('Network Error', message);
    return;
  }
  
  // Generic error
  showErrorToast(customTitle || 'Error', message);
}

/**
 * Shows an API error toast with retry action
 */
export function showApiErrorToastWithRetry(
  error: unknown,
  onRetry: () => void,
  customTitle?: string
) {
  const message = getErrorMessage(error);
  
  toastManager.add({
    title: customTitle || 'Error',
    description: message,
    type: 'error',
    duration: 10000,
    actionProps: {
      children: 'Retry',
      onClick: onRetry,
    },
  });
}

/**
 * Dismisses a specific toast by ID
 */
export function dismissToast(toastId: string) {
  toastManager.remove(toastId);
}

/**
 * Dismisses all toasts
 */
export function dismissAllToasts() {
  toastManager.clear();
}
