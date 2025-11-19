import { createFileRoute } from "@tanstack/react-router";
import { VerifyOTP } from "@/components/register/lawyer/verify-otp";

export const Route = createFileRoute("/(auth)/verify-otp")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<VerifyOTP />
			</div>
		</div>
	);
}
