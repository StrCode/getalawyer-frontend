// ============================================
// Step 4: Review - Read-only review page showing submitted application
// onboarding/lawyer/review.tsx
// ============================================

import { 
  AlertCircleIcon, 
  ArrowLeft02Icon, 
  ArrowRight01Icon, 
  BriefcaseIcon,
  FileIcon,
  Tick01Icon, 
  UserIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer/review")({
  component: LawyerReviewStep,
});

interface ReviewSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isValid: boolean;
  children: React.ReactNode;
  className?: string;
}

function ReviewSection({ 
  title, 
  icon: Icon, 
  isValid, 
  children, 
  className 
}: ReviewSectionProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isValid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}>
              <HugeiconsIcon icon={Icon} className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {isValid ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                    <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function LawyerReviewStep() {
  const router = useRouter();
  
  // Hydration state (prevent hydration mismatch)
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Enhanced store state and actions
  const {
    currentStep,
    completedSteps,
    practiceInfo,
    documents,
    specializations,
    validateStep,
    setCurrentStep,
    applicationStatus,
    submissionDate,
    referenceNumber
  } = useEnhancedOnboardingStore();

  // Set current step on mount
  useEffect(() => {
    setCurrentStep('review');
  }, [setCurrentStep]);

  // Initialize hydration state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch specializations data for display names
  const { data: specializationsData } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => api.specialization.getAll(),
  });

  // Validate all previous steps
  const practiceInfoValidation = validateStep('practice_info');
  const documentsValidation = validateStep('documents');
  const specializationsValidation = validateStep('specializations');

  const allStepsValid = practiceInfoValidation.isValid && 
                       documentsValidation.isValid && 
                       specializationsValidation.isValid;

  // Get specialization names
  const getSpecializationName = (id: string) => {
    const spec = specializationsData?.specializations.find(s => s.id === id);
    return spec?.name || `Specialization ${id}`;
  };

  // Handle navigation to status page
  const handleViewStatus = () => {
    router.navigate({ to: "/onboarding/lawyer/status" });
  };

  // Handle back navigation (only if not submitted)
  const handleBack = () => {
    if (applicationStatus !== 'submitted') {
      router.navigate({ to: "/onboarding/lawyer/specializations" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 4 of 4</span>
              <span className="text-sm text-gray-500">Review & Submit</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-full"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Review
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {applicationStatus === 'submitted' 
                ? "Your application has been submitted successfully. Here's a summary of your submitted information."
                : "Review your application information. Your application was submitted from the specializations step."
              }
            </p>
          </div>

          {/* Application Status Alert */}
          {applicationStatus === 'submitted' && (
            <Alert className="border-green-200 bg-green-50 mb-6">
              <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium text-green-800 mb-2">
                  Application Submitted Successfully
                </div>
                <div className="text-sm text-green-700">
                  {submissionDate && (
                    <p>Submitted on: {submissionDate.toLocaleDateString()}</p>
                  )}
                  {referenceNumber && (
                    <p>Reference Number: {referenceNumber}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Review Sections */}
          <div className="space-y-6">
            {/* Basic Information Section */}
            <ReviewSection
              title="Basic Information"
              icon={UserIcon}
              isValid={practiceInfoValidation.isValid}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Full Name</div>
                  <p className="text-gray-900">
                    {practiceInfo.firstName} {practiceInfo.middleName} {practiceInfo.lastName}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <p className="text-gray-900">{practiceInfo.email}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Phone Number</div>
                  <p className="text-gray-900">{practiceInfo.phoneNumber}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Location</div>
                  <p className="text-gray-900">
                    {practiceInfo.city && `${practiceInfo.city}, `}
                    {practiceInfo.state && `${practiceInfo.state}, `}
                    {practiceInfo.country}
                  </p>
                </div>
              </div>
            </ReviewSection>

            {/* Documents Section */}
            <ReviewSection
              title="Professional Documents"
              icon={FileIcon}
              isValid={documentsValidation.isValid}
            >
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HugeiconsIcon icon={FileIcon} className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.originalName}</p>
                        <p className="text-sm text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                      </div>
                      <Badge 
                        variant={doc.uploadStatus === 'completed' ? 'default' : 'secondary'}
                        className={doc.uploadStatus === 'completed' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {doc.uploadStatus === 'completed' ? 'Uploaded' : doc.uploadStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents uploaded</p>
              )}
            </ReviewSection>

            {/* Specializations Section */}
            <ReviewSection
              title="Practice Areas & Experience"
              icon={BriefcaseIcon}
              isValid={specializationsValidation.isValid}
            >
              {specializations.length > 0 ? (
                <div className="space-y-3">
                  {specializations.map((spec) => (
                    <div key={spec.specializationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getSpecializationName(spec.specializationId)}
                        </p>
                        {spec.description && (
                          <p className="text-sm text-gray-500">{spec.description}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {spec.yearsOfExperience} {spec.yearsOfExperience === 1 ? 'year' : 'years'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No specializations selected</p>
              )}
            </ReviewSection>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {applicationStatus !== 'submitted' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-32"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleViewStatus}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              View Application Status
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Information Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Application Status:
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Your application was submitted from the specializations step</li>
                  <li>• This page shows a read-only summary of your submitted information</li>
                  <li>• Check the status page for updates on your application review</li>
                  <li>• You'll receive email notifications about any status changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar with Progress Tracker */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProgressTracker
              currentStep={currentStep}
              completedSteps={completedSteps}
              variant="compact"
              className="mb-6"
            />
            
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Summary</CardTitle>
                <CardDescription>
                  {applicationStatus === 'submitted' 
                    ? "Your submitted application" 
                    : "Review your information"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Basic Information</span>
                  {practiceInfoValidation.isValid ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-600" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  {documentsValidation.isValid ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-600" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Specializations</span>
                  {specializationsValidation.isValid ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-600" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm">Application Status</span>
                  <Badge className={
                    applicationStatus === 'submitted' 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  }>
                    <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 mr-1" />
                    {applicationStatus === 'submitted' ? 'Submitted' : 'Ready'}
                  </Badge>
                </div>
                
                {applicationStatus === 'submitted' && referenceNumber && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">Reference Number</div>
                    <div className="text-sm font-mono font-medium">{referenceNumber}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
