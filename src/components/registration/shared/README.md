# Shared Registration Components

This directory contains reusable components used across all registration steps.

## Components

### RegistrationLayout

Wraps all registration steps with common UI elements.

**Props:**
- `currentStep: number` - The current step number (1-7)
- `totalSteps: number` - Total number of steps (7)
- `children: React.ReactNode` - The step form content
- `className?: string` - Optional additional CSS classes

**Features:**
- Responsive container with max-width
- Integrated progress indicator
- Consistent card-based layout
- Mobile-optimized spacing

**Requirements:** 8.1, 8.2

**Usage:**
```tsx
<RegistrationLayout currentStep={2} totalSteps={7}>
  <PersonalInfoForm />
</RegistrationLayout>
```

### ProgressIndicator

Displays visual progress through the registration steps.

**Props:**
- `currentStep: number` - The current step number (1-7)
- `totalSteps: number` - Total number of steps (7)
- `className?: string` - Optional additional CSS classes

**Features:**
- Progress bar showing percentage completion
- Step indicators with checkmarks for completed steps
- Current step highlighted with blue ring
- Future steps shown as locked (gray)
- Responsive connector lines between steps
- ARIA labels for accessibility

**Requirements:** 8.1, 8.2, 8.3, 8.4

**Usage:**
```tsx
<ProgressIndicator currentStep={3} totalSteps={7} />
```

### FormActions

Provides consistent action buttons for registration forms.

**Props:**
- `onSaveAndContinue: () => void` - Handler for save and continue action
- `onSaveAndExit: () => void` - Handler for save and exit action
- `isSubmitting: boolean` - Loading state during form submission
- `isSaveAndContinueDisabled?: boolean` - Disable the continue button
- `saveAndContinueText?: string` - Custom text for continue button (default: "Save & Continue")
- `saveAndExitText?: string` - Custom text for exit button (default: "Save & Exit")
- `className?: string` - Optional additional CSS classes

**Features:**
- Primary "Save & Continue" button (validates and proceeds)
- Secondary "Save & Exit" button (saves and returns to dashboard)
- Loading spinner during submission
- Disabled states for validation failures
- Mobile-responsive layout (stacked on mobile, inline on desktop)
- ARIA labels for accessibility

**Requirements:** 8.5, 8.6, 8.7

**Usage:**
```tsx
<FormActions
  onSaveAndContinue={handleSubmit(onSubmit)}
  onSaveAndExit={handleSaveAndExit}
  isSubmitting={isSubmitting}
  isSaveAndContinueDisabled={!isValid}
/>
```

## Design Patterns

### Accessibility
- All components include proper ARIA labels
- Progress indicators use `role="progressbar"` with aria-valuenow
- Current step marked with `aria-current="step"`
- Loading states announced with aria-live regions

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Progress indicators adapt to screen size
- Form actions stack vertically on mobile
- Touch-friendly button sizes

### Visual Feedback
- Completed steps: Green checkmark with green background
- Current step: Blue background with ring highlight
- Future steps: Gray with locked appearance
- Loading states: Spinner animation with "Saving..." text

## Testing

Property-based tests for these components are defined in task 4.4 (optional):
- Property 32: Progress bar accuracy
- Property 33: Step indicator checkmarks
- Property 34: Action buttons presence

## Integration

These components are designed to work together:

```tsx
import { RegistrationLayout, FormActions } from '@/components/registration/shared';

function Step2PersonalInfo() {
  const { handleSubmit, formState: { isValid, isSubmitting } } = useForm();
  
  return (
    <RegistrationLayout currentStep={2} totalSteps={7}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
        
        <FormActions
          onSaveAndContinue={handleSubmit(onSubmit)}
          onSaveAndExit={handleSaveAndExit}
          isSubmitting={isSubmitting}
          isSaveAndContinueDisabled={!isValid}
        />
      </form>
    </RegistrationLayout>
  );
}
```
