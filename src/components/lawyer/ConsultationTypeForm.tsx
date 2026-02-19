import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { consultationTypeSchema } from '@/lib/schemas/consultation-type';
import type { ConsultationType } from '@/types/booking';

interface ConsultationTypeFormProps {
  initialData?: ConsultationType;
  onSubmit: (data: {
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ConsultationTypeForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ConsultationTypeFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      duration: initialData?.duration ?? 30,
      price: initialData?.price ?? 0,
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Consultation Type' : 'Create Consultation Type'}</CardTitle>
        <CardDescription>
          {initialData
            ? 'Update the details of your consultation type'
            : 'Define a new consultation type for your practice'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = consultationTypeSchema.shape.name.safeParse(value);
                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="required">
                  Name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Initial Consultation"
                  disabled={isLoading}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description Field */}
          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) => {
                const result = consultationTypeSchema.shape.description.safeParse(value);
                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe what this consultation includes..."
                  rows={4}
                  disabled={isLoading}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Duration Field */}
          <form.Field
            name="duration"
            validators={{
              onChange: ({ value }) => {
                const result = consultationTypeSchema.shape.duration.safeParse(value);
                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="required">
                  Duration (minutes)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="30"
                  min="1"
                  disabled={isLoading}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Price Field */}
          <form.Field
            name="price"
            validators={{
              onChange: ({ value }) => {
                const result = consultationTypeSchema.shape.price.safeParse(value);
                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="required">
                  Price
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Is Active Field */}
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                  disabled={isLoading}
                  aria-label="Active status"
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  Active (visible to clients)
                </Label>
              </div>
            )}
          </form.Field>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
