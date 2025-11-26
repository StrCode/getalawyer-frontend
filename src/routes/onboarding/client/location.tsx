import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useOnboardingStore } from "@/lib/onboardingStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding/client/location")({
  component: OnboardingStep1,
});

function OnboardingStep1() {
  const router = useRouter();
  const { country, state, setCountry, setState } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch data using the custom hook
  // const { data, isLoading, isError } = useCountriesWithStates();

  // 2. Safely access the transformed data
  // const COUNTRIES = data?.countries || [];
  // const STATES_BY_COUNTRY = data?.statesByCountry || {};
  // const availableStates = country ? STATES_BY_COUNTRY[country] || [] : [];

  // TEMPORARY: Mock data until you uncomment the hook above
  const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
  ];

  const STATES_BY_COUNTRY: Record<string, Array<{ value: string; label: string }>> = {
    US: [
      { value: "CA", label: "California" },
      { value: "NY", label: "New York" },
      { value: "TX", label: "Texas" },
      { value: "FL", label: "Florida" },
    ],
    CA: [
      { value: "ON", label: "Ontario" },
      { value: "QC", label: "Quebec" },
      { value: "BC", label: "British Columbia" },
    ],
  };

  const availableStates = country ? STATES_BY_COUNTRY[country] || [] : [];
  const isLoading = false;
  const isError = false;

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!country) newErrors.country = "Please select a country";
    // Only validate state if the selected country actually has states defined
    if (availableStates.length > 0 && !state) {
      newErrors.state = "Please select a state/region";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Navigate to next step
    router.navigate({ to: "/onboarding/client/specialization" });
  };

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading location data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Error loading data.</p>
        <p className="text-red-500 text-sm">Please check your internet connection or refresh the page.</p>
      </div>
    );
  }
  // ------------------------------------

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where are you located?
        </h2>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </div>

      {/* Country Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country *
        </label>
        <select
          value={country}
          // Reset state when country changes
          onChange={(e) => {
            setCountry(e.target.value);
            setState("");
            setErrors({});
          }}
          className={`w-full p-3 border rounded-lg bg-white ${errors.country ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="text-red-500 text-sm mt-1">{errors.country}</p>
        )}
      </div>

      {
        country && availableStates.length > 0 && (
          <div className="animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State / Region *
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setErrors({});
              }}
              className={`w-full p-3 border rounded-lg bg-white ${errors.state ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Select a state/region</option>
              {availableStates.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        )
      }
      {
        country && availableStates.length === 0 && (
          <p className="text-gray-500 text-sm mt-1">
            No states or regions are listed for this country.
          </p>
        )
      }

      <Button
        onClick={validateAndNext}
        // Disable button while loading or if data failed to load
        disabled={isLoading || isError}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Continue to Specializations →
      </Button>
    </div >
  );
}
