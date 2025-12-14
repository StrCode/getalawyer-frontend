// ============================================
// Step 2: Bar Admission & Licenses
// onboarding/lawyer/credentials.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod/v4";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, File02Icon, FileSyncIcon, Upload02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLawyerOnboardingStore } from "@/stores/onBoardingLawyer";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/form";
import { toastManager } from "@/components/ui/toast";

export const Route = createFileRoute("/onboarding/lawyer/credentials")({
  component: LawyerCredentialsStep,
});

// Validation schema
const credentialsSchema = z.object({
  barNumber: z.string().min(3, { message: "Bar association number is required (min 3 characters)" }),
  admissionYear: z.number({
    required_error: "Year of admission is required",
    invalid_type_error: "Please select a valid year"
  }).int(),
  lawSchool: z.string().min(3, { message: "Law school is required (min 3 characters)" }),
  graduationYear: z.number({
    required_error: "Graduation year is required",
    invalid_type_error: "Please select a valid year"
  }).int(),
  currentFirm: z.string().optional(),
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.admissionYear <= currentYear;
}, {
  message: "Admission year cannot be in the future",
  path: ["admissionYear"],
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.admissionYear >= currentYear - 70;
}, {
  message: "Please enter a valid admission year",
  path: ["admissionYear"],
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.graduationYear <= currentYear;
}, {
  message: "Graduation year cannot be in the future",
  path: ["graduationYear"],
}).refine((data) => {
  return data.graduationYear <= data.admissionYear;
}, {
  message: "Graduation year must be before or equal to admission year",
  path: ["graduationYear"],
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

function LawyerCredentialsStep() {
  const router = useRouter();
  const {
    barNumber,
    admissionYear,
    lawSchool,
    graduationYear,
    currentFirm,
    barCertificate,
    setBarNumber,
    setAdmissionYear,
    setLawSchool,
    setGraduationYear,
    setCurrentFirm,
    setBarCertificate,
    updateLastSaved,
  } = useLawyerOnboardingStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(barCertificate || null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  // Calculate years of experience
  const calculateExperience = (year: number | null) => {
    if (!year) return null;
    return currentYear - year;
  };

  // Initialize form
  const form = useAppForm({
    defaultValues: {
      barNumber: barNumber || "",
      admissionYear: admissionYear || undefined,
      lawSchool: lawSchool || "",
      graduationYear: graduationYear || undefined,
      currentFirm: currentFirm || "",
    },
    validators: {
      onBlur: credentialsSchema,
    },
    onSubmit: async ({ value }) => {
      // Save to Zustand store
      setBarNumber(value.barNumber);
      setAdmissionYear(value.admissionYear);
      setLawSchool(value.lawSchool);
      setGraduationYear(value.graduationYear);
      setCurrentFirm(value.currentFirm || "");

      // Save file if uploaded
      if (uploadedFile) {
        // In a real app, you'd upload to a server here
        // For now, we'll store a data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setBarCertificate(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
      }

      updateLastSaved();

      toastManager.add({
        title: "Credentials saved",
        description: "Your professional credentials have been saved.",
        type: "success",
      });

      router.navigate({ to: "/onboarding/lawyer/specializations" });
    },
  });

  const selectedAdmissionYear = 1998;
  const yearsOfExperience = calculateExperience(selectedAdmissionYear);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toastManager.add({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file",
        type: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastManager.add({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        type: "error",
      });
      return;
    }

    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setBarCertificate(null);
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
          <span className="text-sm text-gray-500">Professional Credentials</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/2"></div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Professional Credentials
        </h2>
        <p className="text-sm text-gray-600">
          Help clients trust your expertise with verified credentials
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
        <div className="space-y-6">
          {/* Bar Credentials Section */}
          <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Bar Admission</h3>

            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <form.AppField name="barNumber">
                {(field) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="barNumber">Bar Association Number *</FieldLabel>
                    <Input
                      id="barNumber"
                      placeholder="e.g., 123456"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                    />
                    <FieldDescription className="text-xs">
                      We'll verify this with your state bar association
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

              <form.AppField name="admissionYear">
                {(field) => (
                  <Field className="gap-2">
                    <FieldLabel>Year of Bar Admission *</FieldLabel>
                    <Select
                      value={field.state.value?.toString()}
                      onValueChange={(value) => {
                        field.handleChange(parseInt(value));
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger
                        className={
                          field.state.meta.isTouched && field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select a year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            {/* Years of Experience Display */}
            {yearsOfExperience !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-green-900">
                  Years of Experience: {yearsOfExperience} years
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Calculated from your admission year
                </p>
              </div>
            )}

            {/* Bar Certificate Upload */}
            <Field className="gap-2">
              <FieldLabel>Bar Certificate Upload (Optional)</FieldLabel>

              {!filePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="barCertificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="barCertificate" className="cursor-pointer">
                    <HugeiconsIcon icon={Upload02Icon} className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload bar certificate
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, or PNG (Max 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon icon={FileSyncIcon} className="h-8 w-8 text-blue-500" />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile?.name || "Bar Certificate"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : "Uploaded"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <FieldDescription className="text-xs">
                Upload a copy of your bar certificate for faster verification
              </FieldDescription>
            </Field>
          </div>

          {/* Education Section */}
          <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>

            <form.AppField name="lawSchool">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="lawSchool">Law School *</FieldLabel>
                  <Input
                    id="lawSchool"
                    placeholder="e.g., Harvard Law School"
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

            <form.AppField name="graduationYear">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel>Graduation Year *</FieldLabel>
                  <Select
                    value={field.state.value?.toString()}
                    onValueChange={(value) => {
                      field.handleChange(parseInt(value));
                      field.handleBlur();
                    }}
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.isTouched && field.state.meta.errors.length > 0
                          ? "border-red-500 max-w-xs"
                          : "max-w-xs"
                      }
                    >
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          </div>

          {/* Current Practice Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Current Practice</h3>

            <form.AppField name="currentFirm">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="currentFirm">
                    Current Law Firm / Practice{" "}
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </FieldLabel>
                  <Input
                    id="currentFirm"
                    placeholder="e.g., Smith & Associates LLP"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldDescription className="text-xs">
                    Leave blank if you're a solo practitioner
                  </FieldDescription>
                </Field>
              )}
            </form.AppField>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-32"
          >
            ← Back
          </Button>
          <Button
            type="submit"
            disabled={form.state.isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {form.state.isSubmitting ? "Saving..." : "Continue to Specializations →"}
          </Button>
        </div>

        {/* Verification Info */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
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
        </div>
      </form>
    </div>
  );
}
