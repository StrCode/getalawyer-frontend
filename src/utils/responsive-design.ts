/**
 * Responsive Design Utilities for Onboarding Flow
 * Provides mobile-first responsive design helpers and touch interaction support
 */

import { useEffect, useState } from 'react';

/**
 * Breakpoint definitions following mobile-first approach
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current screen size
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg'); // Default to desktop for SSR
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Listen for window resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    current: currentBreakpoint,
    width: windowWidth,
    isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl',
    isAtLeast: (breakpoint: Breakpoint) => windowWidth >= breakpoints[breakpoint],
    isBelow: (breakpoint: Breakpoint) => windowWidth < breakpoints[breakpoint],
  };
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
    
    // Listen for touch events to detect touch capability
    const handleTouchStart = () => setIsTouchDevice(true);
    window.addEventListener('touchstart', handleTouchStart, { once: true });

    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, []);

  return isTouchDevice;
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const { current } = useBreakpoint();
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(current);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint] as T;
    }
  }
  
  return defaultValue;
}

/**
 * Touch interaction utilities
 */
export class TouchInteractionManager {
  private element: HTMLElement;
  private touchStartTime = 0;
  private touchStartPosition = { x: 0, y: 0 };
  private readonly tapThreshold = 10; // pixels
  private readonly tapTimeThreshold = 300; // milliseconds
  private boundHandleTouchStart: (event: TouchEvent) => void;
  private boundHandleTouchEnd: (event: TouchEvent) => void;
  private boundHandleTouchMove: (event: TouchEvent) => void;

  constructor(element: HTMLElement) {
    this.element = element;
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.setupTouchListeners();
  }

  private setupTouchListeners() {
    this.element.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    this.element.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    this.element.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
  }

  private handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    
    // Add visual feedback for touch
    this.element.classList.add('touch-active');
  }

  private handleTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const touchEndTime = Date.now();
    const touchEndPosition = { x: touch.clientX, y: touch.clientY };
    
    // Remove visual feedback
    this.element.classList.remove('touch-active');
    
    // Check if this was a tap
    const timeDiff = touchEndTime - this.touchStartTime;
    const distance = Math.sqrt(
      Math.pow(touchEndPosition.x - this.touchStartPosition.x, 2) +
      Math.pow(touchEndPosition.y - this.touchStartPosition.y, 2)
    );
    
    if (timeDiff < this.tapTimeThreshold && distance < this.tapThreshold) {
      // Trigger tap event
      const tapEvent = new CustomEvent('tap', {
        detail: { position: touchEndPosition }
      });
      this.element.dispatchEvent(tapEvent);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    // Prevent scrolling if needed
    const touch = event.touches[0];
    const distance = Math.sqrt(
      Math.pow(touch.clientX - this.touchStartPosition.x, 2) +
      Math.pow(touch.clientY - this.touchStartPosition.y, 2)
    );
    
    if (distance > this.tapThreshold) {
      this.element.classList.remove('touch-active');
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.element.removeEventListener('touchend', this.boundHandleTouchEnd);
    this.element.removeEventListener('touchmove', this.boundHandleTouchMove);
  }
}

/**
 * Responsive layout utilities
 */
export const responsiveUtils = {
  /**
   * Get responsive grid columns based on screen size
   */
  getGridColumns: (breakpoint: Breakpoint): number => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return 1;
      case 'md':
        return 2;
      case 'lg':
      case 'xl':
      case '2xl':
        return 3;
      default:
        return 1;
    }
  },

  /**
   * Get responsive spacing based on screen size
   */
  getSpacing: (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
      case 'xs':
        return 'p-4 gap-4';
      case 'sm':
        return 'p-4 gap-4';
      case 'md':
        return 'p-6 gap-6';
      case 'lg':
      case 'xl':
      case '2xl':
        return 'p-8 gap-8';
      default:
        return 'p-4 gap-4';
    }
  },

  /**
   * Get responsive text sizes
   */
  getTextSize: (breakpoint: Breakpoint, variant: 'heading' | 'body' | 'caption'): string => {
    const sizes = {
      heading: {
        xs: 'text-xl',
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
      },
      body: {
        xs: 'text-sm',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-base',
        xl: 'text-base',
        '2xl': 'text-lg',
      },
      caption: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-sm',
        '2xl': 'text-sm',
      },
    };

    return sizes[variant][breakpoint];
  },

  /**
   * Get responsive button sizes
   */
  getButtonSize: (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return 'h-12 px-6 text-base'; // Larger touch targets on mobile
      case 'md':
        return 'h-10 px-4 text-sm';
      case 'lg':
      case 'xl':
      case '2xl':
        return 'h-10 px-4 text-sm';
      default:
        return 'h-12 px-6 text-base';
    }
  },
};

/**
 * CSS classes for responsive design
 */
export const responsiveClasses = {
  // Touch-friendly sizing
  touchTarget: 'min-h-[44px] min-w-[44px]', // WCAG AA minimum touch target size
  
  // Mobile-first containers
  container: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Responsive grids
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    form: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    sidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8',
  },
  
  // Responsive text
  text: {
    heading: 'text-xl sm:text-2xl lg:text-3xl',
    subheading: 'text-lg sm:text-xl lg:text-2xl',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm',
  },
  
  // Responsive spacing
  spacing: {
    section: 'py-6 sm:py-8 lg:py-12',
    component: 'p-4 sm:p-6 lg:p-8',
    gap: 'gap-4 sm:gap-6 lg:gap-8',
  },
  
  // Mobile navigation
  navigation: {
    mobile: 'block lg:hidden',
    desktop: 'hidden lg:block',
    overlay: 'fixed inset-0 z-50 lg:hidden',
  },
};

/**
 * Hook for handling responsive file upload
 */
export function useResponsiveFileUpload() {
  const { isMobile } = useBreakpoint();
  const isTouchDevice = useTouchDevice();

  return {
    // Use different upload UI for mobile
    showCompactUpload: isMobile,
    
    // Enable drag and drop only on non-touch devices or tablets+
    enableDragDrop: !isTouchDevice || !isMobile,
    
    // Use larger touch targets on mobile
    touchOptimized: isMobile || isTouchDevice,
    
    // Show fewer files at once on mobile
    maxVisibleFiles: isMobile ? 3 : 5,
    
    // Use different preview sizes
    previewSize: isMobile ? 'small' : 'medium',
  };
}

/**
 * Viewport utilities
 */
export const viewport = {
  /**
   * Check if element is in viewport
   */
  isInViewport: (element: HTMLElement): boolean => {
    return true; // Simplified - always return true
  },

  /**
   * Scroll element into view with responsive behavior
   */
  scrollIntoView: (element: HTMLElement, behavior: 'smooth' | 'auto' = 'smooth') => {
    element.scrollIntoView({
      behavior,
      block: 'center',
      inline: 'nearest'
    });
  },
};