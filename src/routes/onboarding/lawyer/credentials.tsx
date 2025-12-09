// ============================================
// Step 2: Bar Admission & Licenses
// onboarding/lawyer/credentials.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLawyerOnboardingStore } from "@/hooks/lawyer-onboarding";
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/onboarding/lawyer/credentials")({
  component: LawyerCredentialsStep,
});

function LawyerCredentialsStep() {
  const router = useRouter();
  const {
    barNumber,
    admissionYear,
    lawSchool,
    graduationYear,
    currentFirm,
    yearsOfExperience,
    setBarNumber,
    setAdmissionYear,
    setLawSchool,
    setGraduationYear,
    setCurrentFirm,
    updateLastSaved,
  } = useLawyerOnboardingStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!barNumber.trim()) {
      newErrors.barNumber = "Bar association number is required";
    }

    if (!admissionYear) {
      newErrors.admissionYear = "Year of admission is required";
    } else if (admissionYear > currentYear) {
      newErrors.admissionYear = "Admission year cannot be in the future";
    } else if (admissionYear < currentYear - 70) {
      newErrors.admissionYear = "Please enter a valid year";
    }

    if (!lawSchool.trim()) {
      newErrors.lawSchool = "Law school is required";
    }

    if (!graduationYear) {
      newErrors.graduationYear = "Graduation year is required";
    } else if (graduationYear > currentYear) {
      newErrors.graduationYear = "Graduation year cannot be in the future";
    } else if (admissionYear && graduationYear > admissionYear) {
      newErrors.graduationYear =
        "Graduation year must be before or equal to admission year";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateLastSaved();
    router.navigate({ to: "/onboarding/lawyer/specializations" });
  };

  const handleBack = () => {
    router.navigate({ to: "/onboarding/lawyer/basics" });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step 2 of 4</span>
          <span className="text-sm text-gray-500">
            Professional Credentials
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/2"></div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📜</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Professional Credentials
        </h2>
        <p className="text-gray-600">
          Help clients trust your expertise with verified credentials
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Bar Number */}
        <Field className="gap-2">
          <FieldLabel htmlFor="name">Bar Association Number *</FieldLabel>
          <Input placeholder="e.g., 123456"
            className={errors.barNumber ? "border-red-500" : ""}
          />
          <FieldDescription className="text-gray-500 text-xs mt-1">
            We'll verify this with your state bar association
          </FieldDescription>
        </Field>

        <Field className="gap-2">
          <FieldLabel>Year of Bar Admission *</FieldLabel>
          <Select items={years}
          >
            <SelectTrigger className="max-w-xs w-full">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectPositioner alignItemWithTrigger>
              <SelectContent className={"w-full"}>
                {years.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </Field>

        {
          yearsOfExperience !== null && (
            <div className="bg-gray-50 border border-stone-200 rounded-lg px-3 py-3">
              <p className="text-base font-medium text-green-900">
                Years of Experience: {yearsOfExperience} years
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Calculated from your admission year
              </p>
            </div>
          )
        }

        <Field className="gap-2">
          <FieldLabel htmlFor="name">Law School *</FieldLabel>
          <Input placeholder="e.g., Harvard Law School" />
        </Field>

        <Field className="gap-2">
          <FieldLabel>Graduation Year *</FieldLabel>
          <Select items={years}>
            <SelectTrigger className="max-w-xs w-full">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectPositioner alignItemWithTrigger>
              <SelectContent className={"w-full"}>
                {years.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>

        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="name">
            Current Law Firm / Practice
            <span className="text-gray-400 font-normal">(Optional)</span>
          </FieldLabel>
          <Input
            placeholder="e.g. Smith & Associates LLP"
          />
          <FieldDescription className="text-gray-500 text-xs mt-1">
            Leave blank if you're a solo practitioner
          </FieldDescription>
        </Field>

      </div >

      {/* Action Buttons */}
      < div className="flex gap-3 mt-8" >
        <Button variant="outline" onClick={handleBack} className="w-32">
          ← Back
        </Button>
        <Button
          onClick={validateAndNext}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue to Specializations →
        </Button>
      </div >

      {/* Security Notice */}
      < div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4" >
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="text-sm font-medium text-green-900">
              Verified Professional Profile
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your credentials will be verified by our team before your profile
              goes live. This helps maintain trust and quality on our platform.
            </p>
          </div>
        </div>
      </div >
    </div >
  );
}
