import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCountriesWithStates } from "@/hooks/use-countries";
import { useOnboardingStore } from "@/lib/onboardingStore";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLawyerOnboardingStore } from "@/hooks/lawyer-onboarding";

export const Route = createFileRoute("/onboarding/lawyer/step-1")({
  component: LawyerStep1,
});

function LawyerStep1() {
  // const { country, state, setCountry, setState } = useOnboardingStore();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
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

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!country) newErrors.country = "Please select a country";
    if (availableStates.length > 0 && !state) {
      newErrors.state = "Please select a state/province";
    }
    if (!city.trim()) newErrors.city = "City is required";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save timestamp and navigate
    updateLastSaved();
    router.navigate({ to: "/onboarding/lawyer" });
  };

  return (
    <div className="w-full rounded-xl border bg-background ">
      <div className="flex flex-col items-center justify-center gap-6 rounded-t-xl border-b bg-card/60 py-12">
        <div className="flex flex-col items-center space-y-1">
          <h2 className="font-medium text-2xl">Basic Information & Location</h2>
          <a className="text-muted-foreground underline" href="#">
            What is a workspace?
          </a>
        </div>
      </div>
      <div className="px-8 py-4 space-y-6">
        <FieldGroup className="grid grid-cols-3 gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="name">First Name</FieldLabel>
            <Input autoComplete="off" placeholder="e.g., Acme, Inc." />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="name">Middle Name</FieldLabel>
            <Input autoComplete="off" placeholder="Your middle name" />
          </Field>

          <Field className="gap-2">
            <FieldLabel htmlFor="name">Last Name</FieldLabel>
            <Input autoComplete="off" placeholder="Your last name" />
          </Field>
        </FieldGroup>

      </div>

      <div className="flex justify-end rounded-b-xl border-t bg-card/60 p-4">
        <Button type="submit">Next</Button>
      </div>
    </div>
  );
}
