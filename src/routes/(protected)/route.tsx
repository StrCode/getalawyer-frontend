import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async () => {
    // Check if user is authenticated using server-side session
    const session = await getUser();
    
    // Return session to make it available to child routes
    return {
      session,
    };
  },
  component: () => <Outlet />,
});
