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
    
    console.log("[getUser] Cookie header:", cookieHeader);
    
    // Check if auth token exists in cookies
    const hasAuthToken = cookieHeader.includes("auth.token=");
    console.log("[getUser] Has auth token:", hasAuthToken);
    
    if (!hasAuthToken) {
      console.log("[getUser] No auth token found in cookies, returning null");
      return null;
    }

    console.log("[getUser] Fetching session from Better Auth API");
    // Try to get session from Better Auth API
    const session = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: cookieHeader,
        },
      },
    });
    
    console.log("[getUser] Session from Better Auth:", session);
    console.log("[getUser] Session data:", session.data);
    console.log("[getUser] Session user:", session.data?.user);
    console.log("[getUser] Session user role:", session.data?.user?.role);

    return session.data || null;
  } catch (error) {
    console.error("[getUser] Error fetching user session:", error);
    return null;
  }
});