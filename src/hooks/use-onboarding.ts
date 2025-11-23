import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export type OnboardingStep = {
	step: number;
	title: string;
	path: string;
};

export const LAWYER_STEPS: OnboardingStep[] = [
	{
		step: 1,
		title: "Professional Background",
		path: "/onboarding/lawyer/step-1",
	},
	{ step: 2, title: "Bar Admission", path: "/onboarding/lawyer/step-2" },
	{ step: 3, title: "Practice Areas", path: "/onboarding/lawyer/step-3" },
	{ step: 4, title: "Documents", path: "/onboarding/lawyer/step-4" },
];

export const CLIENT_STEPS: OnboardingStep[] = [
	{ step: 1, title: "Personal Details", path: "/onboarding/client/step-1" },
	{ step: 2, title: "Legal Needs", path: "/onboarding/client/step-2" },
	{ step: 3, title: "Preferences", path: "/onboarding/client/step-3" },
];

export function useOnboarding(userType: "lawyer" | "client") {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const steps = userType === "lawyer" ? LAWYER_STEPS : CLIENT_STEPS;
	const totalSteps = steps.length;

	// Load progress from database
	useEffect(() => {
		loadProgress();
	}, []);

	const loadProgress = async () => {
		try {
			const response = await fetch("/api/onboarding/progress");
			const data = await response.json();
			setCurrentStep(data.currentStep || 1);
		} catch (error) {
			console.error("Failed to load progress:", error);
		}
	};

	const saveProgress = async (step: number, stepData?: any) => {
		setIsLoading(true);
		try {
			await fetch("/api/onboarding/progress", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentStep: step,
					stepData,
					userType,
				}),
			});
			setCurrentStep(step);
		} catch (error) {
			console.error("Failed to save progress:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const goToNextStep = async (stepData?: any) => {
		const nextStep = currentStep + 1;
		await saveProgress(nextStep, stepData);

		if (nextStep > totalSteps) {
			navigate({ to: `/onboarding/${userType}/complete` });
		} else {
			navigate({ to: steps[nextStep - 1].path });
		}
	};

	const goToPreviousStep = () => {
		const prevStep = currentStep - 1;
		if (prevStep >= 1) {
			navigate({ to: steps[prevStep - 1].path });
		}
	};

	const goToStep = (step: number) => {
		if (step >= 1 && step <= totalSteps) {
			navigate({ to: steps[step - 1].path });
		}
	};

	return {
		currentStep,
		totalSteps,
		steps,
		isLoading,
		goToNextStep,
		goToPreviousStep,
		goToStep,
		progress: (currentStep / totalSteps) * 100,
	};
}
