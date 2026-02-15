// ============================================
// Review - Application Review Page
// onboarding/lawyer/review.tsx
// ============================================

import { 
  AlertCircleIcon, 
  ArrowRight01Icon, 
  CheckmarkCircle01Icon, 
  ImageIcon,
  Tick01Icon, 
  UserIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(protected)/onboarding/(lawyer)/review")({
  component: LawyerReviewStep,
});

interface ReviewSectionProps {
  title: string;
  icon: any;
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex justify-center items-center rounded-lg w-10 h-10",
              isValid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}>
              <HugeiconsIcon icon={Icon} className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {isValid ? (
                  <Badge variant="default" className="bg-green-100 border-green-200 text-green-700">
                    <HugeiconsIcon icon={Tick01Icon} className="mr-1 w-3 h-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <HugeiconsIcon icon={AlertCircleIcon} className="mr-1 w-3 h-3" />
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
  
  // Mock data for review (will be replaced with database data later)
  const mockSubmittedData = {
    basicInfo: {
      firstName: 'Chioma',
      middleName: 'Eze',
      lastName: 'Okafor',
      email: 'chioma.okafor@email.com',
      phoneNumber: '+234 801 234 5678',
      country: 'Nigeria',
      state: 'Lagos',
    },
    credentials: {
      barNumber: 'NBA/2023/12345',
      nin: '12345678901',
      ninVerified: true,
      ninVerificationData: {
        fullName: 'Chioma Eze Okafor',
        dateOfBirth: '1990-05-15',
        gender: 'Female',
      },
      photographUrl: 'https://via.placeholder.com/200',
    },
    submissionDate: new Date().toISOString(),
  };

  // State to hold submitted application data
  const [submittedData] = useState(mockSubmittedData);

  // Use submitted data for display
  const displayBasicInfo = submittedData.basicInfo;
  const displayCredentials = submittedData.credentials;

  // Validate submitted data
  const basicInfoValid = !!(
    displayBasicInfo.firstName?.trim() &&
    displayBasicInfo.lastName?.trim() &&
    displayBasicInfo.email?.trim() &&
    displayBasicInfo.phoneNumber?.trim() &&
    displayBasicInfo.country?.trim()
  );
  
  const credentialsValid = !!(
    displayCredentials.barNumber?.trim() &&
    displayCredentials.nin?.trim() &&
    displayCredentials.ninVerified &&
    displayCredentials.photographUrl
  );

  // Handle navigation to status page
  const handleViewStatus = () => {
    router.navigate({ to: "/onboarding/status" });
  };

  return (
    <div className="mx-auto p-6 max-w-4xl">
      <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 text-sm">Step 3 of 3</span>
              <span className="text-gray-500 text-sm">Review & Submit</span>
            </div>
            <div className="bg-gray-200 rounded-full w-full h-2">
              <div className="bg-blue-500 rounded-full w-full h-2 transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 font-bold text-gray-900 text-2xl">
              Application Review
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-sm">
              Here's a summary of your submitted information.
            </p>
          </div>

          {/* Application Status Alert */}
          <Alert className="bg-green-50 mb-6 border-green-200">
            <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />
            <AlertDescription>
              <div className="mb-2 font-medium text-green-800">
                Application Submitted Successfully
              </div>
              <div className="text-green-700 text-sm">
                <p>Submitted on: {new Date().toLocaleDateString()}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Review Sections */}
          <div className="space-y-6">
            {/* Basic Information Section */}
            <ReviewSection
              title="Basic Information"
              icon={UserIcon}
              isValid={basicInfoValid}
            >
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <div className="font-medium text-gray-500 text-sm">Full Name</div>
                  <p className="text-gray-900">
                    {displayBasicInfo.firstName} {displayBasicInfo.middleName} {displayBasicInfo.lastName}
                  </p>
                </div>
                <div>
                  <div className="font-medium text-gray-500 text-sm">Email</div>
                  <p className="text-gray-900">{displayBasicInfo.email}</p>
                </div>
                <div>
                  <div className="font-medium text-gray-500 text-sm">Phone Number</div>
                  <p className="text-gray-900">{displayBasicInfo.phoneNumber}</p>
                </div>
                <div>
                  <div className="font-medium text-gray-500 text-sm">Location</div>
                  <p className="text-gray-900">
                    {displayBasicInfo.state && `${displayBasicInfo.state}, `}
                    {displayBasicInfo.country}
                  </p>
                </div>
              </div>
            </ReviewSection>

            {/* Credentials Section */}
            <ReviewSection
              title="Professional Credentials"
              icon={CheckmarkCircle01Icon}
              isValid={credentialsValid}
            >
              <div className="space-y-4">
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <div className="font-medium text-gray-500 text-sm">Bar Number</div>
                    <p className="text-gray-900">{displayCredentials.barNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500 text-sm">NIN</div>
                    <p className="text-gray-900">{displayCredentials.nin || 'Not provided'}</p>
                  </div>
                </div>
                
                {displayCredentials.ninVerificationData && (
                  <div className="bg-green-50 p-3 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon icon={Tick01Icon} className="mt-0.5 w-4 h-4 text-green-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 text-sm">NIN Verified</p>
                        <div className="space-y-1 mt-2 text-green-700 text-xs">
                          <p><strong>Name:</strong> {displayCredentials.ninVerificationData.fullName}</p>
                          <p><strong>DOB:</strong> {displayCredentials.ninVerificationData.dateOfBirth}</p>
                          {displayCredentials.ninVerificationData.gender && (
                            <p><strong>Gender:</strong> {displayCredentials.ninVerificationData.gender}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {displayCredentials.photographUrl && (
                  <div>
                    <div className="mb-2 font-medium text-gray-500 text-sm">Photograph</div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-center items-center bg-blue-100 rounded-lg w-10 h-10">
                        <HugeiconsIcon icon={ImageIcon} className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Professional Photograph</p>
                        <p className="text-gray-500 text-xs">Uploaded and verified</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <HugeiconsIcon icon={Tick01Icon} className="mr-1 w-3 h-3" />
                        Uploaded
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </ReviewSection>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              onClick={handleViewStatus}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition transform"
            >
              View Application Status
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 mt-6 p-4 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div>
                <p className="font-medium text-blue-900 text-sm">
                  What happens next?
                </p>
                <ul className="space-y-1 mt-1 text-blue-700 text-xs">
                  <li>• Your application will be reviewed by our admin team</li>
                  <li>• We'll verify your credentials and NIN information</li>
                  <li>• You'll receive an email notification once your profile is approved</li>
                  <li>• Approval typically takes 1-3 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar with Summary */}
        <div className="lg:col-span-1">
          <div className="top-6 sticky">
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Summary</CardTitle>
                <CardDescription>
                  Your submitted application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Basic Information</span>
                  {basicInfoValid ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-600" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Credentials</span>
                  {credentialsValid ? (
                    <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-600" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center font-medium">
                  <span className="text-sm">Application Status</span>
                  <Badge className="bg-green-100 text-green-700">
                    <HugeiconsIcon icon={Tick01Icon} className="mr-1 w-3 h-3" />
                    Submitted
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
