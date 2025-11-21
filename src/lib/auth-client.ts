import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
	baseURL: "getalawyer-backend-production-4dc9.up.railway.app",
	plugins: [emailOTPClient()],
});
