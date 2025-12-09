// ============================================
// Step 1: Basics
// onboarding/lawyer/basics.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useLawyerOnboardingStore } from "@/hooks/lawyer-onboarding";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountriesWithStates } from "@/hooks/use-countries";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { useOnboardingStore } from "@/lib/onboardingStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectPositioner,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";


export const Route = createFileRoute("/onboarding/lawyer/basics")({
  component: LawyerBasicsStep,
});

function LawyerBasicsStep() {
  const router = useRouter();
  const {
    firstName,
    middleName,
    lastName,
    country,
    state,
    city,
    phoneNumber,
    setFirstName,
    setMiddleName,
    setLastName,
    setCountry,
    setState,
    setCity,
    setPhoneNumber,
    updateLastSaved,
  } = useLawyerOnboardingStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch countries with states using the custom hook
  const { data, isLoading, isError } = useCountriesWithStates();

  // Safely access the transformed data
  const countries = data?.countries || [];
  const statesByCountry = data?.statesByCountry || {};
  const availableStates = country ? statesByCountry[country] || [] : [];

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setState("");
    setErrors({});
  };

  const handleStateChange = (value: string) => {
    setState(value);
    setErrors({});
  };

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    // if (!firstName.trim()) newErrors.firstName = "First name is required";
    // if (!lastName.trim()) newErrors.lastName = "Last name is required";
    // if (!country) newErrors.country = "Please select a country";
    // if (availableStates.length > 0 && !state) {
    //   newErrors.state = "Please select a state/province";
    // }
    // if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    // else if (phoneNumber.length < 10) {
    //   newErrors.phoneNumber = "Please enter a valid phone number";
    // }
    //
    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors);
    //   return;
    // }
    //
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
        <div className="text-5xl mb-3">⚖</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome! Let's set up your profile
        </h2>
        <p className="text-gray-600">
          Start by telling us your basic information
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">

        <FieldGroup className="grid grid-cols-3 gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="name">First Name</FieldLabel>
            <Input />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="name">Middle Name</FieldLabel>
            <Input />
          </Field>

          <Field className="gap-2">
            <FieldLabel htmlFor="name">Last Name</FieldLabel>
            <Input />
          </Field>
        </FieldGroup>

        <FieldGroup className="grid md:grid-cols-2 gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="name">Email Address</FieldLabel>
            <Input type="email" />
            <FieldDescription className="text-xs">
              Your contact email address from clients
            </FieldDescription>
          </Field>

          <Field className="gap-2">
            <FieldLabel htmlFor="name"> Phone Number *</FieldLabel>
            <PhoneInput international addInternationalOption defaultCountry={"NG"} />
            <FieldDescription className="text-xs">
              Include country code for international numbers
            </FieldDescription>
          </Field>

        </FieldGroup>

        <FieldGroup className="grid md:grid-cols-2 gap-4">
          <Field className="gap-2">
            <FieldLabel>Country *</FieldLabel>
            <Select
              value={country}
              onValueChange={handleCountryChange}
              items={countries}
            >
              <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectPositioner alignItemWithTrigger>
                <SelectContent>
                  {countries.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPositioner>

            </Select>
            {errors.country && <FieldError>{errors.country}</FieldError>}
          </Field>

          {/* State Select - Only show if country is selected and has states */}
          {country && availableStates.length > 1 && (
            <Field className="gap-2 animate-fadeIn">
              <FieldLabel>State / Region *</FieldLabel>
              <Select
                value={state}
                onValueChange={handleStateChange}
                items={availableStates}
              >
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>

                <SelectPositioner alignItemWithTrigger>
                  <SelectContent>
                    {availableStates.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
              {errors.state && <FieldError>{errors.state}</FieldError>}
            </Field>
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
          onClick={validateAndNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue to Credentials →
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Your information is secure and will only be shared with verified clients
      </p>
    </div >
  );
}
