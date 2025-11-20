import { createFileRoute } from "@tanstack/react-router";

import { RegisterAreas } from "@/components/register/lawyer/register-areas";

export const Route = createFileRoute("/(header1)/register-areas")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid md:grid-cols-2 px-6 gap-4 py-10 sm:px-20 sm:py-8 md:px-50 md:py-12 md:gap-18">
			<div className="max-w-sm space-y-2">
				<h2 className="text-2xl/snug md:text-3xl/snug font-medium">
					Hey there! To start, please choose up to three categories that reflect
					your legal issue.
				</h2>
				<p>
					Your industry selection helps us recommend cards of professionals
					relevant to your interests
				</p>
			</div>
			<RegisterAreas />
		</div>
	)
}
