import { ReactNode } from "react";

type OnboardingLayoutProps = {
	children: ReactNode;
	currentStep: number;
	totalSteps: number;
	steps: Array<{ step: number; title: string; path: string }>;
	onStepClick?: (step: number) => void;
};

export function OnboardingLayout({
	children,
	currentStep,
	totalSteps,
	steps,
	onStepClick,
}: OnboardingLayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Progress Bar */}
			<div className="bg-white border-b">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-lg font-semibold">Complete Your Profile</h2>
						<span className="text-sm text-gray-600">
							Step {currentStep} of {totalSteps}
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all"
							style={{ width: `${(currentStep / totalSteps) * 100}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Step Navigation */}
			<div className="bg-white border-b">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex justify-between">
						{steps.map((step) => (
							<button
								type="button"
								key={step.step}
								onClick={() => onStepClick?.(step.step)}
								disabled={step.step > currentStep}
								className={`flex-1 text-center py-2 text-sm font-medium transition-colors
                  ${step.step === currentStep ? "text-blue-600 border-b-2 border-blue-600" : ""}
                  ${step.step < currentStep ? "text-gray-600 cursor-pointer hover:text-blue-600" : ""}
                  ${step.step > currentStep ? "text-gray-400 cursor-not-allowed" : ""}
                `}
							>
								{step.title}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
		</div>
	);
}
