import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth-client";

// export const getUser = createServerFn({ method: "GET" })
//   .middleware([authMiddleware])
//   .handler(async ({ context }) => {
//     return context.session;
//   });

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const request = getRequest();
    const cookieHeader = request.headers.get("cookie") || "";
    
    console.log("Cookie header:", cookieHeader);
    
    // Check if auth token exists in cookies
    const hasAuthToken = cookieHeader.includes("auth.token=");
    
    if (!hasAuthToken) {
      console.log("No auth token found in cookies");
      return null;
    }

    // Try to get session from Better Auth API
    const session = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: cookieHeader,
        },
      },
    });
    
    console.log("Session from Better Auth:", session);

    return session.data || null;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
});