import { createFileRoute } from "@tanstack/react-router";

import { Register } from "@/components/auth/Register";
import { useState } from "react";

// Define the search params type
type RegisterSearch = {
  type?: "client" | "lawyer";
};

export const Route = createFileRoute("/(auth)/register/")({
  component: RouteComponent,
  // Validate search params
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type:
        search.type === "client" || search.type === "lawyer"
          ? search.type
          : undefined,
    };
  },
});

function RouteComponent() {
  const { type } = Route.useSearch();

  const [userType, setUserType] = useState<"client" | "lawyer">(
    type || "client",
  );

  return (
    <div className="flex pt-8 justify-center items-center px-4">
      <div className="w-full max-w-sm">
        <Register userType={userType} />
      </div>
    </div>
  );
}
