import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/onboarding/lawyer/step-1")({
	component: LawyerStep1,
});

function LawyerStep1() {
	const navigate = useNavigate();
	const {
		currentStep,
		totalSteps,
		steps,
		goToNextStep,
		goToPreviousStep,
		goToStep,
	} = useOnboarding("lawyer");

	const [formData, setFormData] = useState({
		yearsOfExperience: "",
		lawSchool: "",
		graduationYear: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// navigate({ to: "/onboarding/lawyer/step-2" });
		await goToNextStep(formData);
	};

	return (
		<OnboardingLayout
			currentStep={currentStep}
			totalSteps={totalSteps}
			steps={steps}
			onStepClick={goToStep}
		>
			<div className="bg-white rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold mb-6">Professional Background</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2">
							Years of Experience
						</label>
						<Input
							type="number"
							value={formData.yearsOfExperience}
							onChange={(e) =>
								setFormData({ ...formData, yearsOfExperience: e.target.value })
							}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Law School</label>
						<Input
							type="text"
							value={formData.lawSchool}
							onChange={(e) =>
								setFormData({ ...formData, lawSchool: e.target.value })
							}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">
							Graduation Year
						</label>
						<Input
							type="number"
							value={formData.graduationYear}
							onChange={(e) =>
								setFormData({ ...formData, graduationYear: e.target.value })
							}
							required
						/>
					</div>

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={goToPreviousStep}
							disabled={currentStep === 1}
						>
							Previous
						</Button>
						<Button type="submit">Next</Button>
					</div>
				</form>
			</div>
		</OnboardingLayout>
	);
}
