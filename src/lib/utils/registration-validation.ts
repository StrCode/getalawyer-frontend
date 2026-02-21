// Registration Validation Utilities

import { FILE_UPLOAD_CONSTRAINTS, VALIDATION_CONSTANTS } from '@/constants/registration';

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Must contain at least 8 characters, one number, and one special character
 */
export function validatePassword(password: string): boolean {
  if (password.length < VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH) {
    return false;
  }
  
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  
  return hasNumber && hasSpecialChar;
}

/**
 * Validates password confirmation matches password
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validates phone number format with country code
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Validates age from date of birth
 * Returns true if age is at least 18 years
 */
export function validateAge(dateOfBirth: Date): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= VALIDATION_CONSTANTS.MIN_AGE;
}

/**
 * Validates NIN format
 * Must be exactly 11 numeric digits
 */
export function validateNIN(nin: string): boolean {
  const ninRegex = /^\d{11}$/;
  return nin.length === VALIDATION_CONSTANTS.NIN_LENGTH && ninRegex.test(nin);
}

/**
 * Validates NIN consent checkbox
 */
export function validateNINConsent(consent: boolean): boolean {
  return consent === true;
}

/**
 * Validates year ordering (year of call >= LLB year)
 */
export function validateYearOrdering(yearOfCall: number, llbYear: number): boolean {
  return yearOfCall >= llbYear;
}

/**
 * Validates that a year is not in the future
 */
export function validateNotFutureYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year <= currentYear;
}

/**
 * Validates conditional firm name requirement
 * Firm name is required when practice type is 'firm'
 */
export function validateConditionalFirmName(practiceType: string, firmName?: string): boolean {
  if (practiceType === 'firm') {
    return !!firmName && firmName.length > 0;
  }
  return true;
}

/**
 * Validates array has minimum length
 */
export function validateArrayMinLength(array: unknown[], minLength: number = 1): boolean {
  return Array.isArray(array) && array.length >= minLength;
}

/**
 * Validates file type for certificates
 */
export function validateCertificateFileType(file: File): boolean {
  return FILE_UPLOAD_CONSTRAINTS.CERTIFICATE_TYPES.includes(file.type);
}

/**
 * Validates file type for passport photo
 */
export function validatePhotoFileType(file: File): boolean {
  return FILE_UPLOAD_CONSTRAINTS.PHOTO_TYPES.includes(file.type);
}

/**
 * Validates file size for certificates
 */
export function validateCertificateFileSize(file: File): boolean {
  return file.size <= FILE_UPLOAD_CONSTRAINTS.CERTIFICATE_MAX_SIZE;
}

/**
 * Validates file size for passport photo
 */
export function validatePhotoFileSize(file: File): boolean {
  return file.size <= FILE_UPLOAD_CONSTRAINTS.PHOTO_MAX_SIZE;
}

/**
 * Validates document completeness
 * All three required documents must be present
 */
export function validateDocumentCompleteness(
  callToBar: File | null,
  llbCertificate: File | null,
  passportPhoto: File | null
): boolean {
  return callToBar !== null && llbCertificate !== null && passportPhoto !== null;
}

/**
 * Gets the next registration step based on current status
 */
export function getNextStep(currentStep: string): string {
  const stepMap: Record<string, string> = {
    'step1': 'step2',
    'step2': 'step3',
    'step3': 'step4',
    'step4': 'step5',
    'step5': 'step6',
    'step6': 'step7',
    'step7': 'submitted',
  };
  
  return stepMap[currentStep] || currentStep;
}

/**
 * Gets the step number from registration status
 */
export function getStepNumber(status: string): number {
  const stepNumbers: Record<string, number> = {
    'step1': 1,
    'step2': 2,
    'step3': 3,
    'step4': 4,
    'step5': 5,
    'step6': 6,
    'step7': 7,
  };
  
  return stepNumbers[status] || 0;
}

/**
 * Checks if a step is completed based on current status
 */
export function isStepCompleted(stepNumber: number, currentStatus: string): boolean {
  const currentStepNumber = getStepNumber(currentStatus);
  return stepNumber < currentStepNumber || ['submitted', 'approved'].includes(currentStatus);
}

/**
 * Checks if a step is accessible based on current status
 */
export function isStepAccessible(stepNumber: number, currentStatus: string): boolean {
  const currentStepNumber = getStepNumber(currentStatus);
  return stepNumber <= currentStepNumber;
}
