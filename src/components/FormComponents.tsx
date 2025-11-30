import { useStore } from "@tanstack/react-form";
import { useFieldContext, useFormContext } from "@/hooks/form-context";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import {
	LucideIcon,
	CheckIcon,
	EyeIcon,
	EyeOffIcon,
	LockKeyholeIcon,
	XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { Checkbox } from "./ui/checkbox";

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

export function TextField({
	label,
	placeholder,
	startIcon: StartIcon,
}: {
	label: string;
	placeholder?: string;
	startIcon?: LucideIcon;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<FieldLabel htmlFor={label}>{label}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					size={"default"}
					className={"placeholder:text-base"}
					aria-label="h"
					type="text"
					value={field.state.value}
					placeholder={placeholder}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
				/>
				{StartIcon && (
					<InputGroupAddon>
						<StartIcon />
					</InputGroupAddon>
				)}
			</InputGroup>
			<FieldError>
				{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
			</FieldError>
		</Field>
	);
}

export function PasswordField({
	label,
	placeholder,
}: {
	label: string;
	placeholder: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	const [isVisible, setIsVisible] = useState<boolean>(false);
	const toggleVisibility = () => setIsVisible((prevState) => !prevState);

	return (
		<div className="gap-3 grid">
			<Label htmlFor={label}>{label}</Label>
			<div className="relative">
				<Input
					id={label}
					className="pe-9"
					placeholder={placeholder}
					value={field.state.value}
					type={isVisible ? "text" : "password"}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
				/>
				<button
					className="focus:z-10 absolute inset-y-0 flex justify-center items-center disabled:opacity-50 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 w-9 h-full text-muted-foreground/80 hover:text-foreground transition-[color,box-shadow] disabled:cursor-not-allowed disabled:pointer-events-none end-0"
					type="button"
					onClick={toggleVisibility}
					aria-label={isVisible ? "Hide password" : "Show password"}
					aria-pressed={isVisible}
					aria-controls="password"
				>
					{isVisible ? (
						<EyeOffIcon size={16} aria-hidden="true" />
					) : (
						<EyeIcon size={16} aria-hidden="true" />
					)}
				</button>
			</div>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

export function CheckboxField({
	label,
	description,
}: {
	label: string;
	description?: string;
}) {
	const field = useFieldContext<boolean>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field>
			<div className="flex justify-center items-center gap-2">
				<Checkbox
					name={label}
					onBlur={field.handleBlur}
					id={field.name}
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(checked)}
				/>
				<div className="flex-1">
					<FieldLabel htmlFor={label} className="cursor-pointer">
						{label}
					</FieldLabel>
					{description && (
						<p className="text-sm text-gray-500 mt-0.5">{description}</p>
					)}
				</div>
			</div>
			<FieldError>
				{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
			</FieldError>
		</Field>
	);
}

export function TimeField({
	label,
	placeholder,
}: {
	label: string;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="gap-3 grid">
			<Label htmlFor={label}>{label}</Label>
			<div className="relative">
				<Input
					type="time"
					step="1"
					value={field.state.value}
					placeholder={placeholder}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</div>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

function ErrorMessages({
	errors,
}: {
	errors: Array<string | { message: string }>;
}) {
	return (
		<>
			{errors.map((error) => (
				<div
					key={typeof error === "string" ? error : error.message}
					className="text-red-500 mt-1 font-bold"
				>
					{typeof error === "string" ? error : error.message}
				</div>
			))}
		</>
	);
}

// --- Helper: Strength Logic ---
const getStrengthStats = (pass: string) => {
	const requirements = [
		{ regex: /.{8,}/, text: "At least 8 characters" },
		{ regex: /[0-9]/, text: "At least 1 number" },
		{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
		{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
	];

	const results = requirements.map((req) => ({
		met: req.regex.test(pass || ""),
		text: req.text,
	}));

	const score = results.filter((r) => r.met).length;
	return { results, score };
};

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

// --- Sub-Component: Visual Strength Meter ---
function PasswordStrength({ value, id }: { value: string; id: string }) {
	const { results, score } = useMemo(() => getStrengthStats(value), [value]);

	return (
		<div className="mt-3">
			{/* Progress Bar */}
			<div
				className="mt-1 mb-2 h-1 w-full overflow-hidden rounded-full bg-border"
				role="progressbar"
				aria-valuenow={score}
				aria-valuemin={0}
				aria-valuemax={4}
			>
				<div
					className={`h-full ${getStrengthColor(score)} transition-all duration-500 ease-out`}
					style={{ width: `${(score / 4) * 100}%` }}
				/>
			</div>

			{/* Text Status */}
			<p
				id={`${id}-strength-desc`}
				className="text-sm font-medium text-foreground"
			>
				{getStrengthText(score)}. Must contain:
			</p>

			{/* Requirements List */}
			<ul className="space-y-1.5 mt-2" aria-label="Password requirements">
				{results.map((req, index) => (
					<li key={index} className="flex items-center gap-2">
						{req.met ? (
							<CheckIcon
								size={14}
								className="text-white rounded-full p-0.5 bg-emerald-500"
							/>
						) : (
							<XIcon
								size={14}
								className="text-gray-950 bg-stone-200 rounded-full p-0.5"
							/>
						)}
						<span
							className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
						>
							{req.text}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

// --- Main Component: PasswordField ---
interface PasswordFieldProps {
	label: string;
	description?: string;
	placeholder?: string;
	/** If true, displays the strength meter bar and checklist below the input */
	withStrengthMeter?: boolean;
}

export function PasswordPassField({
	label,
	description,
	placeholder = "Enter your password",
	withStrengthMeter = false,
}: PasswordFieldProps) {
	const [showPassword, setShowPassword] = useState(false);

	// Get context
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const isTouched = useStore(field.store, (state) => state.meta.isTouched);

	return (
		<Field>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<InputGroup>
				<InputGroupInput
					id={field.name}
					type={showPassword ? "text" : "password"}
					placeholder={placeholder}
					// Form Binding
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={errors.length > 0}
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
									type="button" // Important: prevents form submit
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</Button>
							}
						>
							Hover me
						</TooltipTrigger>
						<TooltipPopup>Helpful hint</TooltipPopup>
					</Tooltip>
				</InputGroupAddon>
			</InputGroup>

			{description && (
				<p className="text-sm text-muted-foreground mt-1">{description}</p>
			)}

			{withStrengthMeter && (
				<PasswordStrength id={field.state.value} value={field.state.value} />
			)}

			<FieldError>
				{isTouched && errors.length > 0 && (
					<span className="text-xs text-red-500">{errors.join(", ")}</span>
				)}
			</FieldError>
		</Field>
	);
}
