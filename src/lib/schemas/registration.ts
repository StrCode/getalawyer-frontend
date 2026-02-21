import { z } from 'zod';

// Step 1: Account Creation Schema
export const accountCreationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format (must include country code)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type AccountCreationFormData = z.infer<typeof accountCreationSchema>;

// Step 2: Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),
  middleName: z.string()
    .max(100, 'Middle name is too long')
    .optional(),
  dateOfBirth: z.date()
    .refine((date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18;
    }, 'You must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  state: z.string()
    .min(1, 'State is required'),
  lga: z.string()
    .min(1, 'LGA is required'),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// Step 3: NIN Verification Schema
export const ninVerificationSchema = z.object({
  nin: z.string()
    .length(11, 'NIN must be exactly 11 digits')
    .regex(/^\d{11}$/, 'NIN must contain only numbers'),
  consent: z.boolean()
    .refine((val) => val === true, {
      message: 'You must consent to NDPR terms to verify your NIN',
    }),
});

export type NINVerificationFormData = z.infer<typeof ninVerificationSchema>;

// Step 4: Professional Information Schema
export const professionalInfoSchema = z.object({
  barNumber: z.string()
    .min(1, 'Bar number is required'),
  yearOfCall: z.number()
    .int('Year must be a whole number')
    .min(1950, 'Year of call seems too old')
    .max(new Date().getFullYear(), 'Year of call cannot be in the future'),
  lawSchool: z.string()
    .min(1, 'Law school is required'),
  university: z.string()
    .min(1, 'University is required'),
  llbYear: z.number()
    .int('Year must be a whole number')
    .min(1950, 'Graduation year seems too old')
    .max(new Date().getFullYear(), 'Graduation year cannot be in the future'),
}).refine((data) => data.yearOfCall >= data.llbYear, {
  message: 'Year of call must be after or equal to LLB graduation year',
  path: ['yearOfCall'],
});

export type ProfessionalInfoFormData = z.infer<typeof professionalInfoSchema>;

// Step 5: Practice Information Schema
export const practiceInfoSchema = z.object({
  practiceType: z.enum(['solo', 'firm']),
  firmName: z.string().optional(),
  practiceAreas: z.array(z.string())
    .min(1, 'Select at least one practice area'),
  statesOfPractice: z.array(z.string())
    .min(1, 'Select at least one state of practice'),
  officeAddress: z.object({
    street: z.string()
      .min(1, 'Street address is required'),
    city: z.string()
      .min(1, 'City is required'),
    state: z.string()
      .min(1, 'State is required'),
    postalCode: z.string()
      .min(1, 'Postal code is required')
      .regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  }),
}).refine((data) => {
  if (data.practiceType === 'firm') {
    return data.firmName && data.firmName.length > 0;
  }
  return true;
}, {
  message: 'Firm name is required when practice type is Law Firm',
  path: ['firmName'],
});

export type PracticeInfoFormData = z.infer<typeof practiceInfoSchema>;

// Step 6: Document Upload Schema
export const documentUploadSchema = z.object({
  callToBarCertificate: z.instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'File size must be less than 2MB')
    .refine((file) => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    }, 'File must be PDF or image (JPEG, PNG, WebP)'),
  llbCertificate: z.instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'File size must be less than 2MB')
    .refine((file) => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    }, 'File must be PDF or image (JPEG, PNG, WebP)'),
  passportPhoto: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    }, 'File must be an image (JPEG, PNG, WebP)'),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
