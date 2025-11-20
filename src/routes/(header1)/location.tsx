import { createFileRoute } from "@tanstack/react-router";
import RegisterLocation from "@/components/register/lawyer/register-location";

export const Route = createFileRoute("/(header1)/location")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex pt-16 justify-center items-center px-4">
			<div className="w-full max-w-sm">
				<RegisterLocation />
			</div>
		</div>
	)
}
