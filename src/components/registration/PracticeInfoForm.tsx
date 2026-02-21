import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NIGERIA_STATES } from "@/constants/nigeria-states-lgas";
import {
  PRACTICE_TYPE_OPTIONS,
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from "@/constants/registration";
import {
  usePracticeInfo,
  useSavePracticeInfo,
} from "@/hooks/use-registration";
import { useSpecializations } from "@/hooks/use-specializations";
import { useToast } from "@/hooks/use-toast";
import type { PracticeInfoFormData } from "@/lib/api/registration";
import { practiceInfoSchema } from "@/lib/schemas/registration";
import { cn } from "@/lib/utils";
import { useRegistrationStore } from "@/stores/registration-store";

/**
 * PracticeInfoForm Component
 *
 * Step 5 of the lawyer registration process.
 * Handles practice information collection including practice type,
 * firm name (conditional), practice areas, states of practice, and office address.
 *
 * Features:
 * - Practice type selection (solo/firm)
 * - Conditional firm name validation
 * - Multi-select for practice areas
 * - Multi-select for states of practice
 * - Office address, city, and state inputs
 * - Pre-fills form with existing data
 * - Integrates with useSavePracticeInfo mutation
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
 */
export function PracticeInfoForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep5Data, setRegistrationStatus, step5Data } =
    useRegistrationStore();
  const savePracticeInfoMutation = useSavePracticeInfo();
  const { data: existingData, refetch } = usePracticeInfo();
  const { data: specializationsData, isLoading: isLoadingSpecializations } = useSpecializations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PracticeInfoFormData>({
    resolver: zodResolver(practiceInfoSchema),
    mode: "onBlur",
    defaultValues: {
      practiceType: "solo",
      firmName: "",
      practiceAreas: [],
      statesOfPractice: [],
      officeAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
      },
    },
  });

  const watchedPracticeType = watch("practiceType");
  const watchedPracticeAreas = watch("practiceAreas");
  const watchedStatesOfPractice = watch("statesOfPractice");

  // Requirement 5.1: Fetch existing data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Requirement 5.1: Pre-fill form with existing data
  useEffect(() => {
    if (existingData) {
      setValue("practiceType", existingData.practiceType || "solo");
      setValue("firmName", existingData.firmName || "");
      setValue("practiceAreas", existingData.practiceAreas || []);
      setValue("statesOfPractice", existingData.statesOfPractice || []);
      if (existingData.officeAddress) {
        setValue("officeAddress", existingData.officeAddress);
      }
    } else if (step5Data && Object.keys(step5Data).length > 0) {
      if (step5Data.practiceType)
        setValue("practiceType", step5Data.practiceType);
      if (step5Data.firmName) setValue("firmName", step5Data.firmName);
      if (step5Data.practiceAreas)
        setValue("practiceAreas", step5Data.practiceAreas);
      if (step5Data.statesOfPractice)
        setValue("statesOfPractice", step5Data.statesOfPractice);
      if (step5Data.officeAddress)
        setValue("officeAddress", step5Data.officeAddress);
    }
  }, [existingData, step5Data, setValue]);

  const onSubmit = async (data: PracticeInfoFormData) => {
    try {
      // Update local store
      updateStep5Data(data);

      // Requirement 5.7: Save practice information to backend
      const response = await savePracticeInfoMutation.mutateAsync(data);

      // Requirement 5.8: Update registration status
      setRegistrationStatus(response.registration_status);

      toast({
        title: "Success",
        description: REGISTRATION_SUCCESS_MESSAGES.PRACTICE_INFO_SAVED,
      });

      // Requirement 5.9: Navigate to Step 6 (Review & Submit, formerly step 7)
      navigate({ to: "/register/step7" });
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
            Practice Information
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Provide details about your legal practice and specializations
          </p>
        </div>

        {/* Practice Type Field */}
        {/* Requirement 5.2, 5.3: Practice type selection */}
        <div className="space-y-2">
          <Label htmlFor="practiceType" className="required">
            Practice Type
          </Label>
          <Select
            value={watch("practiceType")}
            onValueChange={(value) =>
              setValue(
                "practiceType",
                value as PracticeInfoFormData["practiceType"],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger
              id="practiceType"
              className={cn("w-full", errors.practiceType ? "border-red-500" : "")}
              aria-invalid={errors.practiceType ? "true" : "false"}
              aria-describedby={
                errors.practiceType
                  ? "practiceType-error practiceType-help"
                  : "practiceType-help"
              }
              aria-required="true"
            >
              <SelectValue placeholder="Select practice type" />
            </SelectTrigger>
            <SelectContent>
              {PRACTICE_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p id="practiceType-help" className="text-gray-500 text-xs">
            Are you a solo practitioner or part of a law firm?
          </p>
          {errors.practiceType && (
            <p
              id="practiceType-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.practiceType.message}
            </p>
          )}
        </div>

        {/* Firm Name Field (Conditional) */}
        {/* Requirement 5.2: Conditional firm name validation */}
        {watchedPracticeType === "firm" && (
          <div className="space-y-2">
            <Label htmlFor="firmName" className="required">
              Firm Name
            </Label>
            <Input
              id="firmName"
              type="text"
              placeholder="Enter your law firm name"
              {...register("firmName")}
              aria-invalid={errors.firmName ? "true" : "false"}
              aria-describedby={
                errors.firmName
                  ? "firmName-error firmName-help"
                  : "firmName-help"
              }
              aria-required="true"
              className={errors.firmName ? "border-red-500" : ""}
            />
            <p id="firmName-help" className="text-gray-500 text-xs">
              The name of the law firm you practice with
            </p>
            {errors.firmName && (
              <p
                id="firmName-error"
                className="text-red-600 text-sm"
                role="alert"
              >
                {errors.firmName.message}
              </p>
            )}
          </div>
        )}

        {/* Practice Areas Multi-Select */}
        {/* Requirement 5.4: Multi-select for practice areas */}
        <div className="space-y-2">
          <Label htmlFor="practiceAreas" className="required">
            Practice Areas
          </Label>
          <MultiSelect
            values={watchedPracticeAreas}
            onValuesChange={(values) =>
              setValue("practiceAreas", values, { shouldValidate: true })
            }
            disabled={isLoadingSpecializations}
          >
            <MultiSelectTrigger
              id="practiceAreas"
              className={errors.practiceAreas ? "border-red-500" : ""}
              aria-invalid={errors.practiceAreas ? "true" : "false"}
              aria-describedby={
                errors.practiceAreas
                  ? "practiceAreas-error practiceAreas-help"
                  : "practiceAreas-help"
              }
              aria-required="true"
            >
              <MultiSelectValue 
                placeholder={isLoadingSpecializations ? "Loading practice areas..." : "Select practice areas"} 
              />
            </MultiSelectTrigger>
            <MultiSelectContent
              search={{
                placeholder: "Search practice areas...",
                emptyMessage: "No practice areas found",
              }}
            >
              {specializationsData?.specializations?.map((area) => (
                <MultiSelectItem
                  key={area.id}
                  value={area.id}
                  badgeLabel={area.name}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{area.name}</span>
                    {area.description && (
                      <span className="text-muted-foreground text-xs">
                        {area.description}
                      </span>
                    )}
                  </div>
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
          <p id="practiceAreas-help" className="text-gray-500 text-xs">
            Select all areas of law you practice (at least one required)
          </p>
          {errors.practiceAreas && (
            <p
              id="practiceAreas-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.practiceAreas.message}
            </p>
          )}
        </div>

        {/* States of Practice Multi-Select */}
        {/* Requirement 5.5: Multi-select for states of practice */}
        <div className="space-y-2">
          <Label htmlFor="statesOfPractice" className="required">
            States of Practice
          </Label>
          <MultiSelect
            values={watchedStatesOfPractice}
            onValuesChange={(values) =>
              setValue("statesOfPractice", values, { shouldValidate: true })
            }
          >
            <MultiSelectTrigger
              id="statesOfPractice"
              className={errors.statesOfPractice ? "border-red-500" : ""}
              aria-invalid={errors.statesOfPractice ? "true" : "false"}
              aria-describedby={
                errors.statesOfPractice
                  ? "statesOfPractice-error statesOfPractice-help"
                  : "statesOfPractice-help"
              }
              aria-required="true"
            >
              <MultiSelectValue placeholder="Select states" />
            </MultiSelectTrigger>
            <MultiSelectContent
              search={{
                placeholder: "Search states...",
                emptyMessage: "No states found",
              }}
            >
              {NIGERIA_STATES.map((state) => (
                <MultiSelectItem
                  key={state.code}
                  value={state.code}
                  badgeLabel={state.name}
                >
                  {state.name}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
          <p id="statesOfPractice-help" className="text-gray-500 text-xs">
            Select all states where you practice law (at least one required)
          </p>
          {errors.statesOfPractice && (
            <p
              id="statesOfPractice-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.statesOfPractice.message}
            </p>
          )}
        </div>

        {/* Office Address Fields */}
        {/* Requirement 5.6: Office address input */}
        <div className="space-y-2">
          <Label htmlFor="officeAddress.street" className="required">
            Street Address
          </Label>
          <Textarea
            id="officeAddress.street"
            placeholder="Enter your office street address"
            rows={2}
            {...register("officeAddress.street")}
            aria-invalid={errors.officeAddress?.street ? "true" : "false"}
            aria-describedby={
              errors.officeAddress?.street
                ? "officeAddress.street-error officeAddress.street-help"
                : "officeAddress.street-help"
            }
            aria-required="true"
            className={errors.officeAddress?.street ? "border-red-500" : ""}
          />
          <p id="officeAddress.street-help" className="text-gray-500 text-xs">
            Your primary office or practice location street address
          </p>
          {errors.officeAddress?.street && (
            <p
              id="officeAddress.street-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.officeAddress.street.message}
            </p>
          )}
        </div>

        {/* Office City and Postal Code */}
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="officeAddress.city" className="required">
              City
            </Label>
            <Input
              id="officeAddress.city"
              type="text"
              placeholder="Enter city"
              {...register("officeAddress.city")}
              aria-invalid={errors.officeAddress?.city ? "true" : "false"}
              aria-describedby={
                errors.officeAddress?.city
                  ? "officeAddress.city-error officeAddress.city-help"
                  : "officeAddress.city-help"
              }
              aria-required="true"
              className={errors.officeAddress?.city ? "border-red-500" : ""}
            />
            <p id="officeAddress.city-help" className="text-gray-500 text-xs">
              The city where your office is located
            </p>
            {errors.officeAddress?.city && (
              <p
                id="officeAddress.city-error"
                className="text-red-600 text-sm"
                role="alert"
              >
                {errors.officeAddress.city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeAddress.postalCode" className="required">
              Postal Code
            </Label>
            <Input
              id="officeAddress.postalCode"
              type="text"
              placeholder="Enter 6-digit postal code"
              maxLength={6}
              {...register("officeAddress.postalCode")}
              aria-invalid={errors.officeAddress?.postalCode ? "true" : "false"}
              aria-describedby={
                errors.officeAddress?.postalCode
                  ? "officeAddress.postalCode-error officeAddress.postalCode-help"
                  : "officeAddress.postalCode-help"
              }
              aria-required="true"
              className={errors.officeAddress?.postalCode ? "border-red-500" : ""}
            />
            <p id="officeAddress.postalCode-help" className="text-gray-500 text-xs">
              6-digit postal code
            </p>
            {errors.officeAddress?.postalCode && (
              <p
                id="officeAddress.postalCode-error"
                className="text-red-600 text-sm"
                role="alert"
              >
                {errors.officeAddress.postalCode.message}
              </p>
            )}
          </div>
        </div>

        {/* Office State Field */}
        {/* Requirement 5.6: Office state input */}
        <div className="space-y-2">
          <Label htmlFor="officeAddress.state" className="required">
            State
          </Label>
          <Select
            value={watch("officeAddress.state")}
            onValueChange={(value) =>
              setValue("officeAddress.state", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              id="officeAddress.state"
              className={cn("w-full", errors.officeAddress?.state ? "border-red-500" : "")}
              aria-invalid={errors.officeAddress?.state ? "true" : "false"}
              aria-describedby={
                errors.officeAddress?.state
                  ? "officeAddress.state-error officeAddress.state-help"
                  : "officeAddress.state-help"
              }
              aria-required="true"
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIA_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p id="officeAddress.state-help" className="text-gray-500 text-xs">
            The state where your office is located
          </p>
          {errors.officeAddress?.state && (
            <p
              id="officeAddress.state-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.officeAddress.state.message}
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
          aria-label="Save practice information and continue to next step"
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
