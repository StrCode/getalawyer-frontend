import { createFileRoute } from "@tanstack/react-router";

import { Register } from "@/components/register/lawyer/register";
import { Button } from "@/components/ui/button";

import { GalleryHorizontalEndIcon } from "lucide-react";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex gap-2 justify-between">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryHorizontalEndIcon className="size-4" />
						</div>
						GetaLawyer Inc.
					</a>
					<div className="flex items-center gap-4">
						<span className="text-sm/loose text-stone-600">
							Already have an account?
						</span>
						<Button variant="outline" size="sm">
							Login
						</Button>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<Register />
					</div>
				</div>
			</div>
			<div className="bg-muted p-4 relative hidden lg:block">
				<img
					src="/lawyer-sam.jpg"
					alt="This is ti"
					className="absolute rounded-2xl inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
