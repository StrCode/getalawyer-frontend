import { AlertCircleIcon, ArrowRight01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhotoUploader } from "@/components/onboarding/photo-uploader";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { getUserFriendlyErrorMessage, type NINVerificationData, verifyNIN } from "@/services/nin-verification";
import { getUploadErrorMessage, isRetryableUploadError, uploadPhoto } from "@/services/photo-upload";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/onboarding/lawyer/credentials")({
  component: LawyerCredentialsStep,
  beforeLoad: () => {
    // Check if user can access credentials step
    const store = useEnhancedOnboardingStore.getState();
    
    // If basic_info is not completed, redirect to basics
    if (!store.completedSteps.includes('basic_info')) {
      throw redirect({
        to: '/onboarding/lawyer/basics',
      });
    }
  },
});

function LawyerCredentialsStep() {
  const router = useRouter();
  
  // Enhanced onboarding store
  const {
    currentStep,
    completedSteps,
    credentials,
    updateCredentials,
    markStepCompleted,
    setCurrentStep,
    canAccessStep,
  } = useEnhancedOnboardingStore();
  
  // Local form state
  const [formData, setFormData] = useState({
    barNumber: "",
    nin: "",
    ninVerified: false,
    ninVerificationData: undefined as NINVerificationData | undefined,
    photograph: undefined as File | undefined,
    photographUrl: "",
  });
  
  // NIN verification state
  const [isVerifyingNIN, setIsVerifyingNIN] = useState(false);
  const [ninVerificationError, setNinVerificationError] = useState<string>("");
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Photo upload state
  const [photoError, setPhotoError] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update store
    updateCredentials({ [field]: value });
    
    // Clear errors for this field and show positive feedback
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear NIN verification when NIN changes
    if (field === 'nin') {
      setFormData(prev => ({
        ...prev,
        ninVerified: false,
        ninVerificationData: undefined,
      }));
      updateCredentials({
        ninVerified: false,
        ninVerificationData: undefined,
      });
      setNinVerificationError("");
    }
  };

  const handleVerifyNIN = async () => {
    // Validate NIN format first
    const nin = formData.nin.trim();
    
    if (!nin) {
      setNinVerificationError("Please enter your NIN");
      return;
    }
    
    if (nin.length !== 11 || !/^\d{11}$/.test(nin)) {
      setNinVerificationError("NIN must be exactly 11 digits");
      return;
    }
    
    setIsVerifyingNIN(true);
    setNinVerificationError("");
    
    try {
      const response = await verifyNIN(nin);
      
      if (response.success && response.data) {
        // Verification successful
        setFormData(prev => ({
          ...prev,
          ninVerified: true,
          ninVerificationData: response.data,
        }));
        
        updateCredentials({
          ninVerified: true,
          ninVerificationData: response.data,
        });
        
        toastManager.add({
          title: "NIN Verified Successfully",
          description: `Verified: ${response.data.fullName}`,
          type: "success",
        });
      } else {
        // Verification failed
        setNinVerificationError(response.error || "Verification failed");
        toastManager.add({
          title: "Verification Failed",
          description: response.error || "Unable to verify NIN",
          type: "error",
        });
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      setNinVerificationError(errorMessage);
      
      toastManager.add({
        title: "Verification Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsVerifyingNIN(false);
    }
  };

  const handlePhotoSelect = async (file: File) => {
    setIsUploadingPhoto(true);
    setPhotoError("");
    setUploadProgress(0);
    
    try {
      // Upload photo with retry logic
      const result = await uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Update form data with uploaded photo URL
      setFormData(prev => ({
        ...prev,
        photograph: file,
        photographUrl: result.url,
      }));
      
      updateCredentials({
        photograph: file,
        photographUrl: result.url,
      });
      
      // Clear photo error from validation errors
      if (errors.photograph) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.photograph;
          return newErrors;
        });
      }
      
      toastManager.add({
        title: "Photo Uploaded",
        description: "Your photograph has been uploaded successfully.",
        type: "success",
      });
    } catch (error) {
      const errorMessage = getUploadErrorMessage(error);
      setPhotoError(errorMessage);
      
      toastManager.add({
        title: "Upload Failed",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handlePhotoRemove = () => {
    setFormData(prev => ({
      ...prev,
      photograph: undefined,
      photographUrl: "",
    }));
    updateCredentials({
      photograph: undefined,
      photographUrl: "",
    });
    setPhotoError("");
  };

  const handlePhotoRetry = async () => {
    // Retry upload with the same file
    if (formData.photograph) {
      await handlePhotoSelect(formData.photograph);
    }
  };

  const validateAndSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Validate Bar Number
    if (!formData.barNumber.trim()) {
      newErrors.barNumber = "Bar Number is required";
    }
    
    // Validate NIN
    if (!formData.nin.trim()) {
      newErrors.nin = "NIN is required";
    } else if (formData.nin.length !== 11 || !/^\d{11}$/.test(formData.nin)) {
      newErrors.nin = "NIN must be exactly 11 digits";
    }
    
    // Validate NIN verification
    if (!formData.ninVerified) {
      newErrors.nin = "NIN must be verified before submission";
    }
    
    // Validate photograph
    if (!formData.photograph && !formData.photographUrl) {
      newErrors.photograph = "Photograph is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toastManager.add({
        title: "Please fix validation errors",
        description: `${Object.keys(newErrors).length} issue(s) need to be resolved.`,
        type: "error",
      });
      return;
    }

    try {
      // Save to store and mark step completed
      updateCredentials(formData);
      markStepCompleted('credentials');
      
      toastManager.add({
        title: "Credentials saved!",
        description: "Your credentials have been verified and saved.",
        type: "success",
      });

      // Navigate to pending approval page
      router.navigate({ to: "/onboarding/lawyer/pending" });
    } catch (error) {
      // Handle submission errors
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit application. Please try again.";
      
      toastManager.add({
        title: "Submission Failed",
        description: errorMessage,
        type: "error",
      });
      
      // Show error in validation summary
      setErrors({
        ...newErrors,
        submission: errorMessage,
      });
    }
  };

  const handleBack = () => {
    router.navigate({ to: "/onboarding/lawyer/basics" });
  };

  // Initialize form from store on mount
  useEffect(() => {
    setCurrentStep('credentials');
    
    // Load data from store if available
    if (credentials.barNumber || credentials.nin) {
      setFormData({
        barNumber: credentials.barNumber || "",
        nin: credentials.nin || "",
        ninVerified: credentials.ninVerified || false,
        ninVerificationData: credentials.ninVerificationData,
        photograph: credentials.photograph,
        photographUrl: credentials.photographUrl || "",
      });
    }
  }, [setCurrentStep, credentials]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 2 of 2</span>
              <span className="text-xs sm:text-sm text-gray-500">Credentials</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-full"></div>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium text-red-800 mb-2">
                  Please fix the following issues:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      {message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Credentials
            </h2>
            <p className="text-gray-600">
              Provide your Bar Number, verify your NIN, and upload your photograph
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Bar Number Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Bar Number</h3>
                <p className="text-sm text-gray-600">
                  Enter your Nigerian Bar Association number
                </p>
              </div>

              <Field>
                <FieldLabel>Bar Number *</FieldLabel>
                <FieldDescription className="text-xs">
                  Your Bar Number will be verified by our admin team
                </FieldDescription>
                <Input
                  value={formData.barNumber}
                  onChange={(e) => handleFieldChange('barNumber', e.target.value)}
                  placeholder="e.g., SCN/12345/2020"
                  className={errors.barNumber ? "border-red-500" : ""}
                />
                {errors.barNumber && <FieldError>{errors.barNumber}</FieldError>}
              </Field>
            </div>

            {/* NIN Verification Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  National Identification Number (NIN)
                </h3>
                <p className="text-sm text-gray-600">
                  Verify your identity with your NIN
                </p>
              </div>

              <Field>
                <FieldLabel>NIN *</FieldLabel>
                <FieldDescription className="text-xs">
                  Enter your 11-digit National Identification Number
                </FieldDescription>
                <div className="flex gap-2">
                  <Input
                    value={formData.nin}
                    onChange={(e) => handleFieldChange('nin', e.target.value)}
                    placeholder="12345678901"
                    maxLength={11}
                    className={errors.nin || ninVerificationError ? "border-red-500" : ""}
                    disabled={formData.ninVerified}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyNIN}
                    disabled={isVerifyingNIN || formData.ninVerified || !formData.nin}
                    className="whitespace-nowrap"
                  >
                    {isVerifyingNIN ? "Verifying..." : formData.ninVerified ? "Verified" : "Verify NIN"}
                  </Button>
                </div>
                {errors.nin && <FieldError>{errors.nin}</FieldError>}
                {ninVerificationError && !errors.nin && (
                  <FieldError>{ninVerificationError}</FieldError>
                )}
              </Field>

              {/* NIN Verification Status */}
              {formData.ninVerified && formData.ninVerificationData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        NIN Verified Successfully
                      </p>
                      <div className="space-y-1 text-xs text-green-700">
                        <p><strong>Full Name:</strong> {formData.ninVerificationData.fullName}</p>
                        <p><strong>Date of Birth:</strong> {formData.ninVerificationData.dateOfBirth}</p>
                        {formData.ninVerificationData.gender && (
                          <p><strong>Gender:</strong> {formData.ninVerificationData.gender}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isVerifyingNIN && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-blue-700">
                      Verifying your NIN with the national database...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Photograph Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Photograph</h3>
                <p className="text-sm text-gray-600">
                  Upload a clear photograph of yourself
                </p>
              </div>

              <Field>
                <FieldLabel>Your Photograph *</FieldLabel>
                <FieldDescription className="text-xs">
                  Upload a professional photograph (JPEG, PNG, or WebP, max 5MB)
                </FieldDescription>
                <PhotoUploader
                  onPhotoSelect={handlePhotoSelect}
                  onPhotoRemove={handlePhotoRemove}
                  currentPhoto={formData.photographUrl || null}
                  error={photoError || errors.photograph}
                  disabled={isUploadingPhoto}
                />
                
                {/* Upload Progress */}
                {isUploadingPhoto && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-blue-700">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Upload Error with Retry */}
                {photoError && !isUploadingPhoto && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 mb-2">
                          Upload Failed
                        </p>
                        <p className="text-xs text-red-700 mb-3">
                          {photoError}
                        </p>
                        {formData.photograph && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handlePhotoRetry}
                            className="text-xs h-8 bg-red-600 hover:bg-red-700"
                          >
                            Retry Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-32"
            >
              ← Back
            </Button>
            <Button
              type="button"
              onClick={validateAndSubmit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Submit Application
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>

          {/* Helper Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  What happens next?
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• Your application will be reviewed by our admin team</li>
                  <li>• We'll verify your Bar Number with the Nigerian Bar Association</li>
                  <li>• You'll receive an email notification once your profile is approved</li>
                  <li>• Approval typically takes 1-3 business days</li>
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
            
            {/* Completion Checklist */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Completion Checklist</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {formData.barNumber ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  )}
                  <span className={formData.barNumber ? "text-green-700" : "text-gray-600"}>
                    Bar Number entered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.ninVerified ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  )}
                  <span className={formData.ninVerified ? "text-green-700" : "text-gray-600"}>
                    NIN verified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.photograph || formData.photographUrl ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  )}
                  <span className={(formData.photograph || formData.photographUrl) ? "text-green-700" : "text-gray-600"}>
                    Photograph uploaded
                  </span>
                </div>
              </div>
              
              {formData.barNumber && formData.ninVerified && (formData.photograph || formData.photographUrl) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Badge className="w-full justify-center bg-green-100 text-green-700 border-green-200">
                    Ready to Submit
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
