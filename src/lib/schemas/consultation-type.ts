import { z } from 'zod';

// Consultation Type Schema
export const consultationTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less'),
  duration: z.number().int('Duration must be a whole number').positive('Duration must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
  isActive: z.boolean().default(true)
});

export const createConsultationTypeSchema = consultationTypeSchema;

export const updateConsultationTypeSchema = consultationTypeSchema.partial();

export type ConsultationTypeFormData = z.infer<typeof consultationTypeSchema>;
export type CreateConsultationTypeFormData = z.infer<typeof createConsultationTypeSchema>;
export type UpdateConsultationTypeFormData = z.infer<typeof updateConsultationTypeSchema>;
