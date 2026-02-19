import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { timeRangeSchema } from '@/lib/schemas/availability';
import type { DayOfWeek, WeeklySchedule } from '@/types/availability';

interface AvailabilityScheduleProps {
  initialSchedule?: WeeklySchedule;
  onSubmit: (schedule: WeeklySchedule) => Promise<void>;
  isLoading?: boolean;
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function AvailabilitySchedule({
  initialSchedule = {},
  onSubmit,
  isLoading = false,
}: AvailabilityScheduleProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTimeRange = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '09:00', end: '17:00' }],
    }));
  };

  const removeTimeRange = (day: DayOfWeek, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index),
    }));
  };

  const updateTimeRange = (day: DayOfWeek, index: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => {
      const dayRanges = [...(prev[day] || [])];
      dayRanges[index] = { ...dayRanges[index], [field]: value };
      return { ...prev, [day]: dayRanges };
    });

    // Clear error for this field when user types
    const errorKey = `${day}-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(schedule).forEach(([day, ranges]) => {
      ranges.forEach((range, index) => {
        const result = timeRangeSchema.safeParse(range);
        if (!result.success) {
          const errorKey = `${day}-${index}`;
          newErrors[errorKey] = result.error.errors[0]?.message || 'Invalid time range';
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSchedule()) {
      return;
    }

    await onSubmit(schedule);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability Schedule</CardTitle>
        <CardDescription>
          Set your recurring weekly availability. Clients can only book during these times.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {DAYS_OF_WEEK.map(({ key: day, label }) => (
            <div key={day} className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-semibold text-base">{label}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeRange(day)}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Add Time Range
                </Button>
              </div>

              {schedule[day] && schedule[day].length > 0 ? (
                <div className="space-y-2">
                  {schedule[day].map((range, index) => {
                    const errorKey = `${day}-${index}`;
                    const hasError = !!errors[errorKey];

                    return (
                      <div key={`${day}-${index}-${range.start}-${range.end}`} className="flex items-start gap-2">
                        <div className="flex-1 gap-2 grid grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor={`${day}-${index}-start`} className="text-sm">
                              Start Time
                            </Label>
                            <Input
                              id={`${day}-${index}-start`}
                              type="time"
                              value={range.start}
                              onChange={(e) => updateTimeRange(day, index, 'start', e.target.value)}
                              disabled={isLoading}
                              aria-invalid={hasError}
                              aria-describedby={hasError ? `${errorKey}-error` : undefined}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${day}-${index}-end`} className="text-sm">
                              End Time
                            </Label>
                            <Input
                              id={`${day}-${index}-end`}
                              type="time"
                              value={range.end}
                              onChange={(e) => updateTimeRange(day, index, 'end', e.target.value)}
                              disabled={isLoading}
                              aria-invalid={hasError}
                              aria-describedby={hasError ? `${errorKey}-error` : undefined}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeRange(day, index)}
                          disabled={isLoading}
                          className="mt-6"
                          aria-label={`Remove time range ${index + 1} for ${label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {hasError && (
                          <p id={`${errorKey}-error`} className="col-span-2 font-medium text-destructive text-sm">
                            {errors[errorKey]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No availability set for this day</p>
              )}
            </div>
          ))}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please fix the validation errors before saving.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
