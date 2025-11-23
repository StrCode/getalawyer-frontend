// ============================================
// Step 2: Bar Admission & Licenses
// onboarding/lawyer/step-2.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export const Route = createFileRoute("/onboarding/lawyer/step-2")({
	component: LawyerStep2,
});

type BarAdmission = {
	id: string;
	state: string;
	barNumber: string;
	admissionDate: string;
	status: "active" | "inactive";
};

function LawyerStep2() {
	const {
		currentStep,
		totalSteps,
		steps,
		goToNextStep,
		goToPreviousStep,
		goToStep,
	} = useOnboarding("lawyer");

	const [barAdmissions, setBarAdmissions] = useState<BarAdmission[]>([
		{ id: "1", state: "", barNumber: "", admissionDate: "", status: "active" },
	]);

	const addBarAdmission = () => {
		setBarAdmissions([
			...barAdmissions,
			{
				id: Date.now().toString(),
				state: "",
				barNumber: "",
				admissionDate: "",
				status: "active",
			},
		]);
	};

	const removeBarAdmission = (id: string) => {
		if (barAdmissions.length > 1) {
			setBarAdmissions(barAdmissions.filter((bar) => bar.id !== id));
		}
	};

	const updateBarAdmission = (
		id: string,
		field: keyof BarAdmission,
		value: string,
	) => {
		setBarAdmissions(
			barAdmissions.map((bar) =>
				bar.id === id ? { ...bar, [field]: value } : bar,
			),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate at least one complete bar admission
		const hasValidAdmission = barAdmissions.some(
			(bar) => bar.state && bar.barNumber && bar.admissionDate,
		);

		if (!hasValidAdmission) {
			alert("Please complete at least one bar admission");
			return;
		}

		await goToNextStep({ barAdmissions });
	};

	return (
		<OnboardingLayout
			currentStep={currentStep}
			totalSteps={totalSteps}
			steps={steps}
			onStepClick={goToStep}
		>
			<div className="bg-white rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold mb-2">Bar Admission & Licenses</h1>
				<p className="text-gray-600 mb-6">
					Add all states where you are admitted to practice law
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{barAdmissions.map((admission, index) => (
						<div key={admission.id} className="border rounded-lg p-4 relative">
							{barAdmissions.length > 1 && (
								<button
									type="button"
									onClick={() => removeBarAdmission(admission.id)}
									className="absolute top-4 right-4 text-red-500 hover:text-red-700"
								>
									<X size={20} />
								</button>
							)}

							<h3 className="font-semibold mb-4">Bar Admission {index + 1}</h3>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-2">
										State <span className="text-red-500">*</span>
									</label>
									<select
										value={admission.state}
										onChange={(e) =>
											updateBarAdmission(admission.id, "state", e.target.value)
										}
										className="w-full border rounded-md px-3 py-2"
										required
									>
										<option value="">Select State</option>
										<option value="NY">New York</option>
										<option value="CA">California</option>
										<option value="TX">Texas</option>
										<option value="FL">Florida</option>
										<option value="IL">Illinois</option>
										{/* Add more states */}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Bar Number <span className="text-red-500">*</span>
									</label>
									<Input
										type="text"
										value={admission.barNumber}
										onChange={(e) =>
											updateBarAdmission(
												admission.id,
												"barNumber",
												e.target.value,
											)
										}
										placeholder="e.g., 1234567"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Admission Date <span className="text-red-500">*</span>
									</label>
									<Input
										type="date"
										value={admission.admissionDate}
										onChange={(e) =>
											updateBarAdmission(
												admission.id,
												"admissionDate",
												e.target.value,
											)
										}
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Status
									</label>
									<select
										value={admission.status}
										onChange={(e) =>
											updateBarAdmission(
												admission.id,
												"status",
												e.target.value as "active" | "inactive",
											)
										}
										className="w-full border rounded-md px-3 py-2"
									>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
									</select>
								</div>
							</div>
						</div>
					))}

					<Button
						type="button"
						variant="outline"
						onClick={addBarAdmission}
						className="w-full"
					>
						<Plus size={16} className="mr-2" />
						Add Another Bar Admission
					</Button>

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
