// Registration Constants

import type { RegistrationStatus } from '@/types/registration';

// Registration Status Enum
export const REGISTRATION_STATUS: Record<string, RegistrationStatus> = {
  STEP1: 'step1',
  STEP2: 'step2',
  STEP3: 'step3',
  STEP4: 'step4',
  STEP5: 'step5',
  STEP6: 'step6',
  STEP7: 'step7',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Step Configuration
// Note: Account creation (step 1) is now at /auth/register
export const REGISTRATION_STEPS = [
  { number: 1, label: 'Personal Information', path: '/register/step2', status: 'step2' },
  { number: 2, label: 'NIN Verification', path: '/register/step3', status: 'step3' },
  { number: 3, label: 'Professional Information', path: '/register/step4', status: 'step4' },
  { number: 4, label: 'Practice Information', path: '/register/step5', status: 'step5' },
  { number: 5, label: 'Review & Submit', path: '/register/step7', status: 'step7' },
] as const;

export const TOTAL_STEPS = 5; // Account creation is now at /auth/register, document upload removed, so 5 steps remain

// API Endpoints
export const REGISTRATION_API_ENDPOINTS = {
  // Note: Account creation is now at /auth/register, not /api/register/step1
  
  // Step 2: Personal Information
  GET_PERSONAL_INFO: '/api/register/step2',
  SAVE_PERSONAL_INFO: '/api/register/step2',
  
  // Step 3: NIN Verification
  VERIFY_NIN: '/api/register/step3/verify-nin',
  CONFIRM_NIN: '/api/register/step3/confirm',
  
  // Step 4: Professional Information
  GET_PROFESSIONAL_INFO: '/api/register/step4',
  SAVE_PROFESSIONAL_INFO: '/api/register/step4',
  
  // Step 5: Practice Information
  GET_PRACTICE_INFO: '/api/register/step5',
  SAVE_PRACTICE_INFO: '/api/register/step5',
  
  // Step 6: Review & Submit (formerly step 7, document upload removed)
  GET_SUMMARY: '/api/register/summary',
  SUBMIT_APPLICATION: '/api/register/submit',
  
  // Status Check
  GET_STATUS: '/api/register/status',
} as const;

// Error Messages
export const REGISTRATION_ERROR_MESSAGES = {
  // General Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  SESSION_TIMEOUT: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to access this page.',
  
  // Validation Errors
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with a number and special character.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_PHONE: 'Please enter a valid phone number with country code.',
  INVALID_NIN: 'NIN must be exactly 11 digits.',
  UNDERAGE: 'You must be at least 18 years old to register.',
  INVALID_YEAR: 'Please enter a valid year.',
  YEAR_ORDER_ERROR: 'Year of call must be after or equal to LLB graduation year.',
  FUTURE_DATE_ERROR: 'Date cannot be in the future.',
  FIRM_NAME_REQUIRED: 'Firm name is required for law firm practice type.',
  MIN_SELECTION_ERROR: 'Please select at least one option.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload the correct format.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  MISSING_DOCUMENTS: 'Please upload all required documents.',
  
  // NIN Verification Errors
  NIN_VERIFICATION_FAILED: 'NIN verification failed. Please check your NIN and try again.',
  NIN_CONSENT_REQUIRED: 'You must consent to NDPR terms to verify your NIN.',
  NIN_MISMATCH: 'The NIN information does not match your personal information.',
  NIN_REJECTED: 'NIN verification rejected. Please re-enter your NIN or contact support.',
  
  // Submission Errors
  SUBMISSION_FAILED: 'Application submission failed. Please try again.',
  INCOMPLETE_REGISTRATION: 'Please complete all steps before submitting.',
} as const;

// Success Messages
export const REGISTRATION_SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully!',
  PERSONAL_INFO_SAVED: 'Personal information saved successfully!',
  NIN_VERIFIED: 'NIN verified successfully!',
  PROFESSIONAL_INFO_SAVED: 'Professional information saved successfully!',
  PRACTICE_INFO_SAVED: 'Practice information saved successfully!',
  DOCUMENTS_UPLOADED: 'Documents uploaded successfully!',
  APPLICATION_SUBMITTED: 'Application submitted successfully! Your application is now under review.',
  PROGRESS_SAVED: 'Progress saved successfully!',
} as const;

// File Upload Constraints
export const FILE_UPLOAD_CONSTRAINTS = {
  CERTIFICATE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  CERTIFICATE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Local Storage Keys
export const REGISTRATION_STORAGE_KEYS = {
  LAWYER_TOKEN: 'lawyer_token',
  LAWYER_ID: 'lawyer_id',
  REGISTRATION_DRAFT: 'registration_draft',
  REGISTRATION_STATUS: 'registration_status',
} as const;

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Practice Type Options
export const PRACTICE_TYPE_OPTIONS = [
  { value: 'solo', label: 'Solo Practitioner' },
  { value: 'firm', label: 'Law Firm' },
] as const;

// Document Type Labels
export const DOCUMENT_TYPE_LABELS = {
  call_to_bar: 'Call to Bar Certificate',
  llb_certificate: 'LLB Certificate',
  passport_photo: 'Passport Photo',
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  MIN_AGE: 18,
  MIN_YEAR: 1950,
  NIN_LENGTH: 11,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;
