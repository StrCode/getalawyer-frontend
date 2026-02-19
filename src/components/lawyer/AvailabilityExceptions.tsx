import { useForm } from '@tanstack/react-form';
import { format } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { availabilityExceptionSchema } from '@/lib/schemas/availability';
import type { AvailabilityException, CreateExceptionInput } from '@/types/availability';

interface AvailabilityExceptionsProps {
  exceptions: AvailabilityException[];
  onCreateException: (data: CreateExceptionInput) => Promise<void>;
  onDeleteException: (id: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  isDeleting?: boolean;
}

export function AvailabilityExceptions({
  exceptions,
  onCreateException,
  onDeleteException,
  isLoading = false,
  isCreating = false,
  isDeleting = false,
}: AvailabilityExceptionsProps) {
  const form = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      reason: '',
    },
    onSubmit: async ({ value }) => {
      // Validate using Zod schema
      const result = availabilityExceptionSchema.safeParse(value);
      if (!result.success) {
        // Validation errors will be shown in field-level validation
        return;
      }
      
      await onCreateException(value);
      // Reset form after successful submission
      form.reset();
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Exception Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Availability Exception</CardTitle>
          <CardDescription>
            Block out dates when you're unavailable (vacation, holidays, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              {/* Start Date Field */}
              <form.Field
                name="startDate"
                validators={{
                  onChange: ({ value }) => {
                    const result = availabilityExceptionSchema.shape.startDate.safeParse(value);
                    return result.success ? undefined : result.error.errors[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="required">
                      Start Date
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isCreating}
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

              {/* End Date Field */}
              <form.Field
                name="endDate"
                validators={{
                  onChange: ({ value }) => {
                    const result = availabilityExceptionSchema.shape.endDate.safeParse(value);
                    return result.success ? undefined : result.error.errors[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="required">
                      End Date
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isCreating}
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
            </div>

            {/* Reason Field */}
            <form.Field
              name="reason"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined; // Optional field
                  const result = availabilityExceptionSchema.shape.reason.safeParse(value);
                  return result.success ? undefined : result.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Reason (Optional)</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Vacation, Conference, Holiday"
                    rows={2}
                    disabled={isCreating}
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add Exception'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Exceptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Exceptions</CardTitle>
          <CardDescription>
            Dates when you're unavailable for consultations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading exceptions...</p>
          ) : exceptions.length === 0 ? (
            <Alert>
              <Calendar className="w-4 h-4" />
              <AlertTitle>No exceptions set</AlertTitle>
              <AlertDescription>
                You haven't blocked out any dates yet. Add an exception above to mark dates when you're unavailable.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="flex justify-between items-start p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">
                        {formatDate(exception.startDate)} - {formatDate(exception.endDate)}
                      </p>
                    </div>
                    {exception.reason && (
                      <p className="text-muted-foreground text-sm">{exception.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteException(exception.id)}
                    disabled={isDeleting}
                    aria-label={`Delete exception from ${formatDate(exception.startDate)} to ${formatDate(exception.endDate)}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
