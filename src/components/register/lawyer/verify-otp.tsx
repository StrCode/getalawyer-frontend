import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
	InputOTP,
	InputOTPSeparator,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { UserPenIcon } from "lucide-react";

export function VerifyOTP({ ...props }: React.ComponentProps<typeof Card>) {
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
						<UserPenIcon className="size-8" />
					</div>
				</div>
				<CardTitle className="text-xl/snug font-medium">
					Enter Verification Code
				</CardTitle>
				<CardDescription className="text-sm/snug">
					We’ve sent a code to{" "}
					<span className="font-medium text-gray-950 text-sm/snug">
						bellos@yahoo.com
					</span>
				</CardDescription>
				<Separator className="mt-4" />
			</CardHeader>

			<CardPanel>
				<Form>
					<Field>
						<InputOTP maxLength={4} required containerClassName="gap-4">
							<InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
							</InputOTPGroup>
						</InputOTP>
					</Field>
				</Form>
			</CardPanel>
			<CardFooter className="flex flex-col gap-4">
				<Button
					size={"lg"}
					variant="default"
					type="submit"
					className="w-full text-white bg-[#19603E]"
				>
					Submit
				</Button>
				<div className="text-center">
					<p className="text-gray-600 text-sm">
						Experiencing issues receiving the code?
					</p>
					<Button variant="link" className="text-sm text-stone-950 underline">
						Resend
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
