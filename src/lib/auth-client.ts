import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
	baseURL: "https://law-backend-production.up.railway.app",
	fetchOptions: {
		credentials: "include", // ← Make sure this is set
	},
	plugins: [emailOTPClient()],
});
