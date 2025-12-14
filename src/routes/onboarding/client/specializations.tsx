import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import type {
  OnBoardingRequest, OnboardingStatusResponse
} from "@/lib/api/client";
import {

  api
} from "@/lib/api/client";
import {
  clearOnboardingStore,
  useOnboardingClientStore
} from "@/stores/onBoardingClient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RegisterSpecializations } from "@/components/onboarding/specializations";

export const Route = createFileRoute("/onboarding/client/specializations")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { country, state, specializations, resetForm } = useOnboardingClientStore();
  const [error, setError] = useState<string | null>(null);

  const completeMutation = useMutation({
    mutationFn: async (data: OnBoardingRequest) => {
      return api.client.completeOnBoarding(data);
    },
    onSuccess: (updatedUser) => {
      // Update the query cache with new user data
      queryClient.setQueryData(["user", "session"], updatedUser);
      queryClient.setQueryData<OnboardingStatusResponse>(["boarding"], {
        success: true,
        onboarding_completed: true,
      });

      // Clear form data from Zustand state
      resetForm();

      // IMPORTANT: Clear persisted data from localStorage
      clearOnboardingStore();

      // Redirect to dashboard
      navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      console.error("Onboarding error:", error);
    },
  });

  const handleSubmit = async () => {
    if (specializations.length === 0) {
      setError("Please select at least one specialization");
      return;
    }

    if (specializations.length > 3) {
      setError("Please select a maximum of 3 specializations");
      return;
    }

    setError(null);

    completeMutation.mutate({
      country,
      state,
      specializationIds: specializations,
    });
  };

  const handleBack = () => {
    navigate({ to: "/onboarding/client/location" });
  };

  return (
    <div className="flex flex-col md:flex-row justify-around gap-8 px-6 md:px-48 py-16">
      <div className="md:flex-2/5 space-y-2">
        <h2 className="text-2xl/snug md:text-3xl/snug font-medium">
          Hey there! To start, please choose up to three categories that reflect
          your legal expertise.
        </h2>
        <p className="text-muted-foreground">
          Your specialization selection helps us recommend relevant
          opportunities and connect you with the right clients.
        </p>

        {/* Selected data preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Your Location:
          </p>
          <p className="text-sm text-gray-600">
            {country}
            {state ? `, ${state}` : ""}
          </p>
          <Button
            variant="link"
            onClick={handleBack}
            className="pl-0 text-sm text-blue-500 hover:text-blue-600 mt-2"
          >
            Change location
          </Button>
        </div>
      </div>

      <div className="md:flex-3/5 md:min-w-lg">
        <RegisterSpecializations />
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {completeMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to complete onboarding. Please try again.
          </div>
        )}

        <Separator className="my-6" />

        <div className="flex gap-3">
          <Button
            variant="outline"
            size={"lg"}
            onClick={handleBack}
            disabled={completeMutation.isPending}
            className="w-32"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} />
            Back
          </Button>

          <Button
            className="flex-1"
            size={"lg"}
            onClick={handleSubmit}
            disabled={
              completeMutation.isPending || specializations.length === 0
            }
          >
            {completeMutation.isPending ? "Saving..." : "Choose and Continue"}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-sm text-gray-500 text-center mt-4">
          {specializations.length === 0
            ? "Select at least one specialization to continue"
            : `${specializations.length} of 3 specializations selected`}
        </p>
      </div>
    </div>
  );
}
