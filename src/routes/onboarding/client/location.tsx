import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useOnboardingStore } from "@/lib/onboardingStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCountriesWithStates } from "@/hooks/use-countries";
import {
	Select,
	SelectItem,
	SelectPositioner,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export const Route = createFileRoute("/onboarding/client/location")({
	component: OnboardingStep1,
});

function OnboardingStep1() {
	const router = useRouter();
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
		router.navigate({ to: "/onboarding/client/specialization" });
	};

	// --- Loading State ---
	if (isLoading) {
		return (
			<div className="text-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p className="text-gray-600">Loading location data...</p>
			</div>
		);
	}

	// --- Error State ---
	if (isError) {
		return (
			<div className="text-center py-20 bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-700 font-medium">Error loading data.</p>
				<p className="text-red-500 text-sm">
					Please check your internet connection or refresh the page.
				</p>
			</div>
		);
	}

	return (
		<div className="px-10 md:px-120 py-16 space-y-6">
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
			<Field>
				<FieldLabel>Country *</FieldLabel>
				<Select
					value={country}
					onValueChange={handleCountryChange}
					items={countries}
				>
					<SelectTrigger className={errors.country ? "border-red-500" : ""}>
						<SelectValue />
					</SelectTrigger>
					<SelectPositioner alignItemWithTrigger={false}>
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
				<Field className="animate-fadeIn">
					<FieldLabel>State / Region *</FieldLabel>
					<Select
						value={state}
						onValueChange={handleStateChange}
						items={availableStates}
					>
						<SelectTrigger className={errors.state ? "border-red-500" : ""}>
							<SelectValue />
						</SelectTrigger>
						<SelectPositioner alignItemWithTrigger={false}>
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
				<p className="text-gray-500 text-sm">
					No states or regions are listed for this country.
				</p>
			)}

			<Button
				onClick={validateAndNext}
				disabled={isLoading || isError}
				className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
			>
				Continue to Specializations →
			</Button>
		</div>
	);
}
