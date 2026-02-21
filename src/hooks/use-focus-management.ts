import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing focus on page/step transitions
 * Moves focus to the main heading when a new step loads
 * This helps screen reader users understand context changes
 */
export function useFocusOnMount() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus the heading when component mounts
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return headingRef;
}

/**
 * Custom hook for managing skip links
 * Allows keyboard users to skip repetitive navigation
 */
export function useSkipLink() {
  const mainContentRef = useRef<HTMLElement>(null);

  const skipToContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { mainContentRef, skipToContent };
}

/**
 * Custom hook for keyboard shortcuts
 * Provides common keyboard shortcuts for form navigation
 */
export function useKeyboardShortcuts(handlers: {
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }

      // Escape: Cancel
      if (e.key === 'Escape') {
        handlers.onCancel?.();
      }

      // Ctrl/Cmd + Enter: Next/Submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlers.onNext?.();
      }

      // Alt + Left Arrow: Previous
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlers.onPrevious?.();
      }

      // Alt + Right Arrow: Next
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handlers.onNext?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
