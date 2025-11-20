import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { LucideIcon } from "lucide-react";

interface AuthCardHeaderProps {
	icon: LucideIcon;
	title: string;
	description: string;
	showSeparator?: boolean;
}

export function AuthCardHeader({
	icon: Icon,
	title,
	description,
	showSeparator = false,
}: AuthCardHeaderProps) {
	return (
		<CardHeader className="flex flex-col items-center justify-center text-center">
			<div
				className="size-24 mx-auto rounded-full p-4"
				style={{
					borderImage: "linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
					background:
						"linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
				}}
			>
				<div className="border border-gray-200 shadow-sm size-16 flex justify-center items-center gap-1 bg-white rounded-full p-2.5">
					<Icon className="size-8" />
				</div>
			</div>
			<CardTitle className="text-2xl/snug">{title}</CardTitle>
			<CardDescription>{description}</CardDescription>
			{showSeparator && <Separator className="mt-4" />}
		</CardHeader>
	);
}
