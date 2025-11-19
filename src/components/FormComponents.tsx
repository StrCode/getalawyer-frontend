import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '@/hooks/form-context'

import { CalendarIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export function TextField({
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
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          size={"lg"}
          className={"text-sm placeholder:text-sm"}
          aria-label="h"
          type="text"
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        <InputGroupAddon>
        </InputGroupAddon>
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
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

// export function TextField({
//   label,
//   placeholder,
// }: {
//   label: string
//   placeholder?: string
// }) {
//   const field = useFieldContext<string>()
//   const errors = useStore(field.store, (state) => state.meta.errors)
//
//   return (
//     <div>
//       <Label htmlFor={label} className="mb-2 text-xl font-bold">
//         {label}
//       </Label>
//       <Input
//         value={field.state.value}
//         placeholder={placeholder}
//         onBlur={field.handleBlur}
//         onChange={(e) => field.handleChange(e.target.value)}
//       />
//       {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
//     </div>
//   )
// }
//
// export function TextArea({
//   label,
//   rows = 3,
// }: {
//   label: string
//   rows?: number
// }) {
//   const field = useFieldContext<string>()
//   const errors = useStore(field.store, (state) => state.meta.errors)
//
//   return (
//     <div>
//       <Label htmlFor={label} className="mb-2 text-xl font-bold">
//         {label}
//       </Label>
//       <ShadcnTextarea
//         id={label}
//         value={field.state.value}
//         onBlur={field.handleBlur}
//         rows={rows}
//         onChange={(e) => field.handleChange(e.target.value)}
//       />
//       {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
//     </div>
//   )
// }
//
// export function Select({
//   label,
//   values,
//   placeholder,
// }: {
//   label: string
//   values: Array<{ label: string; value: string }>
//   placeholder?: string
// }) {
//   const field = useFieldContext<string>()
//   const errors = useStore(field.store, (state) => state.meta.errors)
//
//   return (
//     <div>
//       <ShadcnSelect.Select
//         name={field.name}
//         value={field.state.value}
//         onValueChange={(value) => field.handleChange(value)}
//       >
//         <ShadcnSelect.SelectTrigger className="w-full">
//           <ShadcnSelect.SelectValue placeholder={placeholder} />
//         </ShadcnSelect.SelectTrigger>
//         <ShadcnSelect.SelectContent>
//           <ShadcnSelect.SelectGroup>
//             <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
//             {values.map((value) => (
//               <ShadcnSelect.SelectItem key={value.value} value={value.value}>
//                 {value.label}
//               </ShadcnSelect.SelectItem>
//             ))}
//           </ShadcnSelect.SelectGroup>
//         </ShadcnSelect.SelectContent>
//       </ShadcnSelect.Select>
//       {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
//     </div>
//   )
// }
//
// export function Slider({ label }: { label: string }) {
//   const field = useFieldContext<number>()
//   const errors = useStore(field.store, (state) => state.meta.errors)
//
//   return (
//     <div>
//       <Label htmlFor={label} className="mb-2 text-xl font-bold">
//         {label}
//       </Label>
//       <ShadcnSlider
//         id={label}
//         onBlur={field.handleBlur}
//         value={[field.state.value]}
//         onValueChange={(value) => field.handleChange(value[0])}
//       />
//       {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
//     </div>
//   )
// }
//
// export function Switch({ label }: { label: string }) {
//   const field = useFieldContext<boolean>()
//   const errors = useStore(field.store, (state) => state.meta.errors)
//
//   return (
//     <div>
//       <div className="flex items-center gap-2">
//         <ShadcnSwitch
//           id={label}
//           onBlur={field.handleBlur}
//           checked={field.state.value}
//           onCheckedChange={(checked) => field.handleChange(checked)}
//         />
//         <Label htmlFor={label}>{label}</Label>
//       </div>
//       {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
//     </div>
//   )
// }
