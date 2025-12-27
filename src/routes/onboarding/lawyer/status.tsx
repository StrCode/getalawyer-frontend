// ============================================
// Status Page - Confirmation and status tracking
// onboarding/lawyer/status.tsx
// ============================================

import { 
  ArrowLeft02Icon, 
  HomeIcon,
  Tick01Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ApplicationStatusTracker } from "@/components/onboarding/application-status-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { 
  type ApplicationStatus,
  useEnhancedOnboardingStore 
} from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer/status")({
  component: LawyerStatusPage,
});

interface StatusPageHeaderProps {
  status: ApplicationStatus;
  referenceNumber?: string;
  submissionDate?: Date;
}

function StatusPageHeader({ status, referenceNumber, submissionDate }: StatusPageHeaderProps) {
  const getHeaderContent = () => {
    switch (status) {
      case 'submitted':
        return {
          title: "Application Submitted Successfully! 🎉",
          description: "Thank you for submitting your lawyer application. We've received all your information and will begin the review process shortly. Please wait for our team to review your credentials.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800"
        };
      case 'under_review':
        return {
          title: "Application Under Review 📋",
          description: "Our team is currently reviewing your application and verifying your credentials. This process typically takes 2-3 business days. We'll notify you via email once the review is complete.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800"
        };
      case 'approved':
        return {
          title: "Congratulations! Application Approved ✅",
          description: "Your lawyer application has been approved. Welcome to our platform! You can now start receiving client requests.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800"
        };
      case 'rejected':
        return {
          title: "Application Needs Revision 📝",
          description: "Your application requires some updates before it can be approved. Please review the feedback and resubmit.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800"
        };
      default:
        return {
          title: "Application Status",
          description: "Track your lawyer application progress",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800"
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <Card className={cn("border-2", headerContent.borderColor, headerContent.bgColor)}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h1 className={cn("text-2xl font-bold", headerContent.textColor)}>
            {headerContent.title}
          </h1>
          <p className={cn("text-lg max-w-2xl mx-auto", headerContent.textColor)}>
            {headerContent.description}
          </p>
          
          {/* Reference Number and Date */}
          {(referenceNumber || submissionDate) && (
            <div className="flex items-center justify-center gap-6 mt-6">
              {referenceNumber && (
                <div className="text-center">
                  <p className={cn("text-sm font-medium", headerContent.textColor)}>
                    Reference Number
                  </p>
                  <p className={cn("text-xl font-mono font-bold", headerContent.textColor)}>
                    {referenceNumber}
                  </p>
                </div>
              )}
              {submissionDate && (
                <div className="text-center">
                  <p className={cn("text-sm font-medium", headerContent.textColor)}>
                    Submitted On
                  </p>
                  <p className={cn("text-lg font-semibold", headerContent.textColor)}>
                    {new Date(submissionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface NextStepsCardProps {
  status: ApplicationStatus;
}

function NextStepsCard({ status }: NextStepsCardProps) {
  const getNextSteps = () => {
    switch (status) {
      case 'submitted':
        return {
          title: "What happens next?",
          steps: [
            "Our team will review your application within 2-3 business days",
            "You'll receive an email notification once the review is complete",
            "If approved, you'll get access to your lawyer dashboard",
            "If revisions are needed, we'll provide specific feedback"
          ]
        };
      case 'under_review':
        return {
          title: "Review in progress",
          steps: [
            "Our team is carefully reviewing your credentials and information",
            "This process typically takes 1-2 more business days",
            "You'll receive an email notification with the decision",
            "No action is required from you at this time"
          ]
        };
      case 'approved':
        return {
          title: "Welcome to the platform!",
          steps: [
            "Set up your lawyer profile and availability",
            "Review and accept client requests",
            "Manage your cases through the dashboard",
            "Get paid securely through our platform"
          ]
        };
      case 'rejected':
        return {
          title: "How to resubmit",
          steps: [
            "Review the feedback provided by our team",
            "Update your application with the required changes",
            "Resubmit your application for another review",
            "We'll prioritize your resubmission for faster processing"
          ]
        };
      default:
        return {
          title: "Application guidance",
          steps: [
            "Complete all required sections of your application",
            "Upload all necessary documents",
            "Review your information carefully before submitting",
            "Submit your application for review"
          ]
        };
    }
  };

  const nextSteps = getNextSteps();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{nextSteps.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {nextSteps.steps.map((step, index) => (
            <li key={`next-step-${step.slice(0, 20)}-${index}`} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 flex-1">{step}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function LawyerStatusPage() {
  const router = useRouter();
  
  // Enhanced store state
  const {
    applicationStatus,
    submissionDate,
    referenceNumber,
    setCurrentStep
  } = useEnhancedOnboardingStore();

  // Set current step on mount
  useEffect(() => {
    setCurrentStep('submitted');
  }, [setCurrentStep]);

  // Handle status changes from the tracker
  const handleStatusChange = (newStatus: ApplicationStatus) => {
    // Show appropriate notifications or actions based on status change
    if (newStatus === 'approved') {
      toastManager.add({
        title: "🎉 Application Approved!",
        description: "Congratulations! You can now access your lawyer dashboard.",
        type: "success",
      });
    } else if (newStatus === 'rejected') {
      toastManager.add({
        title: "Application Needs Revision",
        description: "Please review the feedback and resubmit your application.",
        type: "error",
      });
    }
  };

  // Navigation handlers
  const handleBackToApplication = () => {
    router.navigate({ to: "/onboarding/lawyer/review" });
  };

  const handleGoToDashboard = () => {
    // In a real app, this would navigate to the lawyer dashboard
    toastManager.add({
      title: "Dashboard access",
      description: "Lawyer dashboard will be available here",
      type: "info",
    });
  };

  const handleGoHome = () => {
    router.navigate({ to: "/" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header with status-specific messaging */}
        <StatusPageHeader 
          status={applicationStatus}
          referenceNumber={referenceNumber}
          submissionDate={submissionDate}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status Tracker */}
          <div className="lg:col-span-2">
            <ApplicationStatusTracker
              variant="default"
              showActions={true}
              onStatusChange={handleStatusChange}
              className="mb-6"
            />
            
            {/* Additional Information for Specific Statuses */}
            {applicationStatus === 'submitted' && (
              <Alert className="border-blue-200 bg-blue-50">
                <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">
                      Your application is now in our review queue
                    </p>
                    <p className="text-sm text-blue-700">
                      We'll send you email updates at each stage of the review process. 
                      You can also check this page anytime for real-time status updates.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {applicationStatus === 'approved' && (
              <Alert className="border-green-200 bg-green-50">
                <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium text-green-900">
                      Welcome to our lawyer network!
                    </p>
                    <p className="text-sm text-green-700">
                      Your profile is now active and you can start receiving client requests. 
                      Set up your availability and practice preferences in your dashboard.
                    </p>
                    <Button
                      onClick={handleGoToDashboard}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Next Steps */}
          <div className="space-y-6">
            <NextStepsCard status={applicationStatus} />

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Contact our support team if you have questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-muted-foreground">support@getalawyer.com</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Application submitted on {submissionDate ? new Date(submissionDate).toLocaleDateString() : 'Unknown date'}
          </div>
          
          <div className="flex items-center gap-3">
            {applicationStatus !== 'approved' && (
              <Button
                variant="outline"
                onClick={handleBackToApplication}
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4 mr-2" />
                Back to Application
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleGoHome}
            >
              <HugeiconsIcon icon={HomeIcon} className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
