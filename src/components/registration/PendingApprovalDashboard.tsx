import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CheckCircle2, Clock, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { registrationAPI } from '@/lib/api/registration';

/**
 * Pending Approval Dashboard Component
 * 
 * Displays the status of a submitted lawyer registration application
 * that is awaiting administrative review and approval.
 * 
 * Features:
 * - Application submitted confirmation message
 * - Current application status display
 * - Contact support options (email and phone)
 * - Loading state while fetching status
 * - Error handling for failed status checks
 * 
 * Requirements:
 * - 7.12: Redirect to pending approval dashboard after submission
 * - 9.3: Display pending approval status for submitted applications
 */
export function PendingApprovalDashboard() {
  // Fetch registration status to confirm submission
  const { data: statusData, isLoading, error } = useQuery({
    queryKey: ['registration', 'status'],
    queryFn: () => registrationAPI.getRegistrationStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds to check for status updates
  });

  if (isLoading) {
    return <PendingApprovalSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto px-4 py-8 max-w-3xl container">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Status</AlertTitle>
          <AlertDescription>
            Unable to load your application status. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const registrationStatus = statusData?.registration_status;

  return (
    <div className="mx-auto px-4 py-8 max-w-3xl container">
      {/* Success Message */}
      <div className="mb-8 text-center">
        <div className="inline-flex justify-center items-center bg-green-100 mb-4 rounded-full w-16 h-16">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="mb-2 font-bold text-gray-900 text-3xl">
          Application Submitted Successfully!
        </h1>
        <p className="text-gray-600 text-lg">
          Thank you for completing your lawyer registration application.
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Application Status
          </CardTitle>
          <CardDescription>
            Your application is currently under review by our administrative team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 border border-blue-200 rounded-lg">
              <div>
                <p className="font-semibold text-blue-900">Current Status</p>
                <p className="text-blue-700 text-sm">
                  {registrationStatus === 'submitted' 
                    ? 'Pending Administrative Review' 
                    : registrationStatus === 'approved'
                    ? 'Approved - Redirecting...'
                    : 'Under Review'}
                </p>
              </div>
              <div className="bg-blue-600 px-4 py-2 rounded-full font-medium text-white text-sm">
                {registrationStatus === 'submitted' ? 'Pending' : registrationStatus}
              </div>
            </div>

            <div className="space-y-2 text-gray-600 text-sm">
              <p>
                <strong>What happens next?</strong>
              </p>
              <ul className="space-y-1 ml-2 list-disc list-inside">
                <li>Our team will review your submitted documents and information</li>
                <li>We may contact you if additional information is needed</li>
                <li>You will receive an email notification once your application is reviewed</li>
                <li>The review process typically takes 3-5 business days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support Card */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            If you have questions about your application, our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <a 
                  href="mailto:support@getalawyer.ng" 
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  support@getalawyer.ng
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <a 
                  href="tel:+2348012345678" 
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  +234 801 234 5678
                </a>
                <p className="mt-1 text-gray-500 text-xs">
                  Monday - Friday, 9:00 AM - 5:00 PM WAT
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton for the pending approval dashboard
 */
function PendingApprovalSkeleton() {
  return (
    <div className="mx-auto px-4 py-8 max-w-3xl container">
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-4 rounded-full w-16 h-16" />
        <Skeleton className="mx-auto mb-2 w-96 h-9" />
        <Skeleton className="mx-auto w-80 h-6" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="mb-2 w-48 h-6" />
          <Skeleton className="w-full h-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 w-full h-24" />
          <Skeleton className="w-full h-32" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="mb-2 w-32 h-6" />
          <Skeleton className="w-full h-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
