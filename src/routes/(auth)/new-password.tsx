import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NewPassword } from "@/components/auth/NewPassword";
import { toastManager } from "@/components/ui/toast";

export const Route = createFileRoute("/(auth)/new-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [credentials, setCredentials] = useState<{
		email: string;
		otp: string;
	} | null>(null);

	useEffect(() => {
		const email = sessionStorage.getItem("reset_email");
		const otp = sessionStorage.getItem("reset_otp");

		if (!email || !otp) {
			toastManager.add({
				title: "Session expired",
				description: "Please start the password reset process again.",
				type: "error",
			});
			navigate({ to: "/login" });
			return;
		}

		setCredentials({ email, otp });
	}, [navigate]);

	const handleSuccess = () => {
		// Clear session storage after successful reset
		sessionStorage.removeItem("reset_email");
		sessionStorage.removeItem("reset_otp");
		navigate({ to: "/dashboard" });
	};

	if (!credentials) {
		return null; // or a loading spinner
	}
	return (
		<div className="flex pt-8 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<NewPassword
					email={credentials.email}
					otp={credentials.otp}
					onSuccess={handleSuccess}
				/>
			</div>
		</div>
	);
}
