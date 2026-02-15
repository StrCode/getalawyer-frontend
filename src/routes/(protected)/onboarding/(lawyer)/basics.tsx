// ============================================
// Step 1: Basics - Simplified Onboarding
// onboarding/lawyer/basics.tsx
// ============================================

import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useCountriesWithStates } from "@/hooks/use-countries";
import { authClient } from "@/lib/auth-client";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/(protected)/onboarding/(lawyer)/basics")({
  component: LawyerBasicsStep,
  beforeLoad: () => {
    // Check if application is already submitted or verified
    const store = useEnhancedOnboardingStore.getState();
    
    // If application is submitted or approved, redirect to status page
    if (store.applicationStatus === 'submitted' || store.applicationStatus === 'approved') {
      throw redirect({
        to: '/onboarding/status',
      });
    }
  },
});

function LawyerBasicsStep() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  
  // Enhanced onboarding store
  const {
    currentStep,
    completedSteps,
    basicInfo,
    updateBasicInfo,
    markStepCompleted,
    setCurrentStep,
  } = useEnhancedOnboardingStore();
  
  // Local form state
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    state: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch countries with states
  const { data, isLoading, isError } = useCountriesWithStates();
  const countries = data?.countries || [];
  const statesByCountry = data?.statesByCountry || {};
  const availableStates = formData.country ? statesByCountry[formData.country] : [];

  // Debug: Log countries data
  console.log('Countries data:', { countries: countries.length, isLoading, isError });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update store
    updateBasicInfo({ [field]: value });
    
    // Clear errors for this field and show positive feedback
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (value: string | null) => {
    const countryValue = value || "";
    setFormData(prev => ({ ...prev, country: countryValue, state: "" }));
    updateBasicInfo({ country: countryValue, state: "" });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.country;
      delete newErrors.state;
      return newErrors;
    });
  };

  const handleStateChange = (value: string | null) => {
    const stateValue = value || "";
    setFormData(prev => ({ ...prev, state: stateValue }));
    updateBasicInfo({ state: stateValue });
    if (errors.state) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      });
    }
  };

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }
    
    // Only validate state if country has states
    if (availableStates.length > 1 && !formData.state) {
      newErrors.state = "Please select a state/region";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toastManager.add({
        title: "Please fix validation errors",
        description: `${Object.keys(newErrors).length} issue(s) need to be resolved.`,
        type: "error",
      });
      
      // Scroll to top to show validation summary (only in browser)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Save to store and navigate
    updateBasicInfo(formData);
    markStepCompleted('basic_info');
    
    toastManager.add({
      title: "Basic information saved!",
      description: "Moving to credentials step.",
      type: "success",
    });

    router.navigate({ to: "/onboarding/credentials" });
  };

  // Initialize form from store on mount
  useEffect(() => {
    setCurrentStep('basic_info');
    
    // Load data from store if available
    if (basicInfo.firstName || basicInfo.email) {
      setFormData({
        firstName: basicInfo.firstName || "",
        middleName: basicInfo.middleName || "",
        lastName: basicInfo.lastName || "",
        email: basicInfo.email || session?.user?.email || "",
        phoneNumber: basicInfo.phoneNumber || "",
        country: basicInfo.country || "",
        state: basicInfo.state || "",
      });
    } else if (session?.user?.email) {
      // Pre-populate email from session
      setFormData(prev => ({ ...prev, email: session.user.email }));
      updateBasicInfo({ email: session.user.email });
    }
  }, [setCurrentStep, basicInfo, session, updateBasicInfo]);

  // Loading State
  if (isLoading) {
    return (
      <div className="mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="mx-auto mb-4 border-blue-500 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading location data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="bg-red-50 p-4 py-20 border border-red-200 rounded-lg text-center">
            <p className="font-medium text-red-700">Error loading data.</p>
            <p className="text-red-500 text-sm">
              Please check your internet connection or refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 text-sm">Step 1 of 2</span>
              <span className="text-gray-500 text-xs sm:text-sm">Basic Information</span>
            </div>
            <div className="bg-gray-200 rounded-full w-full h-2">
              <div className="bg-blue-500 rounded-full w-1/2 h-2 transition-all duration-300"></div>
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
            <div className="mb-3 text-5xl">👨‍💼</div>
            <h2 className="mb-2 font-bold text-gray-900 text-2xl">
              Welcome! Let's set up your profile
            </h2>
            <p className="text-gray-600">
              Start by telling us your basic information
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <FieldGroup className="gap-4 grid grid-cols-3">
              {/* First Name */}
              <Field>
                <FieldLabel>First Name *</FieldLabel>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
              </Field>

              {/* Middle Name */}
              <Field>
                <FieldLabel>Middle Name</FieldLabel>
                <Input
                  value={formData.middleName}
                  onChange={(e) => handleFieldChange('middleName', e.target.value)}
                />
              </Field>

              {/* Last Name */}
              <Field>
                <FieldLabel>Last Name *</FieldLabel>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
              </Field>
            </FieldGroup>

            <FieldGroup className="gap-4 grid md:grid-cols-2">
              {/* Email */}
              <Field>
                <FieldLabel>Email Address *</FieldLabel>
                <FieldDescription className="text-xs">
                  Your contact email address from clients
                </FieldDescription>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              {/* Phone Number */}
              <Field>
                <FieldLabel>Phone Number *</FieldLabel>
                <FieldDescription className="text-xs">
                  Include country code for international numbers
                </FieldDescription>
                <PhoneInput
                  international
                  defaultCountry={"NG"}
                  value={formData.phoneNumber}
                  onChange={(value: string | undefined) => {
                    handleFieldChange('phoneNumber', value || "");
                  }}
                />
                {errors.phoneNumber && <FieldError>{errors.phoneNumber}</FieldError>}
              </Field>
            </FieldGroup>

            <FieldGroup className="gap-4 grid md:grid-cols-2">
              {/* Country */}
              <Field>
                <FieldLabel>Country *</FieldLabel>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                  items={countries}
                >
                  <SelectTrigger className={errors.country ? "border-red-500" : ""}>
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
                {errors.country && <FieldError>{errors.country}</FieldError>}
              </Field>

              {/* State Select - Only show if country is selected and has states */}
              {formData.country && availableStates.length > 1 && (
                <Field className="animate-fadeIn">
                  <FieldLabel>State / Region *</FieldLabel>
                  <Select
                    value={formData.state}
                    onValueChange={handleStateChange}
                    items={availableStates}
                  >
                    <SelectTrigger className={errors.state ? "border-red-500" : ""}>
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
                  {errors.state && <FieldError>{errors.state}</FieldError>}
                </Field>
              )}

              {/* Info message when no states available */}
              {formData.country && availableStates.length <= 1 && (
                <p className="flex justify-end items-end pb-2 text-gray-500 text-sm">
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
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-3 rounded-lg w-full font-medium text-white disabled:transform-none hover:scale-[1.02] active:scale-[0.98] transition disabled:cursor-not-allowed transform"
            >
              Continue to Credentials
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>

          {/* Helper Text */}
          <p className="mt-4 text-gray-500 text-sm text-center">
            Your information is secure and will only be shared with verified clients
          </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}