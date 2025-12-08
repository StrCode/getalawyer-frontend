import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { CircleCheckIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCountriesWithStates } from "@/hooks/use-countries";
import { useOnboardingStore } from "@/lib/onboardingStore";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/onboarding/lawyer/step-1")({
  component: LawyerStep1,
});

function LawyerStep1() {
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps,
    steps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  } = useOnboarding("lawyer");


  const [formData, setFormData] = useState({
    yearsOfExperience: "",
    lawSchool: "",
    graduationYear: "",
  });

  const stepsd = [
    {
      id: "step1",
      title: "First Step",
      description: "Description of the first step",
      icon: Settings,
      content: <div>Step 1 content</div>,
    },
    // ... more steps
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // navigate({ to: "/onboarding/lawyer/step-2" });
    await goToNextStep(formData);
  };

  const { country, state, setCountry, setState } = useOnboardingStore();

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

    if (!country) {
      newErrors.country = "Please select a country";
    }

    // Only validate state if the selected country has states (more than just placeholder)
    if (availableStates.length > 1 && !state) {
      newErrors.state = "Please select a state/region";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Navigate to next step
    // router.navigate({ to: "/onboarding/client/specialization" });
  };



  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      steps={steps}
      onStepClick={goToStep}
    >
      <div className="w-full rounded-xl border bg-background ">
        <div className="flex flex-col items-center justify-center gap-6 rounded-t-xl border-b bg-card/60 py-12">
          <div className="flex flex-col items-center space-y-1">
            <h2 className="font-medium text-2xl">
              Basic Information & Location
            </h2>
            <a className="text-muted-foreground underline" href="#">
              What is a workspace?
            </a>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <FieldGroup className="grid grid-cols-3 gap-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">First Name</FieldLabel>
              <Input autoComplete="off" id="name" placeholder="e.g., Acme, Inc." />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="name">Middle Name</FieldLabel>
              <Input autoComplete="off" id="name" placeholder="e.g., Acme, Inc." />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="name">Last Name</FieldLabel>
              <Input autoComplete="off" id="name" placeholder="Your last name" />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-2 gap-4">
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
                <SelectPopup alignItemWithTrigger={false}>
                  {countries.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
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
                  <SelectPopup alignItemWithTrigger={false}>
                    {availableStates.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                {errors.state && <FieldError>{errors.state}</FieldError>}
              </Field>
            )}

            {/* Info message when no states available */}
            {country && availableStates.length === 1 && (
              <p className="text-gray-500 text-sm">
                No states or regions are listed for this country.
              </p>
            )}
          </FieldGroup>


        </div>


        <div className="flex justify-end rounded-b-xl border-t bg-card/60 p-4">
          <Button type="submit">
            Next
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
