import type React from "react";
import { useEffect, useRef } from "react";
import { ErrorBoundary } from "@/components/registration/shared/ErrorBoundary";
import { ProgressIndicator } from "@/components/registration/shared/ProgressIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { logError } from "@/utils/error-handler";

interface RegistrationLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * RegistrationLayout component
 * 
 * Wraps all registration steps with common UI elements including:
 * - Progress bar showing step X of 7
 * - Step indicators with checkmarks for completed steps
 * - Responsive container styling
 * - Error boundary for catching React errors
 * - Focus management for accessibility
 * - Skip link for keyboard navigation
 * 
 * Requirements: 8.1, 8.2, 11.1, 11.2, 12.5, 12.6
 */
export function RegistrationLayout({
  currentStep,
  totalSteps,
  children,
  className,
}: RegistrationLayoutProps) {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLButtonElement>(null);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with context
    logError(error, `RegistrationLayout - Step ${currentStep}`);
    console.error('Error Info:', errorInfo);
  };

  // Focus main content when component mounts
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  const handleSkipToContent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {/* Skip to main content button for keyboard users */}
      <button
        ref={skipLinkRef}
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:top-4 focus:left-4 focus:z-50 focus:absolute focus:bg-primary focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:text-primary-foreground"
        type="button"
      >
        Skip to main content
      </button>

      <div className={cn("bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 min-h-screen", className)}>
        <div className="mx-auto max-w-3xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>

          {/* Main Content Card */}
          <Card className="shadow-lg">
            <CardContent 
              id="main-content"
              ref={mainContentRef}
              tabIndex={-1}
              className="p-6 sm:p-8 lg:p-10 focus:outline-none"
              role="main"
              aria-label={`Registration step ${currentStep} of ${totalSteps}`}
            >
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
