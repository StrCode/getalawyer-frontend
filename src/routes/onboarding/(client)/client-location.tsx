import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCountriesWithStates } from "@/hooks/use-countries";
import { useOnboardingClientStore } from "@/stores/onBoardingClient";

export const Route = createFileRoute("/onboarding/(client)/client-location")({
	component: OnboardingStep1,
});

function OnboardingStep1() {
	const router = useRouter();
	const { country, state, setCountry, setState } = useOnboardingClientStore();
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data, isLoading, isError } = useCountriesWithStates();

	const countries = data?.countries || [];
	const statesByCountry = data?.statesByCountry || {};
	const availableStates = country ? statesByCountry[country] : [];

	const handleCountryChange = (value: string) => {
		setCountry(value);
		setState("");
		setErrors({});
	}

	const handleStateChange = (value: string) => {
		setState(value);
		setErrors({});
	}

	const validateAndNext = () => {
		const newErrors: Record<string, string> = {};

		if (!country) {
			newErrors.country = "Please select a country";
		}

		if (availableStates.length > 1 && !state) {
			newErrors.state = "Please select a state/region";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return
		}

		router.navigate({ to: "/onboarding/(client)/client-specializations" });
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
				<div className="text-center">
					<div className="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-full w-12 h-12">
						<svg
							className="w-5 h-5 text-primary animate-spin"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
					<p className="text-gray-600 text-sm">Loading...</p>
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 min-h-screen">
				<div className="bg-white shadow-sm p-6 border rounded-xl w-full max-w-sm text-center">
					<div className="inline-flex justify-center items-center bg-red-100 mb-3 rounded-full w-12 h-12">
						<svg
							className="w-5 h-5 text-red-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<h2 className="mb-1 font-semibold text-gray-900 text-base">
						Error Loading Data
					</h2>
					<p className="mb-4 text-gray-600 text-sm">
						Please check your connection and try again.
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="rounded-lg w-full"
						size="sm"
					>
						Refresh Page
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
			{/* Progress indicator */}
			<div className="bg-white border-b w-full">
				<div className="mx-auto px-6 py-3 max-w-3xl">
					<div className="flex justify-between items-center text-sm">
						<span className="font-medium text-muted-foreground">Step 1 of 2</span>
						<div className="flex gap-1.5">
							<div className="bg-primary rounded-full w-16 h-1" />
							<div className="bg-gray-200 rounded-full w-16 h-1" />
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto px-6 py-6 max-w-3xl">
				{/* Header Section */}
				<div className="mb-6 text-center">
					<div className="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-full w-12 h-12">
						<svg
							className="w-5 h-5 text-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<h1 className="mb-1 font-semibold text-gray-900 text-lg">
						Where are you located?
					</h1>
					<p className="text-muted-foreground text-xs">
						Help us connect you with legal professionals in your area
					</p>
				</div>

				{/* Main Content Card */}
				<div className="space-y-5 bg-white shadow-sm mb-4 p-6 border rounded-3xl corner-squircle">
					{/* Country Select */}
					<Field>
						<FieldLabel className="flex items-center gap-1.5 mb-2 font-medium text-gray-700 text-sm">
							<svg
								className="w-4 h-4 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Country
							<span className="text-red-500">*</span>
						</FieldLabel>
						<Select
							value={country}
							onValueChange={handleCountryChange}
							items={countries}
						>
							<SelectTrigger
								className={`h-10 rounded-lg border transition-colors ${
									errors.country
										? "border-red-500 focus:border-red-500"
										: "hover:border-primary/50"
								}`}
							>
								<SelectValue placeholder="Select your country" />
							</SelectTrigger>
							<SelectContent>
								{countries.map(({ label, value }) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.country && (
							<FieldError className="flex items-center gap-1.5 mt-1.5 text-xs">
								<svg
									className="w-3.5 h-3.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								{errors.country}
							</FieldError>
						)}
					</Field>

					{/* State Select */}
					{country && availableStates.length > 1 && (
						<Field className="animate-fadeIn">
							<FieldLabel className="flex items-center gap-1.5 mb-2 font-medium text-gray-700 text-sm">
								<svg
									className="w-4 h-4 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								State / Region
								<span className="text-red-500">*</span>
							</FieldLabel>
							<Select
								value={state}
								onValueChange={handleStateChange}
								items={availableStates}
							>
								<SelectTrigger
									className={`h-10 rounded-lg border transition-colors ${
										errors.state
											? "border-red-500 focus:border-red-500"
											: "hover:border-primary/50"
									}`}
								>
									<SelectValue placeholder="Select your state or region" />
								</SelectTrigger>
								<SelectContent>
									{availableStates.map(({ label, value }) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.state && (
								<FieldError className="flex items-center gap-1.5 mt-1.5 text-xs">
									<svg
										className="w-3.5 h-3.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									{errors.state}
								</FieldError>
							)}
						</Field>
					)}

					{/* Info message */}
					{country && availableStates.length === 1 && (
						<div className="flex items-start gap-2 bg-blue-50 p-3 border border-blue-200 rounded-lg">
							<svg
								className="flex-shrink-0 mt-0.5 w-4 h-4 text-blue-600"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							<p className="text-blue-800 text-xs">
								No states or regions listed. You can proceed to the next step.
							</p>
						</div>
					)}

					{/* Selected Location Preview */}
					{country && (
						<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 border border-green-200 rounded-lg">
							<div className="flex items-center gap-2">
								<div className="flex flex-shrink-0 justify-center items-center bg-green-100 rounded-full w-8 h-8">
									<svg
										className="w-4 h-4 text-green-600"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div>
									<p className="font-medium text-green-900 text-xs">
										Selected Location
									</p>
									<p className="font-semibold text-green-800 text-sm">
										{country}
										{state && availableStates.length > 1 ? `, ${state}` : ""}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Action Button */}
				<Button
					size="default"
					className="rounded-lg w-full h-10"
					onClick={validateAndNext}
				>
					Continue to Specializations
					<svg
						className="ml-1.5 w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</Button>

				{/* Help Text */}
				<p className="mt-3 text-muted-foreground text-xs text-center">
					Your location helps us connect you with local legal professionals
				</p>
			</div>
		</div>
	)
}
