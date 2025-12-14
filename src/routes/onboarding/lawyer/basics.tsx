// ============================================
// Step 1: Basics
// onboarding/lawyer/basics.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod/v4";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { clearLawyerOnboardingStore, useLawyerOnboardingStore } from "@/stores/onBoardingLawyer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountriesWithStates } from "@/hooks/use-countries";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { api } from "@/lib/api/client";
import { useAppForm } from "@/hooks/form";
import { toastManager } from "@/components/ui/toast";

export const Route = createFileRoute("/onboarding/lawyer/basics")({
  component: LawyerBasicsStep,
});

// Validation schema
const basicsSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required (min 2 characters)" }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: "Last name is required (min 2 characters)" }),
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

function LawyerBasicsStep() {
  const router = useRouter();
  const {
    firstName,
    middleName,
    lastName,
    email,
    phoneNumber,
    country,
    state,
    setFirstName,
    setMiddleName,
    setLastName,
    setEmail,
    setPhoneNumber,
    setCountry,
    setState,
    updateLastSaved,
  } = useLawyerOnboardingStore();

  // Fetch countries with states using the custom hook
  const { data, isLoading, isError } = useCountriesWithStates();

  // Safely access the transformed data
  const countries = data?.countries || [];
  const statesByCountry = data?.statesByCountry || {};
  const availableStates = country ? statesByCountry[country] || [] : [];

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setState("");
  };

  const handleStateChange = (value: string) => {
    setState(value);
  };

  const completeMutation = useMutation({
    mutationFn: async (data: OnBoardingRequest) => {
      return api.lawyer.basicsSetup(data);
    },
    onSuccess: (updatedUser) => {
      toastManager.add({
        title: "Profile setup complete!",
        description: "Your basic information has been saved.",
        type: "success",
      });

      // Clear form data from Zustand state
      clearLawyerOnboardingStore();

      // Redirect to next step
      router.navigate({ to: "/onboarding/lawyer/credentials" });
    },
    onError: (error: any) => {
      console.error("Onboarding error:", error);
      toastManager.add({
        title: "Setup failed",
        description: error.message || "Failed to save your information. Please try again.",
        type: "error",
      });
    },
  });

  // Initialize form with TanStack Form
  const form = useAppForm({
    defaultValues: {
      firstName: firstName || "",
      middleName: middleName || "",
      lastName: lastName || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
      country: country || "",
      state: state || "",
    },
    validators: {
      onChange: basicsSchema,
    },
    onSubmit: async ({ value }) => {
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading countries...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Failed to load countries. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!country) newErrors.country = "Please select a country";
    if (availableStates.length > 0 && !state) {
      newErrors.state = "Please select a state/province";
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Save timestamp and navigate
    updateLastSaved();
    router.navigate({ to: "/onboarding/lawyer/credentials" });
  };


  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step 1 of 4</span>
          <span className="text-sm text-gray-500">Basic Information</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/4"></div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome! Let's set up your profile
        </h2>
        <p className="text-sm text-gray-600">
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
                <Field className="gap-2">
                  <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                  <Input
                    id="firstName"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0].message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="middleName">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
                  <Input
                    id="middleName"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.AppField>

            <form.AppField name="lastName">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                  <Input
                    id="lastName"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0].message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.AppField>
          </FieldGroup>

          <FieldGroup className="grid md:grid-cols-2 gap-4">
            <form.AppField name="email">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="email">Email Address *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                  />
                  <FieldDescription className="text-xs">
                    Your contact email address from clients
                  </FieldDescription>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0].message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="phoneNumber">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="phoneNumber">Phone Number *</FieldLabel>
                  <PhoneInput
                    international
                    defaultCountry={"NG"}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value || "")}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription className="text-xs">
                    Include country code for international numbers
                  </FieldDescription>
                </Field>
              )}
            </form.AppField>
          </FieldGroup>

          <FieldGroup className="grid md:grid-cols-2 gap-4">
            <form.AppField name="country">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel>Country *</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={handleCountryChange}
                    items={countries}
                  >
                    <SelectTrigger>
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
                </Field>
              )}
            </form.AppField>

            {/* State Select - Only show if country is selected and has states */}
            {country && availableStates.length > 1 && (
              <form.AppField name="state">
                {(field) => (
                  <Field className="gap-2 animate-fadeIn">
                    <FieldLabel>State / Region *</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={handleStateChange}
                      items={availableStates}
                    >
                      <SelectTrigger
                        className={
                          field.state.meta.isTouched && field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select a state/region" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.AppField>
            )}

            {/* Info message when no states available */}
            {country && availableStates.length === 1 && (
              <p className="flex justify-end items-end text-gray-500 pb-2 text-sm">
                No states or regions are listed for this country.
              </p>
            )}

          </FieldGroup>
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={validateAndNext}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue to Credentials
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Your information is secure and will only be shared with verified clients
        </p>
      </form>
    </div>
  );
}
