import { Toast } from '@base-ui/react/toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  type?: 'success' | 'error' | 'warning' | 'info';
}

// Create a toast manager instance
const toastManager = Toast.createToastManager();

export function useToast() {
  const toast = ({ title, description, variant, type }: ToastOptions) => {
    const toastType = variant === 'destructive' ? 'error' : type || 'success';
    
    // Use the toast manager to add a toast
    toastManager.add({
      title,
      description,
      type: toastType,
    });
  };

  return { toast };
}

// Export the toast manager for use in components
export { toastManager };