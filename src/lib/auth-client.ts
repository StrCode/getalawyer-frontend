import { createAuthClient } from "better-auth/react";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
	baseURL: "https://getalawyer-backend-production.up.railway.app",
});
