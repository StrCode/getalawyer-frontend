import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function FacebookLoginButton() {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<Button
			type="button"
			variant="outline"
			disabled={isLoading}
			onClick={async () => {
				await authClient.signIn.social(
					{
						provider: "facebook",
						callbackURL: "/dashboard",
					},
					{
						onRequest: () => {
							setIsLoading(true);
						},
						onResponse: () => {
							setIsLoading(false);
						},
						onError: (ctx) => {
							// toast.error(ctx.error.message);
						},
					},
				);
			}}
		>
			{isLoading ? "Signing in..." : <span>Facebook</span>}
		</Button>
	);
}
