// onboarding/lawyer/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/lawyer/")({
	beforeLoad: async () => {
		// Fetch current progress
		const response = await fetch("/api/onboarding/progress");
		const data = await response.json();

		const currentStep = data.currentStep || 1;

		// Redirect to current step
		throw redirect({
			// to: `/onboarding/lawyer/step-${currentStep}`,
			to: `/onboarding/lawyer/step-1`,
		});
	},
});
