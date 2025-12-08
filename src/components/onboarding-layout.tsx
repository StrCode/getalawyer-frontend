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
    <div className="bg-gray-50">
      <div className="px-4 py-8">{children}</div>
    </div>
  );
}
