import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useOnboardingStore } from "@/lib/onboardingStore";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/data/location";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding/lawyer/location")({
	component: OnboardingStep1,
});

function OnboardingStep1() {
	const router = useRouter();
	const { country, state, setCountry, setState } = useOnboardingStore();
	const [errors, setErrors] = useState<Record<string, string>>({});

	const availableStates = country ? STATES_BY_COUNTRY[country] || [] : [];

	const validateAndNext = () => {
		const newErrors: Record<string, string> = {};

		if (!country) newErrors.country = "Please select a country";
		if (!state) newErrors.state = "Please select a state/region";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		router.navigate({ to: "/onboarding/specialization" });
	};

	return (
		<div className="space-y-6">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">Step 1 of 2</span>
					<span className="text-sm text-gray-500">Location</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/2"></div>
				</div>
			</div>

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
					onChange={(e) => setCountry(e.target.value)}
					className={`w-full p-3 border rounded-lg bg-white ${
						errors.country ? "border-red-500" : "border-gray-300"
					}`}
				>
					<option value="">Select a country</option>
					{COUNTRIES.map((country) => (
						<option key={country.value} value={country.value}>
							{country.label}
						</option>
					))}
				</select>
				{errors.country && (
					<p className="text-red-500 text-sm mt-1">{errors.country}</p>
				)}
			</div>

			{/* State/Region Select - Only show if country is selected */}
			{country && (
				<div className="animate-fadeIn">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						State / Region *
					</label>
					<select
						value={state}
						onChange={(e) => setState(e.target.value)}
						className={`w-full p-3 border rounded-lg bg-white ${
							errors.state ? "border-red-500" : "border-gray-300"
						}`}
					>
						<option value="">Select a state/region</option>
						{availableStates.map((state) => (
							<option key={state.value} value={state.value}>
								{state.label}
							</option>
						))}
					</select>
					{errors.state && (
						<p className="text-red-500 text-sm mt-1">{errors.state}</p>
					)}
				</div>
			)}

			<Button
				onClick={validateAndNext}
				className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
			>
				Continue to Specializations →
			</Button>
		</div>
	);
}
