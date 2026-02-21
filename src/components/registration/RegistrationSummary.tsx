import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Edit, FileText, Loader2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLGAsForState, NIGERIA_STATES } from '@/constants/nigeria-states-lgas';
import {
  GENDER_OPTIONS,
  PRACTICE_TYPE_OPTIONS,
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from '@/constants/registration';
import { useRegistrationSummary, useSubmitApplication } from '@/hooks/use-registration';
import { useToast } from '@/hooks/use-toast';
import type { RegistrationSummary as RegistrationSummaryType } from '@/lib/api/registration';
import { useRegistrationStore } from '@/stores/registration-store';

export function RegistrationSummary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearRegistrationData } = useRegistrationStore();
  const { data: summaryResponse, refetch, isLoading, error } = useRegistrationSummary();
  const submitApplicationMutation = useSubmitApplication();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [summaryData, setSummaryData] = useState<RegistrationSummaryType | null>(null);
  const confirmationCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (summaryResponse?.data) {
      setSummaryData(summaryResponse.data);
    }
  }, [summaryResponse]);

  // Focus confirmation card when it appears
  useEffect(() => {
    if (showConfirmation && confirmationCardRef.current) {
      confirmationCardRef.current.focus();
    }
  }, [showConfirmation]);

  const handleSubmit = async () => {
    try {
      const response = await submitApplicationMutation.mutateAsync();
      toast({
        title: 'Success',
        description: response.message || REGISTRATION_SUCCESS_MESSAGES.APPLICATION_SUBMITTED,
      });
      clearRegistrationData();
      navigate({ to: '/pending-approval' });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.SUBMISSION_FAILED;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStateName = (code: string): string => {
    const state = NIGERIA_STATES.find((s) => s.code === code);
    return state?.name || code;
  };

  const getLGAName = (stateCode: string, lgaCode: string): string => {
    const lgas = getLGAsForState(stateCode);
    const lga = lgas.find((l) => l.code === lgaCode);
    return lga?.name || lgaCode;
  };

  const getGenderLabel = (value: string): string => {
    const option = GENDER_OPTIONS.find((o) => o.value === value);
    return option?.label || value;
  };

  const getPracticeTypeLabel = (value: string): string => {
    const option = PRACTICE_TYPE_OPTIONS.find((o) => o.value === value);
    return option?.label || value;
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {REGISTRATION_ERROR_MESSAGES.SERVER_ERROR}
        </AlertDescription>
      </Alert>
    );
  }

  if (!summaryData) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Check if required data sections exist
  const hasRequiredData = summaryData.personal && summaryData.professional && summaryData.practice;
  
  if (!hasRequiredData) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to load registration summary. Please complete all previous steps.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-gray-900 text-2xl">Review and Submit</h1>
        <p className="mt-2 text-gray-600 text-sm">
          Review all your information before submitting your application
        </p>
      </div>

      <PersonalInfoSection 
        summaryData={summaryData} 
        navigate={navigate}
        formatDate={formatDate}
        getGenderLabel={getGenderLabel}
        getStateName={getStateName}
        getLGAName={getLGAName}
      />
      
      <NINSection summaryData={summaryData} navigate={navigate} />
      
      <ProfessionalInfoSection summaryData={summaryData} navigate={navigate} />
      
      <PracticeInfoSection 
        summaryData={summaryData} 
        navigate={navigate}
        getPracticeTypeLabel={getPracticeTypeLabel}
        getStateName={getStateName}
      />

      <Separator className="my-6" />

      {!showConfirmation ? (
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
            aria-label="Save and exit"
          >
            Save & Exit
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            aria-label="Review and submit application"
          >
            Submit Application
          </Button>
        </div>
      ) : (
        <Card className="border-primary" ref={confirmationCardRef} tabIndex={-1}>
          <CardHeader>
            <CardTitle>Confirm Submission</CardTitle>
            <CardDescription>
              Please confirm that all information is correct before submitting your application.
              Once submitted, your application will be reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={submitApplicationMutation.isPending}
                aria-label="Cancel submission"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitApplicationMutation.isPending}
                aria-label="Confirm and submit application"
              >
                {submitApplicationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  'Confirm & Submit'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PersonalInfoSection({ 
  summaryData, 
  navigate, 
  formatDate, 
  getGenderLabel, 
  getStateName, 
  getLGAName 
}: { 
  summaryData: RegistrationSummaryType; 
  navigate: ReturnType<typeof useNavigate>;
  formatDate: (date: Date | string) => string;
  getGenderLabel: (value: string) => string;
  getStateName: (code: string) => string;
  getLGAName: (stateCode: string, lgaCode: string) => string;
}) {
  if (!summaryData.personal) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/register/step2' })}
          aria-label="Edit personal information"
        >
          <Edit className="mr-2 w-4 h-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <p className="font-medium text-gray-500 text-sm">Full Name</p>
            <p className="text-gray-900">
              {summaryData.personal.firstName}{' '}
              {summaryData.personal.middleName && `${summaryData.personal.middleName} `}
              {summaryData.personal.lastName}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">Date of Birth</p>
            <p className="text-gray-900">{formatDate(summaryData.personal.dateOfBirth)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">Gender</p>
            <p className="text-gray-900">{getGenderLabel(summaryData.personal.gender)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">State</p>
            <p className="text-gray-900">{getStateName(summaryData.personal.state)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">LGA</p>
            <p className="text-gray-900">
              {getLGAName(summaryData.personal.state, summaryData.personal.lga)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NINSection({ summaryData, navigate }: { summaryData: RegistrationSummaryType; navigate: ReturnType<typeof useNavigate> }) {
  if (!summaryData.nin) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            NIN Verification
          </CardTitle>
          <CardDescription>Identity verification status</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/register/step3' })}
          aria-label="Edit NIN verification"
        >
          <Edit className="mr-2 w-4 h-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {summaryData.nin.verifiedAt ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600">Verified</span>
            </>
          ) : (
            <span className="font-medium text-yellow-600">Not Verified</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfessionalInfoSection({ summaryData, navigate }: { summaryData: RegistrationSummaryType; navigate: ReturnType<typeof useNavigate> }) {
  if (!summaryData.professional) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Professional Information
          </CardTitle>
          <CardDescription>Your professional credentials</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/register/step4' })}
          aria-label="Edit professional information"
        >
          <Edit className="mr-2 w-4 h-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <p className="font-medium text-gray-500 text-sm">Bar Number</p>
            <p className="text-gray-900">{summaryData.professional.barNumber}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">Year of Call</p>
            <p className="text-gray-900">{summaryData.professional.yearOfCall}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">Law School</p>
            <p className="text-gray-900">{summaryData.professional.lawSchool}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">University</p>
            <p className="text-gray-900">{summaryData.professional.university}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">LLB Graduation Year</p>
            <p className="text-gray-900">{summaryData.professional.llbYear}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PracticeInfoSection({ 
  summaryData, 
  navigate, 
  getPracticeTypeLabel, 
  getStateName
}: { 
  summaryData: RegistrationSummaryType; 
  navigate: ReturnType<typeof useNavigate>;
  getPracticeTypeLabel: (value: string) => string;
  getStateName: (code: string) => string;
}) {
  if (!summaryData.practice) {
    return null;
  }
  
  const practiceType = summaryData.practice.firmName && summaryData.practice.firmName !== 'Solo Practitioner' ? 'firm' : 'solo';
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Practice Information
          </CardTitle>
          <CardDescription>Your legal practice details</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/register/step5' })}
          aria-label="Edit practice information"
        >
          <Edit className="mr-2 w-4 h-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <p className="font-medium text-gray-500 text-sm">Practice Type</p>
            <p className="text-gray-900">
              {getPracticeTypeLabel(practiceType)}
            </p>
          </div>
          {practiceType === 'firm' && summaryData.practice.firmName && (
            <div>
              <p className="font-medium text-gray-500 text-sm">Firm Name</p>
              <p className="text-gray-900">{summaryData.practice.firmName}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="font-medium text-gray-500 text-sm">States of Practice</p>
            <p className="text-gray-900">
              {summaryData.practice.statesOfPractice.map(getStateName).join(', ')}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="font-medium text-gray-500 text-sm">Office Address</p>
            <p className="text-gray-900">
              {summaryData.practice.officeStreet}
              <br />
              {summaryData.practice.officeCity}, {getStateName(summaryData.practice.officeState)} {summaryData.practice.officePostalCode}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


