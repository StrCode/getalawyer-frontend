import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
	baseURL: "https://law-backend-production.up.railway.app",
	fetchOptions: {
		credentials: "include", // ← Make sure this is set
	},
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: "string",
					required: false,
				},
			},
		}),
		adminClient(),
		emailOTPClient(),
	],
});

export const {
	useSession,
	signIn,
	signUp,
	signOut,
	forgetPassword,
	resetPassword,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
