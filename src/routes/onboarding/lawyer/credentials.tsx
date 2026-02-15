import { AlertCircleIcon, ArrowRight01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhotoUploader } from "@/components/onboarding/photo-uploader";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { SEOHead } from "@/components/seo/SEOHead";
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
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { getUserFriendlyErrorMessage, type NINVerificationData, verifyNIN } from "@/services/nin-verification";
import { getUploadErrorMessage, isRetryableUploadError, uploadPhoto } from "@/services/photo-upload";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";
import { generateOnboardingPageSEO } from "@/utils/seo";

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
    
    // If application is already submitted or approved, redirect to status page
    if (store.applicationStatus === 'submitted' || store.applicationStatus === 'approved') {
      throw redirect({
        to: '/onboarding/lawyer/status',
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
    basicInfo,
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

  const handlePhotoSelect = (file: File) => {
    // Validate file
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    // Store file locally - will be uploaded on form submission
    setFormData(prev => ({
      ...prev,
      photograph: file,
    }));
    
    updateCredentials({
      photograph: file,
    });
    
    // Clear any previous errors
    setPhotoError("");
    if (errors.photograph) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photograph;
        return newErrors;
      });
    }

    toastManager.add({
      title: "Photo Selected",
      description: "Your photograph has been selected. It will be uploaded when you submit.",
      type: "success",
    });
  };

  const validatePhotoFile = (file: File): string | null => {
    const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image';
    }

    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return `Photo must be under 5MB. Current size: ${sizeMB}MB`;
    }

    return null;
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
    if (!formData.photograph) {
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
      setIsUploadingPhoto(true);
      setUploadProgress(0);
      setPhotoError("");

      // Mock mode - skip actual upload and progress directly
      if (import.meta.env.VITE_USE_MOCK_NIN === 'true') {
        // Simulate upload progress
        await new Promise(resolve => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              resolve(null);
            }
            setUploadProgress(Math.min(progress, 100));
          }, 200);
        });

        // Update form data (mock URL)
        const finalFormData = {
          ...formData,
          photographUrl: "mock://photograph-url",
        };

        // Clear localStorage and form data
        localStorage.clear();
        
        toastManager.add({
          title: "Credentials saved!",
          description: "[MOCK] Your credentials have been verified and saved.",
          type: "success",
        });

        // Navigate to review page
        router.navigate({ to: "/onboarding/lawyer/review" });
        return;
      }

      // Real mode - upload photo during submission
      if (!formData.photograph) {
        throw new Error("Photograph is required");
      }

      const uploadResult = await uploadPhoto(formData.photograph, (progress) => {
        setUploadProgress(progress);
      });

      // Update form data with uploaded photo URL
      const finalFormData = {
        ...formData,
        photographUrl: uploadResult.url,
      };

      // Clear localStorage
      localStorage.clear();
      
      toastManager.add({
        title: "Credentials saved!",
        description: "Your credentials have been verified and saved.",
        type: "success",
      });

      // Navigate to review page
      router.navigate({ to: "/onboarding/lawyer/review" });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? getUploadErrorMessage(error)
        : "Failed to submit application. Please try again.";
      
      setPhotoError(errorMessage);
      
      toastManager.add({
        title: "Submission Failed",
        description: errorMessage,
        type: "error",
      });
      
      // Show error in validation summary
      setErrors({
        photograph: errorMessage,
      });
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
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
    <div className="mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 text-sm">Step 2 of 2</span>
              <span className="text-gray-500 text-xs sm:text-sm">Credentials</span>
            </div>
            <div className="bg-gray-200 rounded-full w-full h-2">
              <div className="bg-blue-500 rounded-full w-full h-2 transition-all duration-300"></div>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert className="bg-red-50 mb-6 border-red-200">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
              <AlertDescription>
                <div className="mb-2 font-medium text-red-800">
                  Please fix the following issues:
                </div>
                <ul className="space-y-1 text-red-700 text-sm">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="flex items-start gap-1">
                      <span className="mt-0.5 text-red-500">•</span>
                      {message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="mb-3 text-5xl">🎓</div>
            <h2 className="mb-2 font-bold text-gray-900 text-2xl">
              Verify Your Credentials
            </h2>
            <p className="text-gray-600">
              Provide your Bar Number, verify your NIN, and upload your photograph
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Bar Number Section */}
            <div className="space-y-4 bg-white p-6 border border-gray-200 rounded-lg">
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 text-lg">Bar Number</h3>
                <p className="text-gray-600 text-sm">
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
            <div className="space-y-4 bg-white p-6 border border-gray-200 rounded-lg">
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 text-lg">
                  National Identification Number (NIN)
                </h3>
                <p className="text-gray-600 text-sm">
                  Verify your identity with your NIN
                </p>
              </div>

              {/* Mock Mode Notice */}
              {import.meta.env.VITE_USE_MOCK_NIN === 'true' && (
                <div className="bg-amber-50 p-3 border border-amber-200 rounded-lg">
                  <p className="mb-2 font-medium text-amber-900 text-xs">
                    🧪 MOCK MODE - Backend not available
                  </p>
                  <p className="mb-2 text-amber-700 text-xs">
                    Use these test NINs to see different verification results:
                  </p>
                  <div className="gap-2 grid grid-cols-2 text-xs">
                    <div>
                      <p className="font-medium text-green-700">✓ Valid NINs:</p>
                      <p className="text-amber-700">12345678901</p>
                      <p className="text-amber-700">98765432101</p>
                      <p className="text-amber-700">55555555555</p>
                    </div>
                    <div>
                      <p className="font-medium text-red-700">✗ Invalid NINs:</p>
                      <p className="text-amber-700">11111111111</p>
                      <p className="text-amber-700">22222222222</p>
                      <p className="text-amber-700">33333333333</p>
                    </div>
                  </div>
                </div>
              )}

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
                <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mt-0.5 w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="mb-2 font-medium text-green-900 text-sm">
                        NIN Verified Successfully
                      </p>
                      <div className="space-y-1 text-green-700 text-xs">
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
                <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="border-blue-500 border-b-2 rounded-full w-5 h-5 animate-spin"></div>
                    <p className="text-blue-700 text-sm">
                      Verifying your NIN with the national database...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Photograph Upload Section */}
            <div className="space-y-4 bg-white p-6 border border-gray-200 rounded-lg">
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 text-lg">Photograph</h3>
                <p className="text-gray-600 text-sm">
                  Upload a clear photograph of yourself
                </p>
              </div>

              <Field>
                <FieldLabel>Your Photograph *</FieldLabel>
                <FieldDescription className="text-xs">
                  Upload a professional photograph (JPEG, PNG, or WebP, max 5MB). It will be uploaded when you submit the form.
                </FieldDescription>
                <PhotoUploader
                  onPhotoSelect={handlePhotoSelect}
                  onPhotoRemove={handlePhotoRemove}
                  currentPhoto={formData.photographUrl || null}
                  error={photoError || errors.photograph}
                  disabled={isUploadingPhoto}
                />
                
                {/* Upload Progress - shown during form submission */}
                {isUploadingPhoto && (
                  <div className="bg-blue-50 mt-3 p-3 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="border-blue-500 border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                      <p className="text-blue-700 text-sm">
                        Uploading photograph... {uploadProgress}%
                      </p>
                    </div>
                    <div className="bg-blue-200 rounded-full w-full h-2">
                      <div 
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Upload Error during submission */}
                {photoError && !isUploadingPhoto && (
                  <div className="bg-red-50 mt-3 p-3 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 w-5 h-5 text-red-600 shrink-0" />
                      <div className="flex-1">
                        <p className="mb-2 font-medium text-red-900 text-sm">
                          Upload Failed
                        </p>
                        <p className="text-red-700 text-xs">
                          {photoError}
                        </p>
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
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-3 rounded-lg font-medium text-white disabled:transform-none hover:scale-[1.02] active:scale-[0.98] transition disabled:cursor-not-allowed transform"
            >
              Submit Application
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 mt-6 p-4 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div>
                <p className="font-medium text-blue-900 text-sm">
                  What happens next?
                </p>
                <ul className="space-y-1 mt-2 text-blue-700 text-xs">
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
          <div className="top-6 sticky">
            <ProgressTracker
              currentStep={currentStep}
              completedSteps={completedSteps}
              variant="compact"
              className="mb-6"
            />
            
            {/* Completion Checklist */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="mb-3 font-medium text-sm">Completion Checklist</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {formData.barNumber ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="border-2 border-gray-300 rounded-full w-4 h-4"></div>
                  )}
                  <span className={formData.barNumber ? "text-green-700" : "text-gray-600"}>
                    Bar Number entered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.ninVerified ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="border-2 border-gray-300 rounded-full w-4 h-4"></div>
                  )}
                  <span className={formData.ninVerified ? "text-green-700" : "text-gray-600"}>
                    NIN verified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.photograph || formData.photographUrl ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="border-2 border-gray-300 rounded-full w-4 h-4"></div>
                  )}
                  <span className={(formData.photograph || formData.photographUrl) ? "text-green-700" : "text-gray-600"}>
                    Photograph uploaded
                  </span>
                </div>
              </div>
              
              {formData.barNumber && formData.ninVerified && (formData.photograph || formData.photographUrl) && (
                <div className="mt-4 pt-4 border-gray-200 border-t">
                  <Badge className="justify-center bg-green-100 border-green-200 w-full text-green-700">
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
