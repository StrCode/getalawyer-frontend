import { useEffect } from 'react';
import { OnboardingSyncProvider } from '../components/onboarding/onboarding-sync-provider';
import { useOnboardingNavigation, useOnboardingRouteGuard } from '../hooks/use-onboarding-navigation';

/**
 * Example of how to integrate onboarding sync in the app root
 */
export function AppWithOnboardingSync({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingSyncProvider enableAutoSync={true}>
      {children}
    </OnboardingSyncProvider>
  );
}

/**
 * Example of how to use onboarding navigation in a route component
 */
export function OnboardingBasicsRoute() {
  const { 
    isInitialized, 
    isLoading, 
    currentStep, 
    navigateToNextStep,
    refreshStatus 
  } = useOnboardingNavigation();
  
  const { isAuthorized, isChecking } = useOnboardingRouteGuard('practice_info');

  // Show loading state while initializing
  if (!isInitialized || isChecking) {
    return <div>Loading onboarding status...</div>;
  }

  // Show unauthorized state if user can't access this step
  if (!isAuthorized) {
    return <div>You cannot access this step yet. Please complete previous steps.</div>;
  }

  return (
    <div>
      <h1>Basic Information</h1>
      <p>Current step: {currentStep}</p>
      
      {/* Your form components here */}
      
      <div>
        <button 
          type="button"
          onClick={refreshStatus}
          disabled={isLoading}
        >
          {isLoading ? 'Syncing...' : 'Refresh Status'}
        </button>
        
        <button 
          type="button"
          onClick={navigateToNextStep}
          disabled={isLoading}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

/**
 * Example of how to use onboarding progress tracking
 */
export function OnboardingProgressExample() {
  const { 
    currentStep, 
    completedSteps, 
    progressPercentage, 
    estimatedTimeRemaining,
    applicationStatus 
  } = useOnboardingNavigation();

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Onboarding Progress</h3>
      
      <div>
        <strong>Current Step:</strong> {currentStep}
      </div>
      
      <div>
        <strong>Progress:</strong> {Math.round(progressPercentage)}%
      </div>
      
      <div>
        <strong>Estimated Time Remaining:</strong> {estimatedTimeRemaining} minutes
      </div>
      
      <div>
        <strong>Application Status:</strong> {applicationStatus}
      </div>
      
      <div>
        <strong>Completed Steps:</strong> {completedSteps.join(', ') || 'None'}
      </div>
      
      {/* Progress bar */}
      <div style={{ 
        width: '100%', 
        height: '8px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '4px',
        marginTop: '8px'
      }}>
        <div style={{
          width: `${progressPercentage}%`,
          height: '100%',
          backgroundColor: '#007bff',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

/**
 * Example of how to handle status changes
 */
export function OnboardingStatusHandler() {
  useEffect(() => {
    const handleStatusChange = (event: CustomEvent) => {
      const { newStatus, previousStatus } = event.detail;
      
      // Show notification or handle status change
      console.log(`Status changed from ${previousStatus} to ${newStatus}`);
      
      // Example: Show success message when approved
      if (newStatus === 'approved') {
        alert('Congratulations! Your application has been approved.');
      }
      
      // Example: Show rejection message with instructions
      if (newStatus === 'rejected') {
        alert('Your application was rejected. Please review and resubmit.');
      }
    };

    window.addEventListener('onboardingStatusChanged', handleStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('onboardingStatusChanged', handleStatusChange as EventListener);
    };
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Example of how to integrate everything in a route layout
 */
export function OnboardingLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Status change handler */}
      <OnboardingStatusHandler />
      
      {/* Progress display */}
      <OnboardingProgressExample />
      
      {/* Main content */}
      <main style={{ marginTop: '16px' }}>
        {children}
      </main>
    </div>
  );
}