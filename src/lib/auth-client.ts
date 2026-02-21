import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// If you want to export the entire auth client object as well
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
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
        onboarding_completed: {
          type: "boolean",
        },
      },
    }),
    emailOTPClient(),
  ],
});

export const {
  getSession,
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
