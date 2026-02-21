import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from '@/constants/registration';
import { useConfirmNIN, useVerifyNIN } from '@/hooks/use-registration';
import { useToast } from '@/hooks/use-toast';
import { ninVerificationSchema } from '@/lib/schemas/registration';
import { useRegistrationStore } from '@/stores/registration-store';
import type { NINVerificationFormData, NINVerificationResult } from '@/types/registration';

/**
 * NINVerificationForm Component
 * 
 * Step 3 of the lawyer registration process.
 * Handles NIN verification with consent, displays verification results,
 * and manages confirmation/rejection flow.
 * 
 * Features:
 * - NIN input with validation
 * - NDPR consent checkbox
 * - Loading state during verification
 * - Verification result display (photo, name, DOB, address)
 * - Name mismatch warning
 * - Confirm/reject buttons
 * - Rejection error handling with re-entry
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */
export function NINVerificationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    updateStep3Data,
    setRegistrationStatus,
    setNINVerificationResult,
    ninVerificationResult,
    step2Data,
  } = useRegistrationStore();

  const verifyNINMutation = useVerifyNIN();
  const confirmNINMutation = useConfirmNIN();

  const [verificationResult, setVerificationResult] = useState<NINVerificationResult | null>(
    ninVerificationResult
  );
  const [isVerified, setIsVerified] = useState(!!ninVerificationResult);
  const [showRejectionError, setShowRejectionError] = useState(false);
  const [hasNameMismatch, setHasNameMismatch] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<NINVerificationFormData>({
    resolver: zodResolver(ninVerificationSchema),
    mode: 'onBlur',
    defaultValues: {
      nin: '',
      consent: false,
    },
  });

  const watchedConsent = watch('consent');
  const watchedNIN = watch('nin');

  // Check for name mismatch between Step 2 and NIN data
  const checkNameMismatch = (ninData: NINVerificationResult): boolean => {
    if (!step2Data.firstName || !step2Data.lastName) {
      return false;
    }

    const step2FirstName = step2Data.firstName.toLowerCase().trim();
    const step2LastName = step2Data.lastName.toLowerCase().trim();
    const ninFirstName = ninData.firstName.toLowerCase().trim();
    const ninLastName = ninData.lastName.toLowerCase().trim();

    return step2FirstName !== ninFirstName || step2LastName !== ninLastName;
  };

  const onVerifyNIN = async (data: NINVerificationFormData) => {
    console.log('[NINVerificationForm] onVerifyNIN called with data:', data);
    console.log('[NINVerificationForm] isSubmitting:', isSubmitting);
    console.log('[NINVerificationForm] mutation isPending:', verifyNINMutation.isPending);
    
    // Prevent multiple submissions
    if (verifyNINMutation.isPending) {
      console.log('[NINVerificationForm] Mutation already pending, skipping');
      return;
    }
    
    try {
      // Requirement 3.2: Verify NIN with consent
      updateStep3Data(data);
      setShowRejectionError(false);

      console.log('[NINVerificationForm] Calling mutation...');
      // Requirement 3.3: Display loading indicator
      const response = await verifyNINMutation.mutateAsync({
        nin: data.nin,
        consent: data.consent,
      });
      console.log('[NINVerificationForm] Mutation response:', response);

      // Requirement 3.4: Display verification result
      setVerificationResult(response.data);
      setNINVerificationResult(response.data);
      setIsVerified(true);

      // Requirement 3.5: Check for name mismatch
      const mismatch = checkNameMismatch(response.data);
      setHasNameMismatch(mismatch);

      toast({
        title: 'NIN Verified',
        description: 'Please review the information and confirm it is correct.',
      });
    } catch (error) {
      console.error('[NINVerificationForm] Error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.NIN_VERIFICATION_FAILED;

      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const onConfirmNIN = async () => {
    if (!verificationResult) return;

    try {
      // Requirement 3.6: Confirm NIN with confirmed=true
      const response = await confirmNINMutation.mutateAsync(true);

      // Requirement 3.8: Update registration status
      setRegistrationStatus(response.registration_status);

      toast({
        title: 'Success',
        description: REGISTRATION_SUCCESS_MESSAGES.NIN_VERIFIED,
      });

      // Requirement 3.9: Navigate to Step 4
      navigate({ to: '/register/step4' });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const onRejectNIN = async () => {
    try {
      // Requirement 3.7: Handle rejection with confirmed=false
      await confirmNINMutation.mutateAsync(false);
      
      // Reset form state
      setIsVerified(false);
      setVerificationResult(null);
      setNINVerificationResult(null);
      setShowRejectionError(true);
      setHasNameMismatch(false);
      reset();
    } catch (error) {
      // If rejection fails, still reset the form locally
      setIsVerified(false);
      setVerificationResult(null);
      setNINVerificationResult(null);
      setShowRejectionError(true);
      setHasNameMismatch(false);
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">NIN Verification</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Verify your identity using your National Identification Number
          </p>
        </div>

        {/* Rejection Error Message */}
        {showRejectionError && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              {REGISTRATION_ERROR_MESSAGES.NIN_REJECTED}
            </AlertDescription>
          </Alert>
        )}

        {/* NIN Input Form - Only show if not verified */}
        {!isVerified && (
          <form onSubmit={handleSubmit(onVerifyNIN)} className="space-y-6">
            {/* NIN Field */}
            <div className="space-y-2">
              <Label htmlFor="nin" className="required">
                National Identification Number (NIN)
              </Label>
              <Input
                id="nin"
                type="text"
                placeholder="Enter your 11-digit NIN"
                maxLength={11}
                {...register('nin')}
                aria-invalid={errors.nin ? 'true' : 'false'}
                aria-describedby={errors.nin ? 'nin-error nin-help' : 'nin-help'}
                aria-required="true"
                className={errors.nin ? 'border-red-500' : ''}
              />
              <p id="nin-help" className="text-gray-500 text-xs">
                Your NIN is an 11-digit number on your National ID card
              </p>
              {errors.nin && (
                <p id="nin-error" className="text-red-600 text-sm" role="alert">
                  {errors.nin.message}
                </p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={watchedConsent}
                  onCheckedChange={(checked) => {
                    setValue('consent', checked === true, { shouldValidate: true });
                  }}
                  aria-invalid={errors.consent ? 'true' : 'false'}
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                  aria-required="true"
                  className={errors.consent ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="consent"
                    className="peer-disabled:opacity-70 font-normal text-sm leading-none peer-disabled:cursor-not-allowed"
                  >
                    I consent to the verification of my NIN in accordance with the Nigeria Data
                    Protection Regulation (NDPR) terms
                  </Label>
                  {errors.consent && (
                    <p id="consent-error" className="text-red-600 text-xs" role="alert">
                      {errors.consent.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || verifyNINMutation.isPending || !watchedConsent || !watchedNIN}
                className="w-full"
                aria-label="Verify NIN"
              >
                {(isSubmitting || verifyNINMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />
                    Verifying NIN...
                  </>
                ) : (
                  'Verify NIN'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Verification Result Display */}
        {isVerified && verificationResult && (
          <div className="space-y-6">
            {/* Name Mismatch Warning */}
            {hasNameMismatch && (
              <Alert className="bg-yellow-50 border-yellow-500">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Name Mismatch Detected</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  The name on your NIN does not match the name you provided in Step 2. Please
                  ensure this is your correct NIN or update your personal information.
                </AlertDescription>
              </Alert>
            )}

            {/* Verification Result Card */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-6">
                {/* Photo */}
                <div className="shrink-0">
                  {verificationResult.image ? (
                    <img
                      src={verificationResult.image}
                      alt="NIN verification"
                      className="border border-gray-300 rounded-lg w-32 h-32 object-cover"
                    />
                  ) : (
                    <div className="flex justify-center items-center bg-gray-100 border border-gray-300 rounded-lg w-32 h-32">
                      <span className="text-gray-400 text-sm">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Verification Details</h3>
                    <p className="text-gray-500 text-sm">
                      Please confirm this information belongs to you
                    </p>
                  </div>

                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">Full Name</p>
                      <p className="text-gray-900">
                        {verificationResult.firstName} {verificationResult.middleName}{' '}
                        {verificationResult.lastName}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 text-sm">Date of Birth</p>
                      <p className="text-gray-900">{verificationResult.dateOfBirth}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 text-sm">Gender</p>
                      <p className="text-gray-900 capitalize">{verificationResult.gender}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 text-sm">Phone Number</p>
                      <p className="text-gray-900">{verificationResult.mobile}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-700 text-sm">Address</p>
                      <p className="text-gray-900">
                        {verificationResult.address.addressLine}, {verificationResult.address.town}
                        , {verificationResult.address.lga}, {verificationResult.address.state}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 text-sm">NIN</p>
                      <p className="font-mono text-gray-900">{verificationResult.idNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Prompt */}
            <div className="bg-blue-50 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 text-sm">Confirm Your Identity</h4>
                  <p className="mt-1 text-blue-700 text-sm">
                    Is this information correct and does it belong to you?
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onRejectNIN}
                className="flex-1"
                aria-label="Reject NIN verification"
              >
                No, This is Not Me
              </Button>
              <Button
                type="button"
                onClick={onConfirmNIN}
                disabled={confirmNINMutation.isPending}
                className="flex-1"
                aria-label="Confirm NIN verification and continue"
              >
                {confirmNINMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />
                    Confirming...
                  </>
                ) : (
                  'Yes, Confirm & Continue'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
