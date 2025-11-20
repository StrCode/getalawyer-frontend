import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function GoogleLoginButton() {
	const [isLoading, setIsLoading] = useState(false);

	//TODO: Handle loading and error state
	const signIn = async () => {
		try {
			setIsLoading(true);
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (error) {
			console.error("Google sign-in error:", error);
			// toast.error("Failed to sign in with Google");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={signIn}
			variant="outline"
			type="button"
			disabled={isLoading}
			className="gap-2"
		>
			{isLoading ? "Signing in..." : "Continue with Google"}
		</Button>
	);
}
