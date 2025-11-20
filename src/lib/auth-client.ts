import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
	baseURL: "https://getalawyer-backend-production.up.railway.app",
	plugins: [emailOTPClient()],
});
