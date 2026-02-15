import { useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { clearOnboardingStore } from "@/stores/onBoardingClient";

export function OnboardingHeader() {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		clearOnboardingStore();
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate({ to: "/login" }),
			},
		});
	};

	return (
		<div className="bg-white border-b w-full">
			<div className="flex justify-between items-center mx-auto px-6 py-3 max-w-7xl">
				<Logo />
				<Button
					size="sm"
					variant="ghost"
					onClick={handleSignOut}
					className="text-gray-600 hover:text-gray-900 text-xs"
				>
					Sign Out
				</Button>
			</div>
		</div>
	);
}
