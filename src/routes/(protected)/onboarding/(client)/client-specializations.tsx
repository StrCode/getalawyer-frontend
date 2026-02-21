import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSpecializations } from "@/hooks/use-specializations";
import type {
	OnBoardingRequest,
	OnboardingStatusResponse,
} from "@/lib/api/client";
import { api } from "@/lib/api/client";

// Local storage key for client onboarding data
const STORAGE_KEY = 'client-onboarding-data';

interface OnboardingData {
	country: string;
	state: string;
	specializations: string[];
}

// Helper functions for localStorage
const getOnboardingData = (): OnboardingData => {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : { country: '', state: '', specializations: [] };
	} catch {
		return { country: '', state: '', specializations: [] };
	}
};

const setOnboardingData = (data: Partial<OnboardingData>) => {
	try {
		const current = getOnboardingData();
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
	} catch (error) {
		console.error('Failed to save onboarding data:', error);
	}
};

export const Route = createFileRoute("/(protected)/onboarding/(client)/client-specializations")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [onboardingData, setOnboardingData] = useState<OnboardingData>({
		country: '',
		state: '',
		specializations: []
	});
	const [error, setError] = useState<string | null>(null);
	
	const { data: specializationsData, isLoading: isLoadingSpecs } = useSpecializations();
	const specializations = specializationsData?.specializations || [];

	// Load saved data on mount
	useEffect(() => {
		const saved = getOnboardingData();
		setOnboardingData(saved);
	}, []);
	
	const toggleSpecialization = (id: string) => {
		setOnboardingData(prev => {
			const newSpecs = prev.specializations.includes(id)
				? prev.specializations.filter(s => s !== id)
				: prev.specializations.length < 3
					? [...prev.specializations, id]
					: prev.specializations;
			
			const updated = { ...prev, specializations: newSpecs };
			// Save to localStorage
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			} catch (error) {
				console.error('Failed to save:', error);
			}
			return updated;
		});
		setError(null);
	};

	const completeMutation = useMutation({
		mutationFn: async (data: OnBoardingRequest) => {
			return api.client.completeOnBoarding(data);
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(["user", "session"], updatedUser);
			
			// Clear onboarding data
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch (error) {
				console.error('Failed to clear onboarding data:', error);
			}
			
			navigate({ to: "/dashboard" });
		},
		onError: (error) => {
			console.error("Onboarding error:", error);
		},
	})

	const handleSubmit = async () => {
		if (onboardingData.specializations.length === 0) {
			setError("Please select at least one specialization");
			return
		}

		if (onboardingData.specializations.length > 3) {
			setError("Please select a maximum of 3 specializations");
			return
		}

		setError(null);

		completeMutation.mutate({
			country: onboardingData.country,
			state: onboardingData.state,
			specializationIds: onboardingData.specializations,
		})
	}

	const handleBack = () => {
		navigate({ to: "/onboarding/client-location" });
	}

	return (
		<div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
			{/* Progress indicator */}
			<div className="bg-white border-b w-full">
				<div className="mx-auto px-6 py-3 max-w-3xl">
					<div className="flex justify-between items-center text-sm">
						<span className="font-medium text-muted-foreground">Step 2 of 2</span>
						<div className="flex gap-1.5">
							<div className="bg-primary rounded-full w-16 h-1" />
							<div className="bg-primary rounded-full w-16 h-1" />
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h1 className="mb-1 font-semibold text-gray-900 text-lg">
						What legal areas interest you?
					</h1>
					<p className="text-muted-foreground text-xs">
						Select up to 3 specializations to connect with the right legal
						professionals
					</p>
				</div>

				{/* Location Card */}
				<div className="flex justify-between items-center bg-white shadow-sm mb-4 p-4 border rounded-3xl corner-squircle">
					<div className="flex items-center gap-3">
						<div className="flex justify-center items-center bg-green-100 rounded-full w-8 h-8">
							<svg
								className="w-4 h-4 text-green-600"
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
						<div>
							<p className="text-muted-foreground text-xs">Your Location</p>
							<p className="font-medium text-gray-900 text-sm">
								{onboardingData.country}
								{onboardingData.state ? `, ${onboardingData.state}` : ""}
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleBack}
						className="text-primary hover:text-primary/80 text-xs"
					>
						Change
					</Button>
				</div>

				{/* Main Content Card */}
				<div className="bg-white shadow-sm mb-4 p-4 border rounded-3xl corner-squircle">
					{/* Specializations Grid */}
					{isLoadingSpecs ? (
						<div className="py-8 text-center">
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
							<p className="text-gray-600 text-sm">Loading specializations...</p>
						</div>
					) : (
						<div className="gap-3 grid grid-cols-1 md:grid-cols-2">
							{specializations.map((spec) => {
								const isSelected = onboardingData.specializations.includes(spec.id);
								const isDisabled = !isSelected && onboardingData.specializations.length >= 3;
								
								return (
									<button
										key={spec.id}
										type="button"
										onClick={() => !isDisabled && toggleSpecialization(spec.id)}
										disabled={isDisabled}
										className={`
											p-4 rounded-lg border-2 text-left transition-all
											${isSelected 
												? 'border-primary bg-primary/5' 
												: isDisabled
													? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
													: 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
											}
										`}
									>
										<div className="flex justify-between items-start gap-2">
											<div className="flex-1">
												<h3 className="mb-1 font-medium text-gray-900 text-sm">
													{spec.name}
												</h3>
												{spec.description && (
													<p className="text-gray-600 text-xs line-clamp-2">
														{spec.description}
													</p>
												)}
											</div>
											<div className={`
												flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
												${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}
											`}>
												{isSelected && (
													<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
													</svg>
												)}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{/* Error Messages */}
					{error && (
						<div className="flex items-start gap-2 bg-red-50 mt-4 px-3 py-2.5 border border-red-200 rounded-lg text-red-700 text-sm">
							<svg
								className="flex-shrink-0 mt-0.5 w-4 h-4"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{error}</span>
						</div>
					)}

					{completeMutation.isError && (
						<div className="flex items-start gap-2 bg-red-50 mt-4 px-3 py-2.5 border border-red-200 rounded-lg text-red-700 text-sm">
							<svg
								className="flex-shrink-0 mt-0.5 w-4 h-4"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Failed to complete onboarding. Please try again.</span>
						</div>
					)}
				</div>

				{/* Progress Indicator */}
				<div className="bg-white shadow-sm mb-4 p-4 border rounded-3xl corner-squircle">
					<div className="flex justify-between items-center mb-2">
						<span className="font-medium text-gray-700 text-xs">
							Selection Progress
						</span>
						<span className="font-semibold text-primary text-xs">
							{onboardingData.specializations.length} / 3
						</span>
					</div>
					<div className="bg-gray-200 rounded-full w-full h-1.5">
						<div
							className="bg-primary rounded-full h-1.5 transition-all duration-300"
							style={{ width: `${(onboardingData.specializations.length / 3) * 100}%` }}
						/>
					</div>
					<p className="mt-1.5 text-muted-foreground text-xs">
						{onboardingData.specializations.length === 0
							? "Select at least one to continue"
							: onboardingData.specializations.length === 3
								? "Maximum reached"
								: `${3 - onboardingData.specializations.length} more available`}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3">
					<Button
						variant="outline"
						size="default"
						onClick={handleBack}
						disabled={completeMutation.isPending}
						className="rounded-lg w-24 h-10"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
						Back
					</Button>

					<Button
						className="flex-1 rounded-lg h-10"
						size="default"
						onClick={handleSubmit}
						disabled={
							completeMutation.isPending || onboardingData.specializations.length === 0
						}
					>
						{completeMutation.isPending ? (
							<>
								<svg
									className="mr-1.5 -ml-1 w-4 h-4 animate-spin"
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
								Completing...
							</>
						) : (
							<>
								Complete Setup
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
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
