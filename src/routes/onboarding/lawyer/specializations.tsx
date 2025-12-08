// ============================================
// Step 3: Practice Areas & Expertise
// onboarding/lawyer/step-3.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLawyerOnboardingStore } from "@/hooks/lawyer-onboarding";

export const Route = createFileRoute("/onboarding/lawyer/specializations")({
	component: LawyerSpecializationsStep,
});

// Mock data - replace with your API
const PRACTICE_AREAS = [
	{ id: "1", name: "Corporate Law", icon: "🏢" },
	{ id: "2", name: "Criminal Defense", icon: "⚖" },
	{ id: "3", name: "Family Law", icon: "👨" },
	{ id: "4", name: "Real Estate", icon: "🏠" },
	{ id: "5", name: "Immigration", icon: "🛂" },
	{ id: "6", name: "Intellectual Property", icon: "💡" },
	{ id: "7", name: "Tax Law", icon: "💰" },
	{ id: "8", name: "Employment Law", icon: "💼" },
	{ id: "9", name: "Personal Injury", icon: "🚑" },
	{ id: "10", name: "Estate Planning", icon: "📋" },
	{ id: "11", name: "Environmental Law", icon: "🌍" },
	{ id: "12", name: "Healthcare Law", icon: "🏥" },
];

const LANGUAGES = [
	"English",
	"Spanish",
	"French",
	"Mandarin",
	"German",
	"Arabic",
	"Portuguese",
	"Russian",
	"Japanese",
	"Italian",
];

function LawyerSpecializationsStep() {
	const router = useRouter();
	const {
		practiceAreas,
		languages,
		togglePracticeArea,
		toggleLanguage,
		updateLastSaved,
	} = useLawyerOnboardingStore();

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateAndNext = () => {
		const newErrors: Record<string, string> = {};

		if (practiceAreas.length === 0) {
			newErrors.practiceAreas = "Please select at least one practice area";
		}

		if (practiceAreas.length > 5) {
			newErrors.practiceAreas = "Please select a maximum of 5 practice areas";
		}

		if (languages.length === 0) {
			newErrors.languages = "Please select at least one language";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		updateLastSaved();
		router.navigate({ to: "/onboarding/lawyer/profile" });
	};

	const handleBack = () => {
		router.navigate({ to: "/onboarding/lawyer/credentials" });
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">Step 3 of 4</span>
					<span className="text-sm text-gray-500">Specializations</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-3/4"></div>
				</div>
			</div>

			{/* Header */}
			<div className="text-center mb-8">
				<div className="text-5xl mb-3">🎯</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Your Legal Expertise
				</h2>
				<p className="text-gray-600">
					Select 1-5 practice areas and the languages you speak
				</p>
			</div>

			<div className="space-y-8">
				{/* Practice Areas */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Practice Areas *
						</h3>
						<span className="text-sm text-gray-500">
							{practiceAreas.length} of 5 selected
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{PRACTICE_AREAS.map((area) => {
							const isSelected = practiceAreas.includes(area.id);
							const isDisabled = practiceAreas.length >= 5 && !isSelected;

							return (
								<button
									key={area.id}
									onClick={() => {
										if (!isDisabled) {
											togglePracticeArea(area.id);
											setErrors((prev) => ({ ...prev, practiceAreas: "" }));
										}
									}}
									disabled={isDisabled}
									className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
											isSelected
												? "border-blue-500 bg-blue-50"
												: "border-gray-200 bg-white hover:border-gray-300"
										}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
								>
									<div className="flex items-center gap-3">
										<span className="text-2xl">{area.icon}</span>
										<div className="flex-1">
											<p className="font-medium text-gray-900">{area.name}</p>
										</div>
										{isSelected && (
											<span className="text-blue-500 text-xl">✓</span>
										)}
									</div>
								</button>
							);
						})}
					</div>

					{errors.practiceAreas && (
						<p className="text-red-500 text-sm mt-2">{errors.practiceAreas}</p>
					)}

					{practiceAreas.length >= 5 && (
						<p className="text-amber-600 text-sm mt-2">
							Maximum of 5 practice areas reached. Deselect one to choose
							another.
						</p>
					)}
				</div>

				{/* Languages */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Languages Spoken *
						</h3>
						<span className="text-sm text-gray-500">
							{languages.length} selected
						</span>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
						{LANGUAGES.map((language) => {
							const isSelected = languages.includes(language);

							return (
								<button
									key={language}
									onClick={() => {
										toggleLanguage(language);
										setErrors((prev) => ({ ...prev, languages: "" }));
									}}
									className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all
                    ${
											isSelected
												? "border-blue-500 bg-blue-50 text-blue-700"
												: "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
										}
                  `}
								>
									{language}
									{isSelected && <span className="ml-1">✓</span>}
								</button>
							);
						})}
					</div>

					{errors.languages && (
						<p className="text-red-500 text-sm mt-2">{errors.languages}</p>
					)}
				</div>
			</div>

			{/* Helper Text */}
			<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<span className="text-blue-600 text-xl">💡</span>
					<div>
						<p className="text-sm font-medium text-blue-900">
							Choose carefully
						</p>
						<p className="text-xs text-blue-700 mt-1">
							Your specializations help us match you with the right clients.
							Select areas where you have significant experience and expertise.
						</p>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3 mt-8">
				<Button variant="outline" onClick={handleBack} className="w-32">
					← Back
				</Button>
				<Button
					onClick={validateAndNext}
					disabled={practiceAreas.length === 0 || languages.length === 0}
					className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Continue to Profile →
				</Button>
			</div>
		</div>
	);
}
