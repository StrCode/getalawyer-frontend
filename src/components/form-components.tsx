import { useStore } from "@tanstack/react-form";
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { useMemo, useState } from "react";

import { HugeiconsIcon } from '@hugeicons/react';
import { Checkbox } from "./ui/checkbox";
import type { IconSvgElement } from '@hugeicons/react';
import { useFieldContext, useFormContext } from "@/hooks/form-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

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
  startIcon?: IconSvgElement;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          type="text"
          className="h-14 rounded-2xl"
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={errors.length > 0}
        />
        {StartIcon && (
          <InputGroupAddon>
            <HugeiconsIcon icon={StartIcon} />
          </InputGroupAddon>
        )}
      </InputGroup>

      {field.state.meta.isTouched && errors.length > 0 && (
        <FieldError>
          {typeof errors[0] === "string" ? errors[0] : errors[0].message}
        </FieldError>
      )}
    </Field>
  );
}

export function PasswordField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={label}
          className="pe-9"
          placeholder={placeholder}
          value={field.state.value}
          type={isVisible ? "text" : "password"}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={errors.length > 0}
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={LockKeyIcon} />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Button
            variant={"link"}
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            aria-controls="password"
          >
            {isVisible ? (
              <HugeiconsIcon
                icon={ViewIcon}
                size={16}
                strokeWidth={1.5}
              />
            ) : (
              <HugeiconsIcon
                icon={ViewOffIcon}
                size={16}
                strokeWidth={1.5}
              />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>

      {field.state.meta.isTouched && errors.length > 0 && (
        <FieldError>
          {typeof errors[0] === "string" ? errors[0] : errors[0].message}
        </FieldError>
      )}
    </Field>
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
          aria-invalid={errors.length > 0}
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
      {field.state.meta.isTouched && errors.length > 0 && (
        <FieldError>
          {typeof errors[0] === "string" ? errors[0] : errors[0].message}
        </FieldError>
      )}
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
    <Field>
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
          aria-invalid={errors.length > 0}
        />
      </div>
      {field.state.meta.isTouched && errors.length > 0 && (
        <FieldError>
          {typeof errors[0] === "string" ? errors[0] : errors[0].message}
        </FieldError>
      )}
    </Field>
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
              <HugeiconsIcon icon={CheckmarkCircle02Icon}
                size={14}
                className="text-white rounded-full p-0.5 bg-emerald-500"
              />
            ) : (
              <HugeiconsIcon icon={CancelCircleIcon}
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
          <HugeiconsIcon icon={LockKeyIcon} />
        </InputGroupAddon>

        <InputGroupAddon align="inline-end">
          <Button
            variant={"link"}
            size={"icon-xs"}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls="password"
          >
            {showPassword ? (
              <HugeiconsIcon
                icon={ViewIcon}
                size={16}
                strokeWidth={1.5}
              />
            ) : (
              <HugeiconsIcon
                icon={ViewOffIcon}
                size={16}
                strokeWidth={1.5}
              />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )
      }

      {
        withStrengthMeter && (
          <PasswordStrength id={field.state.value} value={field.state.value} />
        )
      }

      {
        isTouched && errors.length > 0 && (
          <FieldError>
            {typeof errors[0] === "string" ? errors[0] : errors[0].message}
          </FieldError>
        )
      }
    </Field >
  );
}
