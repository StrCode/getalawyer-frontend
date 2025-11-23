import { authClient } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Route as RouteIcon, Link } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const router = useRouter();
	const { data: session, error, isPending } = authClient.useSession();
	if (!isPending && error) {
		router.navigate({ to: "/login" });
	} else if (session) {
		router.navigate({ to: "/dashboard" });
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<Link to={"login"}>Login</Link>
		</div>
	);
}
