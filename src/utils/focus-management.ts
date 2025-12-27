/**
 * Focus Management Utilities for Onboarding Flow
 * Provides keyboard navigation and focus management for accessibility
 */

export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
}

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element): element is HTMLElement => {
      const htmlElement = element as HTMLElement;
      return (
        htmlElement.offsetWidth > 0 &&
        htmlElement.offsetHeight > 0 &&
        !htmlElement.hidden &&
        window.getComputedStyle(htmlElement).visibility !== 'hidden'
      );
    });
}

/**
 * Manages focus within a step navigation component
 */
export class StepFocusManager {
  private container: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
  }

  /**
   * Updates the list of focusable elements
   */
  updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
  }

  /**
   * Moves focus to the next focusable element
   */
  focusNext(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  /**
   * Moves focus to the previous focusable element
   */
  focusPrevious(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.currentFocusIndex === 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  /**
   * Moves focus to the first focusable element
   */
  focusFirst(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = 0;
    this.focusableElements[0]?.focus();
  }

  /**
   * Moves focus to the last focusable element
   */
  focusLast(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  /**
   * Handles keyboard navigation within the container
   */
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
    }
  }
}

/**
 * Hook for managing focus within a component
 */
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const [focusManager, setFocusManager] = React.useState<StepFocusManager | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      const manager = new StepFocusManager(containerRef.current);
      setFocusManager(manager);

      const handleKeyDown = (event: KeyboardEvent) => {
        manager.handleKeyDown(event);
      };

      containerRef.current.addEventListener('keydown', handleKeyDown);

      return () => {
        containerRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [containerRef]);

  React.useEffect(() => {
    // Update focusable elements when container content changes
    if (focusManager) {
      focusManager.updateFocusableElements();
    }
  });

  return focusManager;
}

/**
 * Announces content changes to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after a short delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Manages focus restoration when navigating between steps
 */
export class StepNavigationFocusManager {
  private previousFocus: HTMLElement | null = null;

  /**
   * Saves the currently focused element before navigation
   */
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  /**
   * Restores focus to the previously focused element
   */
  restoreFocus(): void {
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    }
  }

  /**
   * Focuses the main heading of a new step
   */
  focusStepHeading(stepId: string): void {
    const heading = document.querySelector(`[data-step="${stepId}"] h1, [data-step="${stepId}"] h2`) as HTMLElement;
    if (heading) {
      heading.focus();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Announces step change to screen readers
   */
  announceStepChange(stepTitle: string, stepNumber: number, totalSteps: number): void {
    const message = `Navigated to step ${stepNumber} of ${totalSteps}: ${stepTitle}`;
    announceToScreenReader(message, 'assertive');
  }
}

// Global focus manager instance
export const stepNavigationFocusManager = new StepNavigationFocusManager();

// Import React for the hook
import React from 'react';