import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LockKeyholeIcon, MailIcon, UserPenIcon } from "lucide-react";

export function ResetPassword({ ...props }: React.ComponentProps<typeof Card>) {
	return (
		<Card>
			<CardHeader className="flex flex-col items-center justify-center">
				<div
					className="size-24 flex items-center justify-center rounded-full p-4"
					style={{
						borderImage:
							"linear-gradient(to bottom, #E4E5E7 0%, #E4E5E7 100%) 1",
						background:
							"linear-gradient(180deg, rgba(228,229,231,0.48) 0%, rgba(247,248,248,0.00) 100%)",
					}}
				>
					<div className="border border-gray-200 shadow-sm size-16 flex justify-center items-center gap-1 bg-white rounded-full p-2.5">
						<LockKeyholeIcon className="size-8" />
					</div>
				</div>
				<CardTitle className="text-xl/snug font-medium">
					Reset Password
				</CardTitle>
				<CardDescription>
					Enter your email to reset your password.
				</CardDescription>
				<Separator className="mt-4" />
			</CardHeader>

			<CardPanel>
				<Form>
					<Field className="gap-1.5">
						<FieldLabel htmlFor="email" className="font-medium">
							Email Address
						</FieldLabel>
						<InputGroup>
							<InputGroupInput
								size={"lg"}
								className="text-xs"
								type="email"
								placeholder="Enter your email"
							/>
							<InputGroupAddon>
								<MailIcon />
							</InputGroupAddon>
						</InputGroup>
					</Field>
				</Form>
			</CardPanel>
			<CardFooter className="flex flex-col gap-4">
				<Button
					size={"lg"}
					variant="default"
					type="submit"
					className="w-full text-sm text-white bg-[#19603E]"
				>
					Reset Password
				</Button>
				<div className="text-center">
					<p className="text-gray-600 text-xs">Don't have access anymore?</p>
					<Button variant="link" className="text-xs text-stone-950 underline">
						Try another method
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
