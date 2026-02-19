import { z } from 'zod';

// Time Range Schema
export const timeRangeSchema = z.object({
  start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:mm)'),
  end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:mm)')
}).refine(
  (data) => data.start < data.end,
  { message: 'Start time must be before end time', path: ['end'] }
);

// Weekly Schedule Schema
export const weeklyScheduleSchema = z.record(
  z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  z.array(timeRangeSchema)
);

// Availability Exception Schema
export const availabilityExceptionSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
  reason: z.string().max(200, 'Reason must be 200 characters or less').optional()
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'Start date must be before or equal to end date', path: ['endDate'] }
);

export type TimeRangeFormData = z.infer<typeof timeRangeSchema>;
export type WeeklyScheduleFormData = z.infer<typeof weeklyScheduleSchema>;
export type AvailabilityExceptionFormData = z.infer<typeof availabilityExceptionSchema>;
