import { useId, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
	CheckIcon,
	EyeIcon,
	EyeOffIcon,
	XIcon,
	LockKeyholeIcon,
} from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { GroupSeparator } from "@/components/ui/group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

export function NewPassword() {
	const id = useId();
	const [showPassword, setShowPassword] = useState(false);

	const [password, setPassword] = useState("");
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const toggleVisibility = () => setIsVisible((prevState) => !prevState);

	const checkStrength = (pass: string) => {
		const requirements = [
			{ regex: /.{8,}/, text: "At least 8 characters" },
			{ regex: /[0-9]/, text: "At least 1 number" },
			{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
			{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
		];

		return requirements.map((req) => ({
			met: req.regex.test(pass),
			text: req.text,
		}));
	};

	const strength = checkStrength(password);

	const strengthScore = useMemo(() => {
		return strength.filter((req) => req.met).length;
	}, [strength]);

	const getStrengthColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const getStrengthText = (score: number) => {
		if (score === 0) return "Enter a password";
		if (score <= 2) return "Weak password";
		if (score === 3) return "Medium password";
		return "Strong password";
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<div
					className="size-24 mx-auto rounded-full p-4"
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
					Set new password
				</CardTitle>
				<CardDescription>
					Your new password must be different to previously used passwords.
				</CardDescription>
				<Separator className="mt-4" />
			</CardHeader>
			<Form>
				<CardPanel className="flex flex-col gap-4">
					<Field>
						<FieldLabel>Password</FieldLabel>
						<InputGroup>
							<InputGroupInput
								size={"lg"}
								className={"text-sm placeholder:text-sm"}
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								aria-label="Password with toggle visibility"
							/>
							<InputGroupAddon>
								<LockKeyholeIcon />
							</InputGroupAddon>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => setShowPassword(!showPassword)}
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
											/>
										}
									>
										{showPassword ? <EyeOffIcon /> : <EyeIcon />}
									</TooltipTrigger>
									<TooltipPopup>
										{showPassword ? "Hide password" : "Show password"}
									</TooltipPopup>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel>Confirm Password</FieldLabel>
						<InputGroup>
							<InputGroupInput
								size={"lg"}
								className={"text-sm placeholder:text-sm"}
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								aria-label="Password with toggle visibility"
							/>
							<InputGroupAddon>
								<LockKeyholeIcon />
							</InputGroupAddon>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => setShowPassword(!showPassword)}
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
											/>
										}
									>
										{showPassword ? <EyeOffIcon /> : <EyeIcon />}
									</TooltipTrigger>
									<TooltipPopup>
										{showPassword ? "Hide password" : "Show password"}
									</TooltipPopup>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>

						{/* Password strength indicator */}
						<div
							className="mt-1 mb-1 h-1 w-full overflow-hidden rounded-full bg-border"
							role="progressbar"
							aria-valuenow={strengthScore}
							aria-valuemin={0}
							aria-valuemax={4}
							aria-label="Password strength"
						>
							<div
								className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
								style={{ width: `${(strengthScore / 4) * 100}%` }}
							></div>
						</div>

						{/* Password strength description */}
						<p
							id={`${id}-description`}
							className="text-sm font-medium text-foreground"
						>
							{getStrengthText(strengthScore)}. Must contain:
						</p>

						{/* Password requirements list */}
						<ul className="space-y-1.5" aria-label="Password requirements">
							{strength.map((req, index) => (
								<li key={index} className="flex items-center gap-2">
									{req.met ? (
										<CheckIcon
											size={14}
											className="text-white rounded-full p-0.5 bg-emerald-500"
											aria-hidden="true"
										/>
									) : (
										<XIcon
											size={14}
											className="text-gray-950 bg-stone-200 rounded-full p-0.5"
											aria-hidden="true"
										/>
									)}
									<span
										className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
									>
										{req.text}
										<span className="sr-only">
											{req.met
												? " - Requirement met"
												: " - Requirement not met"}
										</span>
									</span>
								</li>
							))}
						</ul>
					</Field>
				</CardPanel>
				<CardFooter>
					<Button
						size={"lg"}
						variant={"default"}
						className="w-full"
						type="submit"
					>
						Submit
					</Button>
				</CardFooter>
			</Form>
		</Card>
	);
}
