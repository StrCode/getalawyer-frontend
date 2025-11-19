import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: "https://getalawyer-backend-production.up.railway.app",
});

export const { signIn, signUp, useSession } = createAuthClient();
