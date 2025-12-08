// ============================================
// Step 1: Basics
// onboarding/lawyer/basics.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useLawyerOnboardingStore } from "@/hooks/lawyer-onboarding";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/onboarding/lawyer/basics")({
	component: LawyerBasicsStep,
});

function LawyerBasicsStep() {
	const router = useRouter();
	const {
		firstName,
		middleName,
		lastName,
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

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Mock data - replace with your API hook
	const COUNTRIES = [
		{ value: "US", label: "United States" },
		{ value: "CA", label: "Canada" },
		{ value: "GB", label: "United Kingdom" },
		{ value: "AU", label: "Australia" },
		{ value: "NG", label: "Nigeria" },
	];

	const STATES_BY_COUNTRY: Record<
		string,
		Array<{ value: string; label: string }>
	> = {
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
		NG: [
			{ value: "FCT", label: "Federal Capital Territory" },
			{ value: "Lagos", label: "Lagos" },
			{ value: "Kano", label: "Kano" },
		],
	};

	const availableStates = country ? STATES_BY_COUNTRY[country] || [] : [];

	const validateAndNext = () => {
		const newErrors: Record<string, string> = {};

		if (!firstName.trim()) newErrors.firstName = "First name is required";
		// if (!lastName.trim()) newErrors.lastName = "Last name is required";
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
		router.navigate({ to: "/onboarding/lawyer/credentials" });
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">Step 1 of 4</span>
					<span className="text-sm text-gray-500">Basic Information</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/4"></div>
				</div>
			</div>

			{/* Header */}
			<div className="text-center mb-8">
				<div className="text-5xl mb-3">⚖</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Welcome! Let's set up your profile
				</h2>
				<p className="text-gray-600">
					Start by telling us your basic information
				</p>
			</div>

			{/* Form */}
			<div className="space-y-5">
				{/* Full Name */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Full Legal Name *
					</label>
					<Input
						type="text"
						value={firstName}
						onChange={(e) => {
							setFirstName(e.target.value);
							setErrors((prev) => ({ ...prev, fullName: "" }));
						}}
						placeholder="John Doe"
						className={errors.fullName ? "border-red-500" : ""}
					/>
					{errors.fullName && (
						<p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
					)}
				</div>

				{/* Country */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Country *
					</label>
					<select
						value={country}
						onChange={(e) => {
							setCountry(e.target.value);
							setState("");
							setErrors((prev) => ({ ...prev, country: "" }));
						}}
						className={`w-full p-3 border rounded-lg bg-white ${
							errors.country ? "border-red-500" : "border-gray-300"
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

				{/* State/Province - Conditional */}
				{country && availableStates.length > 0 && (
					<div className="animate-fadeIn">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							State / Province *
						</label>
						<select
							value={state}
							onChange={(e) => {
								setState(e.target.value);
								setErrors((prev) => ({ ...prev, state: "" }));
							}}
							className={`w-full p-3 border rounded-lg bg-white ${
								errors.state ? "border-red-500" : "border-gray-300"
							}`}
						>
							<option value="">Select a state/province</option>
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
				)}

				{/* City */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						City *
					</label>
					<Input
						type="text"
						value={city}
						onChange={(e) => {
							setCity(e.target.value);
							setErrors((prev) => ({ ...prev, city: "" }));
						}}
						placeholder="New York"
						className={errors.city ? "border-red-500" : ""}
					/>
					{errors.city && (
						<p className="text-red-500 text-sm mt-1">{errors.city}</p>
					)}
				</div>

				{/* Phone Number */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Phone Number *
					</label>
					<Input
						type="tel"
						value={phoneNumber}
						onChange={(e) => {
							setPhoneNumber(e.target.value);
							setErrors((prev) => ({ ...prev, phoneNumber: "" }));
						}}
						placeholder="+1 (555) 123-4567"
						className={errors.phoneNumber ? "border-red-500" : ""}
					/>
					{errors.phoneNumber && (
						<p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
					)}
					<p className="text-gray-500 text-xs mt-1">
						Include country code for international numbers
					</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="mt-8">
				<Button
					onClick={validateAndNext}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Continue to Credentials →
				</Button>
			</div>

			{/* Helper Text */}
			<p className="text-center text-sm text-gray-500 mt-4">
				Your information is secure and will only be shared with verified clients
			</p>
		</div>
	);
}
