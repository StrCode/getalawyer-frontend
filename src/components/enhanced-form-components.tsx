import {
  AlertTriangleIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InfoCircleIcon,
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFieldContext } from "@/hooks/form-context";
import { 
  useFieldValidation, 
  useSuccessState,
  useValidation
} from "@/hooks/use-validation";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/stores/enhanced-onboarding-store";
import { ErrorPriority, ErrorPriority } from "@/utils/validation-engine";
import { Checkbox } from "./ui/checkbox";

/**
 * Enhanced text field with real-time validation and success feedback
 */
export function EnhancedTextField({
  label,
  placeholder,
  startIcon: StartIcon,
  step,
  fieldName,
  description,
  showSuccessState = true,
  validateOnBlur = true,
  validateOnChange = true,
}: {
  label: string;
  placeholder?: string;
  startIcon?: IconSvgElement;
  step: OnboardingStep;
  fieldName: string;
  description?: string;
  showSuccessState?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const isTouched = useStore(field.store, (state) => state.meta.isTouched);
  
  const {
    isValid,
    error,
    warning,
    isValidating,
    isRequired,
    hasError,
    hasWarning,
    errorMessage,
    warningMessage,
    suggestion,
    validate
  } = useFieldValidation(step, fieldName, field.state.value);

  const { addSuccessMessage } = useSuccessState(step);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle success state
  useEffect(() => {
    if (isValid && isTouched && field.state.value && showSuccessState) {
      setShowSuccess(true);
      if (error?.priority !== ErrorPriority.CRITICAL) {
        addSuccessMessage(`${label} looks good!`);
      }
      
      // Hide success indicator after 2 seconds
      const timeout = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowSuccess(false);
    }
  }, [isValid, isTouched, field.state.value, showSuccessState, label, addSuccessMessage, error]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    
    if (hasError) {
      return (
        <HugeiconsIcon 
          icon={CancelCircleIcon} 
          className="text-red-500" 
          size={16} 
        />
      );
    }
    
    if (hasWarning) {
      return (
        <HugeiconsIcon 
          icon={AlertTriangleIcon} 
          className="text-amber-500" 
          size={16} 
        />
      );
    }
    
    if (showSuccess && isValid) {
      return (
        <HugeiconsIcon 
          icon={CheckmarkCircle02Icon} 
          className="text-green-500" 
          size={16} 
        />
      );
    }
    
    return null;
  };

  const getFieldClassName = () => {
    const baseClass = "h-14 rounded-2xl transition-colors";
    
    if (hasError) {
      return cn(baseClass, "border-red-500 focus:border-red-500 focus:ring-red-500/20");
    }
    
    if (hasWarning) {
      return cn(baseClass, "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20");
    }
    
    if (showSuccess && isValid) {
      return cn(baseClass, "border-green-500 focus:border-green-500 focus:ring-green-500/20");
    }
    
    return baseClass;
  };

  return (
    <Field>
      <div className="flex items-center gap-2">
        <FieldLabel htmlFor={fieldName} className="flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-500">*</span>}
        </FieldLabel>
        {description && (
          <Tooltip>
            <TooltipTrigger>
              <HugeiconsIcon icon={InfoCircleIcon} size={14} className="text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <InputGroup>
        <InputGroupInput
          type="text"
          className={getFieldClassName()}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={(e) => {
            field.handleBlur();
            if (validateOnBlur) {
              validate();
            }
          }}
          onChange={(e) => {
            field.handleChange(e.target.value);
            if (validateOnChange && e.target.value) {
              // Debounced validation happens automatically in useFieldValidation
            }
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldName}-error` : undefined}
        />
        
        {StartIcon && (
          <InputGroupAddon>
            <HugeiconsIcon icon={StartIcon} />
          </InputGroupAddon>
        )}
        
        {(hasError || hasWarning || showSuccess || isValidating) && (
          <InputGroupAddon align="inline-end">
            {getValidationIcon()}
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Error Message */}
      {hasError && errorMessage && (
        <div id={`${fieldName}-error`} className="mt-1">
          <FieldError className="flex items-start gap-2">
            <HugeiconsIcon icon={CancelCircleIcon} size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{errorMessage}</div>
              {suggestion && (
                <div className="text-xs text-gray-600 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </FieldError>
        </div>
      )}

      {/* Warning Message */}
      {!hasError && hasWarning && warningMessage && (
        <div className="mt-1">
          <div className="flex items-start gap-2 text-amber-600 text-sm">
            <HugeiconsIcon icon={AlertTriangleIcon} size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{warningMessage}</div>
              {suggestion && (
                <div className="text-xs text-amber-700 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!hasError && !hasWarning && showSuccess && isValid && (
        <div className="mt-1">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-green-500" />
            <span>Looks good!</span>
          </div>
        </div>
      )}
    </Field>
  );
}

/**
 * Enhanced password field with strength validation
 */
export function EnhancedPasswordField({
  label,
  placeholder = "Enter your password",
  step,
  fieldName,
  description,
  withStrengthMeter = false,
  showSuccessState = true,
}: {
  label: string;
  placeholder?: string;
  step: OnboardingStep;
  fieldName: string;
  description?: string;
  withStrengthMeter?: boolean;
  showSuccessState?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const field = useFieldContext<string>();
  const isTouched = useStore(field.store, (state) => state.meta.isTouched);
  
  const {
    isValid,
    error,
    warning,
    isValidating,
    isRequired,
    hasError,
    hasWarning,
    errorMessage,
    warningMessage,
    suggestion,
    validate
  } = useFieldValidation(step, fieldName, field.state.value);

  const [showSuccess, setShowSuccess] = useState(false);

  // Handle success state
  useEffect(() => {
    if (isValid && isTouched && field.state.value && showSuccessState) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowSuccess(false);
    }
  }, [isValid, isTouched, field.state.value, showSuccessState]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    
    if (hasError) {
      return <HugeiconsIcon icon={CancelCircleIcon} className="text-red-500" size={16} />;
    }
    
    if (hasWarning) {
      return <HugeiconsIcon icon={AlertTriangleIcon} className="text-amber-500" size={16} />;
    }
    
    if (showSuccess && isValid) {
      return <HugeiconsIcon icon={CheckmarkCircle02Icon} className="text-green-500" size={16} />;
    }
    
    return null;
  };

  const getFieldClassName = () => {
    const baseClass = "h-14 rounded-2xl transition-colors";
    
    if (hasError) {
      return cn(baseClass, "border-red-500 focus:border-red-500 focus:ring-red-500/20");
    }
    
    if (hasWarning) {
      return cn(baseClass, "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20");
    }
    
    if (showSuccess && isValid) {
      return cn(baseClass, "border-green-500 focus:border-green-500 focus:ring-green-500/20");
    }
    
    return baseClass;
  };

  return (
    <Field>
      <div className="flex items-center gap-2">
        <FieldLabel htmlFor={fieldName} className="flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-500">*</span>}
        </FieldLabel>
        {description && (
          <Tooltip>
            <TooltipTrigger>
              <HugeiconsIcon icon={InfoCircleIcon} size={14} className="text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <InputGroup>
        <InputGroupInput
          id={fieldName}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={getFieldClassName()}
          value={field.state.value}
          onBlur={(e) => {
            field.handleBlur();
            validate();
          }}
          onChange={(e) => {
            field.handleChange(e.target.value);
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldName}-error` : undefined}
        />

        <InputGroupAddon>
          <HugeiconsIcon icon={LockKeyIcon} />
        </InputGroupAddon>

        <InputGroupAddon align="inline-end" className="flex items-center gap-1">
          {(hasError || hasWarning || showSuccess || isValidating) && (
            <div className="mr-1">
              {getValidationIcon()}
            </div>
          )}
          
          <Button
            variant="link"
            size="icon-xs"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={1.5} />
            ) : (
              <HugeiconsIcon icon={ViewOffIcon} size={16} strokeWidth={1.5} />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>

      {/* Error Message */}
      {hasError && errorMessage && (
        <div id={`${fieldName}-error`} className="mt-1">
          <FieldError className="flex items-start gap-2">
            <HugeiconsIcon icon={CancelCircleIcon} size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{errorMessage}</div>
              {suggestion && (
                <div className="text-xs text-gray-600 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </FieldError>
        </div>
      )}

      {/* Warning Message */}
      {!hasError && hasWarning && warningMessage && (
        <div className="mt-1">
          <div className="flex items-start gap-2 text-amber-600 text-sm">
            <HugeiconsIcon icon={AlertTriangleIcon} size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{warningMessage}</div>
              {suggestion && (
                <div className="text-xs text-amber-700 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!hasError && !hasWarning && showSuccess && isValid && (
        <div className="mt-1">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-green-500" />
            <span>Password looks secure!</span>
          </div>
        </div>
      )}

      {/* Strength Meter (if enabled) */}
      {withStrengthMeter && field.state.value && (
        <div className="mt-3">
          {/* This would integrate with the existing PasswordStrength component */}
          <div className="text-xs text-gray-600">
            Password strength indicator would go here
          </div>
        </div>
      )}
    </Field>
  );
}

/**
 * Enhanced checkbox field with validation
 */
export function EnhancedCheckboxField({
  label,
  description,
  step,
  fieldName,
  showSuccessState = true,
}: {
  label: string;
  description?: string;
  step: OnboardingStep;
  fieldName: string;
  showSuccessState?: boolean;
}) {
  const field = useFieldContext<boolean>();
  const isTouched = useStore(field.store, (state) => state.meta.isTouched);
  
  const {
    isValid,
    error,
    warning,
    isRequired,
    hasError,
    hasWarning,
    errorMessage,
    warningMessage,
    suggestion,
    validate
  } = useFieldValidation(step, fieldName, field.state.value);

  const [showSuccess, setShowSuccess] = useState(false);

  // Handle success state
  useEffect(() => {
    if (isValid && isTouched && field.state.value && showSuccessState) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowSuccess(false);
    }
  }, [isValid, isTouched, field.state.value, showSuccessState]);

  return (
    <Field>
      <div className="flex justify-center items-start gap-3">
        <Checkbox
          name={fieldName}
          onBlur={() => {
            field.handleBlur();
            validate();
          }}
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => {
            field.handleChange(checked);
            validate();
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldName}-error` : undefined}
          className={cn(
            "transition-colors",
            hasError && "border-red-500 data-[state=checked]:bg-red-500",
            hasWarning && "border-amber-500 data-[state=checked]:bg-amber-500",
            showSuccess && isValid && "border-green-500 data-[state=checked]:bg-green-500"
          )}
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor={fieldName} className="cursor-pointer flex items-center gap-1">
              {label}
              {isRequired && <span className="text-red-500">*</span>}
            </FieldLabel>
            
            {showSuccess && isValid && (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-green-500" />
            )}
            
            {hasError && (
              <HugeiconsIcon icon={CancelCircleIcon} size={14} className="text-red-500" />
            )}
            
            {hasWarning && (
              <HugeiconsIcon icon={AlertTriangleIcon} size={14} className="text-amber-500" />
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && errorMessage && (
        <div id={`${fieldName}-error`} className="mt-2 ml-7">
          <FieldError className="flex items-start gap-2">
            <HugeiconsIcon icon={CancelCircleIcon} size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{errorMessage}</div>
              {suggestion && (
                <div className="text-xs text-gray-600 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </FieldError>
        </div>
      )}

      {/* Warning Message */}
      {!hasError && hasWarning && warningMessage && (
        <div className="mt-2 ml-7">
          <div className="flex items-start gap-2 text-amber-600 text-sm">
            <HugeiconsIcon icon={AlertTriangleIcon} size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <div>{warningMessage}</div>
              {suggestion && (
                <div className="text-xs text-amber-700 mt-1">
                  💡 {suggestion}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Field>
  );
}

/**
 * Validation summary component for displaying step-level validation status
 */
export function ValidationSummary({
  step,
  showSuccessMessage = true,
  className,
}: {
  step: OnboardingStep;
  showSuccessMessage?: boolean;
  className?: string;
}) {
  const { validationState, prioritizedErrors } = useValidation(step);
  
  if (validationState.isValid && showSuccessMessage && validationState.successMessage) {
    return (
      <div className={cn("p-3 bg-green-50 border border-green-200 rounded-lg", className)}>
        <div className="flex items-center gap-2 text-green-700">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500" />
          <span className="text-sm font-medium">{validationState.successMessage}</span>
        </div>
      </div>
    );
  }
  
  if (prioritizedErrors.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("p-3 bg-red-50 border border-red-200 rounded-lg", className)}>
      <div className="space-y-2">
        {prioritizedErrors.map((error, index) => (
          <div key={index} className="flex items-start gap-2 text-red-700">
            <HugeiconsIcon 
              icon={error.priority === ErrorPriority.CRITICAL ? CancelCircleIcon : AlertTriangleIcon} 
              size={16} 
              className={error.priority === ErrorPriority.CRITICAL ? "text-red-500" : "text-amber-500"} 
            />
            <div className="text-sm">
              <div className="font-medium">{error.message}</div>
              {error.suggestion && (
                <div className="text-xs text-red-600 mt-1">
                  💡 {error.suggestion}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}