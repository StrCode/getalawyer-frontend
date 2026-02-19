import { z } from 'zod';

// Booking Schema
export const bookingSchema = z.object({
  lawyerId: z.string().uuid('Invalid lawyer ID'),
  consultationTypeId: z.string().uuid('Invalid consultation type ID'),
  startTime: z.string().datetime('Invalid datetime format'),
  clientNotes: z.string().max(500, 'Notes must be 500 characters or less').optional()
});

// Update Booking Schema (for clients)
export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  clientNotes: z.string().max(500, 'Notes must be 500 characters or less').optional()
});

// Update Lawyer Booking Schema
export const updateLawyerBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  lawyerNotes: z.string().max(500, 'Notes must be 500 characters or less').optional()
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type UpdateBookingFormData = z.infer<typeof updateBookingSchema>;
export type UpdateLawyerBookingFormData = z.infer<typeof updateLawyerBookingSchema>;
