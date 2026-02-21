import { type ApiResponse, httpClient } from './client';

// ============================================================================
// Type Definitions
// ============================================================================

export type RegistrationStatus = 
  | 'step1' 
  | 'step2' 
  | 'step3' 
  | 'step4' 
  | 'step5' 
  | 'step6' 
  | 'step7' 
  | 'submitted' 
  | 'approved' 
  | 'rejected';

// Step 1: Account Creation
export interface AccountCreationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface AccountCreationResponse {
  success: boolean;
  lawyer_id: string;
  token: string;
  registration_status: RegistrationStatus;
}

// Step 2: Personal Information
export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  state: string;
  lga: string;
}

export interface PersonalInfoResponse {
  success: boolean;
  registration_status: RegistrationStatus;
}

// Step 3: NIN Verification
export interface NINVerificationFormData {
  nin: string;
  consent: boolean;
}

export interface NINVerificationResult {
  firstName: string;
  middleName: string;
  lastName: string;
  image: string; // Base64 encoded image
  dateOfBirth: string;
  gender: string;
  mobile: string;
  address: {
    addressLine: string;
    town: string;
    lga: string;
    state: string;
  };
  idNumber: string;
}

export interface NINVerificationResponse {
  success: boolean;
  data: NINVerificationResult;
}

export interface NINConfirmationResponse {
  success: boolean;
  registration_status: RegistrationStatus;
}

// Step 4: Professional Information
export interface ProfessionalInfoFormData {
  barNumber: string;
  yearOfCall: number;
  lawSchool: string;
  university: string;
  llbYear: number;
}

export interface ProfessionalInfoResponse {
  success: boolean;
  registration_status: RegistrationStatus;
}

// Step 5: Practice Information
export interface PracticeInfoFormData {
  practiceType: 'solo' | 'firm';
  firmName?: string;
  practiceAreas: string[]; // Array of specialization UUIDs
  statesOfPractice: string[];
  officeAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface PracticeInfoResponse {
  success: boolean;
  registration_status: RegistrationStatus;
}

// Step 6: Document Upload
export interface UploadedDocument {
  id: string;
  type: 'call_to_bar' | 'llb_certificate' | 'passport_photo';
  url: string;
  publicId: string;
  originalName: string;
  preview?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  documents: UploadedDocument[];
  registration_status: RegistrationStatus;
}

// Step 7: Review & Submit
export interface RegistrationSummary {
  personal: PersonalInfoFormData;
  nin: {
    nin: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    mobile: string;
    addressLine: string;
    town: string;
    lga: string;
    state: string;
    imageUrl?: string;
    nameMatch: boolean;
    dobMatch: boolean;
    verifiedAt: string;
  };
  professional: ProfessionalInfoFormData;
  practice: {
    id: string;
    lawyerId: string;
    firmName?: string;
    statesOfPractice: string[];
    officeStreet: string;
    officeCity: string;
    officeState: string;
    officePostalCode: string;
    createdAt: string;
    updatedAt: string;
  };
  documents?: UploadedDocument[]; // Optional - document upload removed
}

export interface RegistrationSummaryResponse {
  success: boolean;
  data: RegistrationSummary;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  application_id: string;
}

// Status Check
export interface RegistrationStatusResponse {
  success: boolean;
  registration_status: RegistrationStatus;
}

// ============================================================================
// Registration API Service
// Note: Account creation (step 1) is now handled by /auth/register
// ============================================================================

export const registrationAPI = {
  /**
   * Note: Account creation is now at /auth/register
   * This method is deprecated and should not be used
   */
  createAccount: async (
    data: AccountCreationFormData
  ): Promise<AccountCreationResponse> => {
    throw new Error('Account creation is now handled by /auth/register. This method is deprecated.');
  },

  /**
   * Step 2: Get Personal Information
   * GET /api/register/step2
   * Requirements: 2.1
   */
  getPersonalInfo: async (): Promise<PersonalInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<PersonalInfoFormData | null>>(
      '/api/register/step2'
    );
    return response.data ?? null;
  },

  /**
   * Step 2: Save Personal Information
   * POST /api/register/step2
   * Requirements: 2.5
   */
  savePersonalInfo: async (
    data: PersonalInfoFormData
  ): Promise<PersonalInfoResponse> => {
    return httpClient.post<PersonalInfoResponse>(
      '/api/register/step2',
      data
    );
  },

  /**
   * Step 3: Verify NIN
   * POST /api/register/step3/verify-nin
   * Requirements: 3.2
   */
  verifyNIN: async (
    nin: string,
    consent: boolean
  ): Promise<NINVerificationResponse> => {
    return httpClient.post<NINVerificationResponse>(
      '/api/register/step3/verify-nin',
      { nin, consent }
    );
  },

  /**
   * Step 3: Confirm NIN
   * POST /api/register/step3/confirm
   * Requirements: 3.6
   */
  confirmNIN: async (confirmed: boolean): Promise<NINConfirmationResponse> => {
    return httpClient.post<NINConfirmationResponse>(
      '/api/register/step3/confirm',
      { confirmed }
    );
  },

  /**
   * Step 4: Get Professional Information
   * GET /api/register/step4
   * Requirements: 4.1
   */
  getProfessionalInfo: async (): Promise<ProfessionalInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<ProfessionalInfoFormData | null>>(
      '/api/register/step4'
    );
    return response.data ?? null;
  },

  /**
   * Step 4: Save Professional Information
   * POST /api/register/step4
   * Requirements: 4.5
   */
  saveProfessionalInfo: async (
    data: ProfessionalInfoFormData
  ): Promise<ProfessionalInfoResponse> => {
    return httpClient.post<ProfessionalInfoResponse>(
      '/api/register/step4',
      data
    );
  },

  /**
   * Step 5: Get Practice Information
   * GET /api/register/step5
   * Requirements: 5.1
   */
  getPracticeInfo: async (): Promise<PracticeInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<PracticeInfoFormData | null>>(
      '/api/register/step5'
    );
    return response.data ?? null;
  },

  /**
   * Step 5: Save Practice Information
   * POST /api/register/step5
   * Requirements: 5.7
   */
  savePracticeInfo: async (
    data: PracticeInfoFormData
  ): Promise<PracticeInfoResponse> => {
    // For solo practitioners, omit firmName if empty
    const payload = {
      ...data,
      ...(data.practiceType === 'solo' && { firmName: undefined }),
    };
    
    return httpClient.post<PracticeInfoResponse>(
      '/api/register/step5',
      payload
    );
  },

  /**
   * Step 6: Get Registration Summary (formerly step 7, document upload removed)
   * GET /api/register/summary
   * Requirements: 7.1
   */
  getRegistrationSummary: async (): Promise<RegistrationSummaryResponse> => {
    return httpClient.getAuth<RegistrationSummaryResponse>(
      '/api/register/summary'
    );
  },

  /**
   * Step 6: Submit Application (formerly step 7, document upload removed)
   * POST /api/register/submit
   * Requirements: 7.9
   */
  submitApplication: async (): Promise<SubmitApplicationResponse> => {
    return httpClient.post<SubmitApplicationResponse>(
      '/api/register/submit'
    );
  },

  /**
   * Get Registration Status
   * GET /api/register/status
   * Requirements: 9.1, 10.2
   */
  getRegistrationStatus: async (): Promise<RegistrationStatusResponse> => {
    return httpClient.getAuth<RegistrationStatusResponse>(
      '/api/register/status'
    );
  },
};
