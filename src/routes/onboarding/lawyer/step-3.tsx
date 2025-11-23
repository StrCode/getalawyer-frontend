// ============================================
// Step 3: Practice Areas & Expertise
// onboarding/lawyer/step-3.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/onboarding/lawyer/step-3")({
	component: LawyerStep3,
});

const PRACTICE_AREAS = [
	{
		id: "family",
		label: "Family Law",
		subcategories: ["Divorce", "Child Custody", "Adoption"],
	},
	{
		id: "criminal",
		label: "Criminal Law",
		subcategories: ["DUI", "Drug Offenses", "White Collar"],
	},
	{
		id: "corporate",
		label: "Corporate Law",
		subcategories: ["M&A", "Contract", "Compliance"],
	},
	{
		id: "real-estate",
		label: "Real Estate",
		subcategories: ["Commercial", "Residential", "Zoning"],
	},
	{
		id: "personal-injury",
		label: "Personal Injury",
		subcategories: ["Auto Accidents", "Medical Malpractice", "Slip and Fall"],
	},
	{
		id: "immigration",
		label: "Immigration",
		subcategories: ["Visa", "Green Card", "Citizenship"],
	},
	{
		id: "employment",
		label: "Employment Law",
		subcategories: ["Discrimination", "Wrongful Termination", "Contracts"],
	},
	{
		id: "estate",
		label: "Estate Planning",
		subcategories: ["Wills", "Trusts", "Probate"],
	},
];

function LawyerStep3() {
	const {
		currentStep,
		totalSteps,
		steps,
		goToNextStep,
		goToPreviousStep,
		goToStep,
	} = useOnboarding("lawyer");

	const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
	const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
		[],
	);
	const [primaryArea, setPrimaryArea] = useState<string>("");
	const [bio, setBio] = useState("");

	const toggleArea = (areaId: string) => {
		setSelectedAreas((prev) =>
			prev.includes(areaId)
				? prev.filter((id) => id !== areaId)
				: [...prev, areaId],
		);
	};

	const toggleSubcategory = (subcategory: string) => {
		setSelectedSubcategories((prev) =>
			prev.includes(subcategory)
				? prev.filter((s) => s !== subcategory)
				: [...prev, subcategory],
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedAreas.length === 0) {
			alert("Please select at least one practice area");
			return;
		}

		if (!primaryArea) {
			alert("Please select your primary practice area");
			return;
		}

		await goToNextStep({
			practiceAreas: selectedAreas,
			subcategories: selectedSubcategories,
			primaryArea,
			bio,
		});
	};

	return (
		<OnboardingLayout
			currentStep={currentStep}
			totalSteps={totalSteps}
			steps={steps}
			onStepClick={goToStep}
		>
			<div className="bg-white rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold mb-2">Practice Areas & Expertise</h1>
				<p className="text-gray-600 mb-6">
					Select your areas of practice and specializations
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Practice Areas */}
					<div>
						<label className="block text-sm font-medium mb-3">
							Practice Areas <span className="text-red-500">*</span>
						</label>
						<div className="grid grid-cols-2 gap-4">
							{PRACTICE_AREAS.map((area) => (
								<div key={area.id} className="border rounded-lg p-4">
									<div className="flex items-center mb-2">
										<Checkbox
											checked={selectedAreas.includes(area.id)}
											onCheckedChange={() => toggleArea(area.id)}
											id={area.id}
										/>
										<label
											htmlFor={area.id}
											className="ml-2 font-medium cursor-pointer"
										>
											{area.label}
										</label>
									</div>

									{selectedAreas.includes(area.id) && (
										<div className="ml-6 space-y-1 mt-2">
											{area.subcategories.map((sub) => (
												<div key={sub} className="flex items-center">
													<Checkbox
														checked={selectedSubcategories.includes(sub)}
														onCheckedChange={() => toggleSubcategory(sub)}
														id={sub}
													/>
													<label
														htmlFor={sub}
														className="ml-2 text-sm cursor-pointer"
													>
														{sub}
													</label>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Primary Practice Area */}
					{selectedAreas.length > 0 && (
						<div>
							<label className="block text-sm font-medium mb-2">
								Primary Practice Area <span className="text-red-500">*</span>
							</label>
							<select
								value={primaryArea}
								onChange={(e) => setPrimaryArea(e.target.value)}
								className="w-full border rounded-md px-3 py-2"
								required
							>
								<option value="">Select Primary Area</option>
								{selectedAreas.map((areaId) => {
									const area = PRACTICE_AREAS.find((a) => a.id === areaId);
									return (
										<option key={areaId} value={areaId}>
											{area?.label}
										</option>
									);
								})}
							</select>
						</div>
					)}

					{/* Professional Bio */}
					<div>
						<label className="block text-sm font-medium mb-2">
							Professional Bio
						</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							className="w-full border rounded-md px-3 py-2 h-32"
							placeholder="Tell potential clients about your experience, approach, and what makes you unique..."
						/>
						<p className="text-sm text-gray-500 mt-1">
							{bio.length} / 500 characters
						</p>
					</div>

					<div className="flex justify-between pt-4">
						<Button type="button" variant="outline" onClick={goToPreviousStep}>
							Previous
						</Button>
						<Button type="submit">Next</Button>
					</div>
				</form>
			</div>
		</OnboardingLayout>
	);
}
