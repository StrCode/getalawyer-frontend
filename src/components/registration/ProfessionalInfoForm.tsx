import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from "@/constants/registration";
import {
  useProfessionalInfo,
  useSaveProfessionalInfo,
} from "@/hooks/use-registration";
import { useToast } from "@/hooks/use-toast";
import type { ProfessionalInfoFormData } from "@/lib/api/registration";
import { professionalInfoSchema } from "@/lib/schemas/registration";
import { useRegistrationStore } from "@/stores/registration-store";

/**
 * ProfessionalInfoForm Component
 *
 * Step 4 of the lawyer registration process.
 * Handles professional information collection including bar number,
 * year of call, law school, university, and LLB graduation year.
 *
 * Features:
 * - Bar number input
 * - Year of call input with validation
 * - Law school input
 * - University input
 * - LLB graduation year input with validation
 * - Year ordering validation (year of call >= LLB year)
 * - Future date prevention
 * - Pre-fills form with existing data
 * - Integrates with useSaveProfessionalInfo mutation
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export function ProfessionalInfoForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep4Data, setRegistrationStatus, step4Data } =
    useRegistrationStore();
  const saveProfessionalInfoMutation = useSaveProfessionalInfo();
  const { data: existingData, refetch } = useProfessionalInfo();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(professionalInfoSchema),
    mode: "onBlur",
    defaultValues: {
      barNumber: "",
      yearOfCall: new Date().getFullYear(),
      lawSchool: "",
      university: "",
      llbYear: new Date().getFullYear(),
    },
  });

  // Requirement 4.1: Fetch existing data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Requirement 4.1: Pre-fill form with existing data
  useEffect(() => {
    if (existingData) {
      setValue("barNumber", existingData.barNumber || "");
      setValue(
        "yearOfCall",
        existingData.yearOfCall || new Date().getFullYear(),
      );
      setValue("lawSchool", existingData.lawSchool || "");
      setValue("university", existingData.university || "");
      setValue("llbYear", existingData.llbYear || new Date().getFullYear());
    } else if (step4Data && Object.keys(step4Data).length > 0) {
      if (step4Data.barNumber) setValue("barNumber", step4Data.barNumber);
      if (step4Data.yearOfCall) setValue("yearOfCall", step4Data.yearOfCall);
      if (step4Data.lawSchool) setValue("lawSchool", step4Data.lawSchool);
      if (step4Data.university) setValue("university", step4Data.university);
      if (step4Data.llbYear) setValue("llbYear", step4Data.llbYear);
    }
  }, [existingData, step4Data, setValue]);

  const onSubmit = async (data: ProfessionalInfoFormData) => {
    try {
      // Update local store
      updateStep4Data(data);

      // Requirement 4.5: Save professional information to backend
      const response = await saveProfessionalInfoMutation.mutateAsync(data);

      // Requirement 4.6: Update registration status
      setRegistrationStatus(response.registration_status);

      toast({
        title: "Success",
        description: REGISTRATION_SUCCESS_MESSAGES.PROFESSIONAL_INFO_SAVED,
      });

      // Requirement 4.7: Navigate to Step 5
      navigate({ to: "/register/step5" });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">
            Professional Information
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Provide your professional credentials and qualifications
          </p>
        </div>

        {/* Bar Number Field */}
        {/* Requirement 4.2: Bar number input */}
        <div className="space-y-2">
          <Label htmlFor="barNumber" className="required">
            Bar Number
          </Label>
          <Input
            id="barNumber"
            type="text"
            placeholder="Enter your bar number"
            {...register("barNumber")}
            aria-invalid={errors.barNumber ? "true" : "false"}
            aria-describedby={
              errors.barNumber
                ? "barNumber-error barNumber-help"
                : "barNumber-help"
            }
            aria-required="true"
            className={errors.barNumber ? "border-red-500" : ""}
          />
          <p id="barNumber-help" className="text-gray-500 text-xs">
            Your unique bar association registration number
          </p>
          {errors.barNumber && (
            <p
              id="barNumber-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.barNumber.message}
            </p>
          )}
        </div>

        {/* Year of Call Field */}
        {/* Requirement 4.2: Year of call input with validation */}
        {/* Requirement 4.3: Year ordering validation */}
        {/* Requirement 4.4: Future date prevention */}
        <div className="space-y-2">
          <Label htmlFor="yearOfCall" className="required">
            Year of Call to Bar
          </Label>
          <Input
            id="yearOfCall"
            type="number"
            placeholder="Enter year of call"
            min={1950}
            max={new Date().getFullYear()}
            {...register("yearOfCall", { valueAsNumber: true })}
            aria-invalid={errors.yearOfCall ? "true" : "false"}
            aria-describedby={
              errors.yearOfCall
                ? "yearOfCall-error yearOfCall-help"
                : "yearOfCall-help"
            }
            aria-required="true"
            className={errors.yearOfCall ? "border-red-500" : ""}
          />
          <p id="yearOfCall-help" className="text-gray-500 text-xs">
            The year you were called to the bar
          </p>
          {errors.yearOfCall && (
            <p
              id="yearOfCall-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.yearOfCall.message}
            </p>
          )}
        </div>

        {/* Law School Field */}
        {/* Requirement 4.2: Law school input */}
        <div className="space-y-2">
          <Label htmlFor="lawSchool" className="required">
            Law School
          </Label>
          <Input
            id="lawSchool"
            type="text"
            placeholder="Enter your law school name"
            {...register("lawSchool")}
            aria-invalid={errors.lawSchool ? "true" : "false"}
            aria-describedby={
              errors.lawSchool
                ? "lawSchool-error lawSchool-help"
                : "lawSchool-help"
            }
            aria-required="true"
            className={errors.lawSchool ? "border-red-500" : ""}
          />
          <p id="lawSchool-help" className="text-gray-500 text-xs">
            The Nigerian Law School you attended
          </p>
          {errors.lawSchool && (
            <p
              id="lawSchool-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.lawSchool.message}
            </p>
          )}
        </div>

        {/* University Field */}
        {/* Requirement 4.2: University input */}
        <div className="space-y-2">
          <Label htmlFor="university" className="required">
            University
          </Label>
          <Input
            id="university"
            type="text"
            placeholder="Enter your university name"
            {...register("university")}
            aria-invalid={errors.university ? "true" : "false"}
            aria-describedby={
              errors.university
                ? "university-error university-help"
                : "university-help"
            }
            aria-required="true"
            className={errors.university ? "border-red-500" : ""}
          />
          <p id="university-help" className="text-gray-500 text-xs">
            The university where you obtained your LLB degree
          </p>
          {errors.university && (
            <p
              id="university-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.university.message}
            </p>
          )}
        </div>

        {/* LLB Graduation Year Field */}
        {/* Requirement 4.2: LLB year input with validation */}
        {/* Requirement 4.3: Year ordering validation */}
        {/* Requirement 4.4: Future date prevention */}
        <div className="space-y-2">
          <Label htmlFor="llbYear" className="required">
            LLB Graduation Year
          </Label>
          <Input
            id="llbYear"
            type="number"
            placeholder="Enter LLB graduation year"
            min={1950}
            max={new Date().getFullYear()}
            {...register("llbYear", { valueAsNumber: true })}
            aria-invalid={errors.llbYear ? "true" : "false"}
            aria-describedby={
              errors.llbYear ? "llbYear-error llbYear-help" : "llbYear-help"
            }
            aria-required="true"
            className={errors.llbYear ? "border-red-500" : ""}
          />
          <p id="llbYear-help" className="text-gray-500 text-xs">
            The year you graduated with your LLB degree
          </p>
          {errors.llbYear && (
            <p id="llbYear-error" className="text-red-600 text-sm" role="alert">
              {errors.llbYear.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          aria-label="Save professional information and continue to next step"
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 w-4 h-4 animate-spin"
                aria-hidden="true"
              />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  );
}
