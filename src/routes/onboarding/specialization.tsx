import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOnboardingStore } from "@/lib/onboardingStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { RegisterSpecializations } from "@/components/onboarding/client/Specialization";
import {
	api,
	OnBoardingRequest,
	OnboardingStatusResponse,
} from "@/lib/api/client";

export const Route = createFileRoute("/onboarding/specialization")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { country, state, specializations, resetForm } = useOnboardingStore();
	const [error, setError] = useState<string | null>(null);

	const completeMutation = useMutation({
		mutationFn: async (data: OnBoardingRequest) => {
			return api.client.completeOnBoarding(data);
		},
		onSuccess: (updatedUser) => {
			// Update the query cache with new user data
			queryClient.setQueryData(["user", "session"], updatedUser);
			queryClient.setQueryData<OnboardingStatusResponse>(["boarding"], {
				success: true,
				onboarding_completed: true,
			});

			// Clear form data
			resetForm();

			// Redirect to dashboard
			router.navigate({ to: "/dashboard" });
		},
	});

	const handleSubmit = async () => {
		if (specializations.length === 0) {
			setError("Please select at least one specialization");
			return;
		}

		if (specializations.length > 3) {
			setError("Please select a maximum of 3 specializations");
			return;
		}

		setError(null);
		completeMutation.mutate({
			country,
			state,
			specializationIds: specializations,
		});
	};

	return (
		<div className="grid md:grid-cols-2 px-6 gap-4 py-10 sm:px-20 sm:py-8 md:px-50 md:py-12 md:gap-18">
			<div className="max-w-sm space-y-2">
				<h2 className="text-2xl/snug md:text-3xl/snug font-medium">
					Hey there! To start, please choose up to three categories that reflect
					your legal expertise.
				</h2>
				<p className="text-muted-foreground">
					Your specialization selection helps us recommend relevant
					opportunities and connect you with the right clients.
				</p>
			</div>

			<div>
				<RegisterSpecializations />

				{error && (
					<div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
						{error}
					</div>
				)}

				{completeMutation.isError && (
					<div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
						Failed to complete onboarding. Please try again.
					</div>
				)}

				<Separator className="my-6" />

				<Button
					className="w-full"
					onClick={handleSubmit}
					disabled={completeMutation.isPending || specializations.length === 0}
				>
					{completeMutation.isPending ? "Saving..." : "Choose and Continue"}
				</Button>
			</div>
		</div>
	);
}
