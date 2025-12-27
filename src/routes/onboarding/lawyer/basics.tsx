// ============================================
// Step 1: Basics - Enhanced with validation, draft management, and progress tracking
// onboarding/lawyer/basics.tsx
// ============================================

import { AlertCircleIcon, ArrowRight01Icon, FloppyDiskIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as z from "zod/v4";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastManager } from "@/components/ui/toast";
import { useAppForm } from "@/hooks/form";
import { useCountriesWithStates } from "@/hooks/use-countries";
import { useDraftIndicator, useDraftManager } from "@/hooks/use-draft-manager";
import { onboardingSyncService } from "@/lib/onboarding-sync";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/stores/enhanced-onboarding-store";
// Enhanced imports
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";
import { useFieldValidation, ValidationEngine } from "@/utils/validation-engine";

export const Route = createFileRoute("/onboarding/lawyer/basics")({
  component: LawyerBasicsStep,
});

// Enhanced validation schema with better error messages
const basicsSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  country: z.string().min(1, { message: "Please select a country" }),
  state: z.string().optional(),
});

type BasicsFormData = z.infer<typeof basicsSchema>;

interface OnBoardingRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
}

// Enhanced field validation component
interface EnhancedFieldProps {
  name: keyof BasicsFormData;
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  validationResult?: ReturnType<typeof useFieldValidation>;
}

function EnhancedField({ 
  name, 
  label, 
  required = false, 
  description, 
  children, 
  validationResult 
}: EnhancedFieldProps) {
  const hasError = validationResult?.hasError || false;
  const hasWarning = validationResult?.hasWarning || false;
  const isValid = validationResult?.isValid && !hasError && !hasWarning;

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={name} className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {isValid && (
          <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-500" />
        )}
        {hasError && (
          <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-500" />
        )}
      </FieldLabel>
      
      {children}
      
      {description && (
        <FieldDescription className="text-xs">
          {description}
        </FieldDescription>
      )}
      
      {/* Enhanced error display */}
      {hasError && validationResult?.primaryError && (
        <FieldError className="flex items-center gap-1">
          <HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3" />
          {validationResult.primaryError.message}
          {validationResult.primaryError.suggestion && (
            <span className="text-xs text-gray-600 ml-1">
              ({validationResult.primaryError.suggestion})
            </span>
          )}
        </FieldError>
      )}
      
      {/* Success message */}
      {isValid && validationResult.successMessage && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
          {validationResult.successMessage}
        </p>
      )}
    </Field>
  );
}

function LawyerBasicsStep() {
  const router = useRouter();
  
  // Hydration state (prevent hydration mismatch)
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Enhanced onboarding store
  const {
    currentStep,
    completedSteps,
    practiceInfo,
    updatePracticeInfo,
    markStepCompleted,
    setCurrentStep,
    validateStep,
    clearAllErrors,
    setError,
    clearError,
    updateLastSaved
  } = useEnhancedOnboardingStore();

  // Debug: Log store state and sync service status
  useEffect(() => {
    console.log('=== BASICS PAGE DEBUG ===');
    console.log('Current step:', currentStep);
    console.log('Completed steps:', completedSteps);
    console.log('Practice info:', practiceInfo);
    console.log('Sync service last sync time:', onboardingSyncService.getLastSyncTime());
    console.log('Sync service is syncing:', onboardingSyncService.isSyncing());
    console.log('========================');
  }, [currentStep, completedSteps, practiceInfo]);

  // Draft management
  const draftManager = useDraftManager({
    stepId: 'practice_info' as OnboardingStep,
    autoSaveInterval: 30000, // 30 seconds
    onSave: (data) => {
      console.log('Draft saved:', data);
    },
    onRestore: (data) => {
      console.log('Draft restored:', data);
      if (data && typeof data === 'object') {
        updatePracticeInfo(data as Partial<typeof formData>);
      }
    }
  });

  // Draft indicator
  const draftIndicator = useDraftIndicator('practice_info' as OnboardingStep);

  // Form state
  const [formData, setFormData] = useState({
    firstName: practiceInfo.firstName || "",
    middleName: practiceInfo.middleName || "",
    lastName: practiceInfo.lastName || "",
    email: practiceInfo.email || "",
    phoneNumber: practiceInfo.phoneNumber || "",
    country: practiceInfo.country || "",
    state: practiceInfo.state || "",
  });

  // Field validation hooks
  const firstNameValidation = useFieldValidation('practice_info', 'firstName', formData.firstName, useEnhancedOnboardingStore.getState());
  const lastNameValidation = useFieldValidation('practice_info', 'lastName', formData.lastName, useEnhancedOnboardingStore.getState());
  const emailValidation = useFieldValidation('practice_info', 'email', formData.email, useEnhancedOnboardingStore.getState());
  const phoneValidation = useFieldValidation('practice_info', 'phoneNumber', formData.phoneNumber, useEnhancedOnboardingStore.getState());
  const countryValidation = useFieldValidation('practice_info', 'country', formData.country, useEnhancedOnboardingStore.getState());

  // Fetch countries with states using the custom hook
  const { data, isLoading, isError } = useCountriesWithStates();

  // Safely access the transformed data
  const countries = data?.countries || [];
  const statesByCountry = data?.statesByCountry || {};
  const availableStates = formData.country ? (statesByCountry[formData.country] ?? []) : [];

  // Update form data and trigger draft save
  const updateFormField = (field: keyof typeof formData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update store
    updatePracticeInfo({ [field]: value });
    
    // Update draft
    draftManager.updatePendingData(newFormData);
    
    // Clear field-specific errors
    clearError(field);
  };

  const handleCountryChange = (value: string) => {
    updateFormField('country', value);
    updateFormField('state', ""); // Reset state when country changes
  };

  const handleStateChange = (value: string) => {
    updateFormField('state', value);
  };

  // Initialize form from draft or store on mount
  useEffect(() => {
    const restoredDraft = draftManager.restoreDraft();
    if (restoredDraft && typeof restoredDraft === 'object') {
      const draftData = restoredDraft as typeof formData;
      setFormData(draftData);
    } else if (practiceInfo.firstName || practiceInfo.email) {
      // Use store data if no draft
      setFormData({
        firstName: practiceInfo.firstName || "",
        middleName: practiceInfo.middleName || "",
        lastName: practiceInfo.lastName || "",
        email: practiceInfo.email || "",
        phoneNumber: practiceInfo.phoneNumber || "",
        country: practiceInfo.country || "",
        state: practiceInfo.state || "",
      });
    }
    // eslint-disable-next-line
  }, []); // Empty dependency array - only run once on mount

  // Set current step on mount
  useEffect(() => {
    setCurrentStep('practice_info' as OnboardingStep);
  }, [setCurrentStep]);

  // Initialize hydration state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const completeMutation = useMutation({
    mutationFn: async (_requestData: OnBoardingRequest) => {
      // For basics step, we just validate and move forward
      // The actual API call will happen in the credentials step
      return Promise.resolve({ success: true });
    },
    onSuccess: (_updatedUser) => {
      // Mark step as completed
      markStepCompleted('practice_info' as OnboardingStep);
      
      // Clear draft since step is completed
      draftManager.clearDraft();
      
      // Update last saved timestamp
      updateLastSaved();
      
      toastManager.add({
        title: "Basic information saved!",
        description: "Moving to credentials step.",
        type: "success",
      });

      // Navigate to next step
      router.navigate({ to: "/onboarding/lawyer/credentials" });
    },
    onError: (error: Error) => {
      console.error("Onboarding error:", error);
      toastManager.add({
        title: "Navigation failed",
        description: error.message || "Failed to proceed to next step. Please try again.",
        type: "error",
      });
    },
  });

  // Initialize form with TanStack Form
  const form = useAppForm({
    defaultValues: formData,
    onSubmit: ({ value }) => {
      // Validate using enhanced validation engine
      const validationResult = ValidationEngine.validateStep('practice_info', useEnhancedOnboardingStore.getState());
      
      if (!validationResult.canProceed) {
        // Set errors in store for display
        validationResult.errors.forEach(error => {
          setError(error.field, [error.message]);
        });
        
        toastManager.add({
          title: "Validation failed",
          description: "Please fix the errors before continuing.",
          type: "error",
        });
        return;
      }
      
      // Clear all errors
      clearAllErrors();
      
      // Submit to API
      completeMutation.mutate(value);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading countries...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Failed to load countries. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const validateAndNext = () => {
    // Use enhanced validation
    const validationResult = ValidationEngine.validateStep('practice_info', useEnhancedOnboardingStore.getState());
    
    if (!validationResult.canProceed) {
      // Set errors for display
      validationResult.errors.forEach(error => {
        setError(error.field, [error.message]);
      });
      
      toastManager.add({
        title: "Please fix validation errors",
        description: `${validationResult.errors.length} issue(s) need to be resolved.`,
        type: "error",
      });
      return;
    }

    // Clear errors and proceed
    clearAllErrors();
    
    // Save current progress
    updateLastSaved();
    
    // Navigate to next step
    router.navigate({ to: "/onboarding/lawyer/credentials" });
  };

  // Get current step validation for display
  const currentStepValidation = validateStep('practice_info');

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="grid-sidebar">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 1 of 4</span>
              <span className="text-xs sm:text-sm text-gray-500">Basic Information</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/4"></div>
            </div>
          </div>

          {/* Draft Status Indicator */}
          {isHydrated && draftIndicator.status !== 'clean' && (
            <Alert className={cn("mb-6", {
              "border-blue-200 bg-blue-50": draftIndicator.status === 'saving',
              "border-green-200 bg-green-50": draftIndicator.status === 'draft',
              "border-orange-200 bg-orange-50": draftIndicator.status === 'unsaved',
              "border-red-200 bg-red-50": draftIndicator.status === 'error',
              "border-amber-200 bg-amber-50": draftIndicator.status === 'offline',
            })}>
              <AlertDescription className={cn("flex items-center gap-2", draftIndicator.color)}>
                <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4" />
                {draftIndicator.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Summary */}
          {isHydrated && !currentStepValidation.isValid && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium text-red-800 mb-2">
                  Please fix the following issues:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {currentStepValidation.errors.map((error) => (
                    <li key={`error-${error.field}-${error.message}`} className="flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-responsive-heading font-bold text-gray-900 mb-2">
              Welcome! Let's set up your profile
            </h2>
            <p className="text-responsive-body text-gray-600">
              Start by telling us your basic information
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="space-y-5">
              <FieldGroup className="grid grid-cols-3 gap-4">
                <form.AppField name="firstName">
                  {(field) => (
                    <EnhancedField 
                      name="firstName" 
                      label="First Name" 
                      required 
                      validationResult={firstNameValidation}
                    >
                      <Input
                        id="firstName"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          updateFormField('firstName', e.target.value);
                        }}
                        className={firstNameValidation.hasError ? "border-red-500" : ""}
                      />
                    </EnhancedField>
                  )}
                </form.AppField>

                <form.AppField name="middleName">
                  {(field) => (
                    <EnhancedField name="middleName" label="Middle Name">
                      <Input
                        id="middleName"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          updateFormField('middleName', e.target.value);
                        }}
                      />
                    </EnhancedField>
                  )}
                </form.AppField>

                <form.AppField name="lastName">
                  {(field) => (
                    <EnhancedField 
                      name="lastName" 
                      label="Last Name" 
                      required 
                      validationResult={lastNameValidation}
                    >
                      <Input
                        id="lastName"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          updateFormField('lastName', e.target.value);
                        }}
                        className={lastNameValidation.hasError ? "border-red-500" : ""}
                      />
                    </EnhancedField>
                  )}
                </form.AppField>
              </FieldGroup>

              <FieldGroup className="grid md:grid-cols-2 gap-4">
                <form.AppField name="email">
                  {(field) => (
                    <EnhancedField 
                      name="email" 
                      label="Email Address" 
                      required 
                      description="Your contact email address from clients"
                      validationResult={emailValidation}
                    >
                      <Input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          updateFormField('email', e.target.value);
                        }}
                        className={emailValidation.hasError ? "border-red-500" : ""}
                      />
                    </EnhancedField>
                  )}
                </form.AppField>

                <form.AppField name="phoneNumber">
                  {(field) => (
                    <EnhancedField 
                      name="phoneNumber" 
                      label="Phone Number" 
                      required 
                      description="Include country code for international numbers"
                      validationResult={phoneValidation}
                    >
                      <PhoneInput
                        international
                        defaultCountry={"NG"}
                        value={field.state.value}
                        onChange={(value: string | undefined) => {
                          const phoneValue = value || "";
                          field.handleChange(phoneValue);
                          updateFormField('phoneNumber', phoneValue);
                        }}
                        onBlur={field.handleBlur}
                      />
                    </EnhancedField>
                  )}
                </form.AppField>
              </FieldGroup>

              <FieldGroup className="grid md:grid-cols-2 gap-4">
                <form.AppField name="country">
                  {(field) => (
                    <EnhancedField 
                      name="country" 
                      label="Country" 
                      required 
                      validationResult={countryValidation}
                    >
                      <Select
                        value={field.state.value}
                        onValueChange={(value: string | null) => {
                          const selectedValue = value || "";
                          field.handleChange(selectedValue);
                          handleCountryChange(selectedValue);
                        }}
                        items={countries}
                      >
                        <SelectTrigger className={countryValidation.hasError ? "border-red-500" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EnhancedField>
                  )}
                </form.AppField>

                {/* State Select - Only show if country is selected and has states */}
                {formData.country && availableStates.length > 1 && (
                  <form.AppField name="state">
                    {(field) => (
                      <EnhancedField name="state" label="State / Region" required>
                        <Select
                          value={field.state.value}
                          onValueChange={(value: string | null) => {
                            const selectedValue = value || "";
                            field.handleChange(selectedValue);
                            handleStateChange(selectedValue);
                          }}
                          items={availableStates}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStates.map(({ label, value }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </EnhancedField>
                    )}
                  </form.AppField>
                )}

                {/* Info message when no states available */}
                {formData.country && availableStates.length === 1 && (
                  <p className="flex justify-end items-end text-gray-500 pb-2 text-sm">
                    No states or regions are listed for this country.
                  </p>
                )}
              </FieldGroup>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8">
              <Button
                type="button"
                onClick={validateAndNext}
                disabled={completeMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-target"
              >
                {completeMutation.isPending ? "Saving..." : "Continue to Credentials"}
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-responsive-body text-gray-500 mt-4">
              Your information is secure and will only be shared with verified clients
            </p>
          </form>
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
            
            {/* Auto-save Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Auto-save Settings</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-save enabled</span>
                <Badge variant={draftManager.isAutoSaveEnabled ? "default" : "secondary"}>
                  {draftManager.isAutoSaveEnabled ? "On" : "Off"}
                </Badge>
              </div>
              {draftManager.lastSaved && draftManager.lastSaved instanceof Date && !Number.isNaN(draftManager.lastSaved.getTime()) && (
                <p className="text-xs text-gray-500 mt-2">
                  Last saved: {draftManager.lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
