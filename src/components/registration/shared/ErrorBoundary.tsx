import { AlertTriangle } from 'lucide-react';
import React, { Component, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors
 * Displays fallback UI when errors occur in child components
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex justify-center items-center p-4 min-h-screen">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  An unexpected error occurred. Please try refreshing the page or contact support if
                  the problem persists.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 text-xs">
                    <summary className="font-medium cursor-pointer">Error details</summary>
                    <pre className="bg-gray-100 mt-2 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
                <div className="flex gap-2">
                  <Button onClick={this.handleReset} variant="outline" size="sm">
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="default"
                    size="sm"
                  >
                    Refresh Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
