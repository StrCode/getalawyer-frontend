# Design Document: Simplified Lawyer Onboarding

## Overview

This design describes a streamlined two-step lawyer onboarding system that collects basic information and verifies credentials through NIN API integration. The system replaces the existing multi-step onboarding with a focused flow that defers profile building to the post-onboarding dashboard.

**Key Design Principles:**
- Simplicity: Only two steps (Basic Info → Credentials)
- Security: NIN verification via external API, Bar Number collected for manual admin verification
- User Experience: Clear progress indication, inline validation, responsive design
- Data Integrity: Form validation before submission, proper error handling

## Architecture

### High-Level Flow

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Step 1:        │
│  Basic Info     │──────┐
│  - Name         │      │
│  - Email        │      │
│  - Phone        │      │
│  - Location     │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│  Step 2:        │      │
│  Credentials    │      │
│  - Bar Number   │      │
│  - NIN + API    │      │
│  - Photo Upload │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│  Submit for     │      │
│  Admin Review   │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│  Pending        │◄─────┘
│  Approval Page  │   (Can return
└─────────────────┘    to edit)
```

### Technology Stack

- **Frontend Framework**: React with TanStack Router
- **State Management**: Zustand (existing enhanced-onboarding-store)
- **Form Handling**: React controlled components with inline validation
- **API Client**: TanStack Query for data fetching and mutations
- **File Upload**: Multipart form data to backend, then Cloudinary
- **UI Components**: Existing component library (shadcn/ui)

## Components and Interfaces

### 1. Basic Information Form Component

**Location**: `src/routes/onboarding/lawyer/basics.tsx` (existing, needs minor updates)

**Purpose**: Collects lawyer's basic information

**Interface**:
```typescript
interface BasicInfoFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
}
```

**Key Features**:
- Pre-populated email from session
- Country/state dropdown with dynamic state loading
- Phone number with international format support
- Real-time validation
- Progress indicator (Step 1 of 2)

**Validation Rules**:
- firstName: Required, min 2 characters
- lastName: Required, min 2 characters
- email: Required, valid email format
- phoneNumber: Required, valid phone format
- country: Required selection
- state: Required if country has states

### 2. Credentials Form Component

**Location**: `src/routes/onboarding/lawyer/credentials.tsx` (new)

**Purpose**: Collects and verifies lawyer credentials

**Interface**:
```typescript
interface CredentialsFormData {
  barNumber: string;
  nin: string;
  ninVerified: boolean;
  ninVerificationData?: {
    fullName: string;
    dateOfBirth: string;
    // Other NIN API response fields
  };
  photograph?: File;
  photographUrl?: string;
}
```

**Key Features**:
- Bar Number input with format validation
- NIN input with "Verify" button
- NIN verification status display
- Photo upload with preview
- Progress indicator (Step 2 of 2)

**Validation Rules**:
- barNumber: Required, format validation (pattern TBD based on Nigerian Bar format)
- nin: Required, 11-digit format
- ninVerified: Must be true before submission
- photograph: Required, max 5MB, JPEG/PNG/WebP only

### 3. NIN Verification Service

**Location**: `src/services/nin-verification.ts` (new)

**Purpose**: Handles NIN verification API calls

**Interface**:
```typescript
interface NINVerificationRequest {
  nin: string;
}

interface NINVerificationResponse {
  success: boolean;
  data?: {
    nin: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    // Additional fields from NIN API
  };
  error?: string;
}

async function verifyNIN(nin: string): Promise<NINVerificationResponse>
```

**Implementation Notes**:
- Calls backend endpoint `/api/lawyers/verify-nin` (to be created)
- Backend proxies request to external NIN verification API
- Implements retry logic with exponential backoff
- Handles rate limiting and API errors gracefully

### 4. Photo Upload Component

**Location**: `src/components/onboarding/photo-uploader.tsx` (new)

**Purpose**: Handles photograph upload with preview

**Interface**:
```typescript
interface PhotoUploaderProps {
  onUpload: (file: File) => void;
  onRemove: () => void;
  currentPhoto?: string;
  error?: string;
  isUploading?: boolean;
}
```

**Key Features**:
- Drag-and-drop support
- Click to browse
- Image preview
- File size and type validation
- Upload progress indicator
- Remove/replace functionality

### 5. Progress Tracker Component

**Location**: `src/components/onboarding/progress-tracker.tsx` (existing, reuse)

**Purpose**: Shows onboarding progress

**Updates Needed**:
- Change from 4 steps to 2 steps
- Update step labels: "Basic Info" → "Credentials"

### 6. Onboarding Store

**Location**: `src/stores/enhanced-onboarding-store.ts` (existing, update)

**Purpose**: Manages onboarding state

**Interface Updates**:
```typescript
interface OnboardingState {
  currentStep: 'basic_info' | 'credentials' | 'pending_approval';
  completedSteps: Set<'basic_info' | 'credentials'>;
  
  // Basic Info
  basicInfo: BasicInfoFormData;
  
  // Credentials
  credentials: CredentialsFormData;
  
  // Actions
  updateBasicInfo: (data: Partial<BasicInfoFormData>) => void;
  updateCredentials: (data: Partial<CredentialsFormData>) => void;
  markStepCompleted: (step: string) => void;
  setCurrentStep: (step: string) => void;
  reset: () => void;
}
```

## Data Models

### Lawyer Profile (Backend)

```typescript
interface LawyerProfile {
  id: string;
  userId: string;
  
  // Basic Info
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
  
  // Credentials
  barNumber: string;
  nin: string;
  ninVerified: boolean;
  ninVerificationData?: object;
  photographUrl?: string;
  photographPublicId?: string;
  
  // Status
  onboardingStatus: 'incomplete' | 'pending' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### NIN Verification Record (Backend)

```typescript
interface NINVerification {
  id: string;
  lawyerId: string;
  nin: string;
  verifiedAt: Date;
  verificationData: object; // Full API response
  apiProvider: string; // e.g., "NIMC"
  status: 'verified' | 'failed';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Basic Info Validation

*For any* basic information form submission, all required fields (firstName, lastName, email, phoneNumber, country) must be non-empty and valid before allowing progression to credentials step.

**Validates: Requirements 1.3, 1.4**

### Property 2: Email Format Validation

*For any* email input, the system must accept only strings matching the email regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

**Validates: Requirements 1.3**

### Property 3: State Requirement Conditional

*For any* country selection, if the country has available states (statesByCountry[country].length > 1), then state selection must be required; otherwise state selection should be optional.

**Validates: Requirements 1.4**

### Property 4: Bar Number Format Validation

*For any* Bar Number input, the system must validate the format matches the expected pattern before allowing submission.

**Validates: Requirements 2.2, 2.4**

### Property 5: NIN Format Validation

*For any* NIN input, the system must validate it is exactly 11 digits before allowing API verification.

**Validates: Requirements 3.1**

### Property 6: NIN Verification Requirement

*For any* credentials form submission, the NIN must have been successfully verified (ninVerified === true) before allowing final submission.

**Validates: Requirements 3.2, 3.3**

### Property 7: Photo File Type Validation

*For any* photograph upload, the system must accept only files with MIME types matching JPEG, PNG, or WebP formats.

**Validates: Requirements 4.1**

### Property 8: Photo File Size Validation

*For any* photograph upload, the system must reject files larger than 5MB.

**Validates: Requirements 4.2**

### Property 9: Complete Submission Requirements

*For any* final onboarding submission, all of the following must be true: basic info is complete, Bar Number is provided, NIN is verified, and photograph is uploaded.

**Validates: Requirements 5.1, 5.2**

### Property 10: Progress Tracking Accuracy

*For any* step completion, the progress tracker must accurately reflect which steps are completed and which step is current.

**Validates: Requirements 6.1, 6.2**

### Property 11: Step Navigation Prevention

*For any* attempt to navigate to credentials step, if basic info step is not completed, navigation must be prevented.

**Validates: Requirements 6.4**

### Property 12: Error Message Specificity

*For any* validation failure, the system must display a specific error message identifying which field failed and why.

**Validates: Requirements 7.1**

### Property 13: API Retry Logic

*For any* failed API call (NIN verification, photo upload, submission), the system must implement retry logic with exponential backoff up to 3 attempts.

**Validates: Requirements 8.5**

### Property 14: Form Data Preservation on Error

*For any* API error or network failure, all user-entered form data must be preserved and remain editable.

**Validates: Requirements 7.3**

## Error Handling

### Client-Side Validation Errors

**Trigger**: User attempts to submit form with invalid data

**Handling**:
1. Prevent form submission
2. Display inline error messages next to affected fields
3. Show summary alert at top of form listing all errors
4. Focus first invalid field
5. Keep all entered data intact

**Example**:
```typescript
const errors: Record<string, string> = {};
if (!formData.firstName.trim()) {
  errors.firstName = "First name is required";
}
// Display errors inline and in summary
```

### NIN Verification Failures

**Trigger**: NIN API returns error or invalid NIN

**Handling**:
1. Display user-friendly error message
2. Provide "Retry" button
3. Log error details for debugging
4. Allow user to correct NIN and retry
5. After 3 failed attempts, suggest contacting support

**Error Types**:
- Invalid NIN format: "Please enter a valid 11-digit NIN"
- NIN not found: "NIN not found in database. Please verify your NIN is correct"
- API timeout: "Verification service is temporarily unavailable. Please try again"
- Rate limit: "Too many verification attempts. Please wait 5 minutes"

### Photo Upload Failures

**Trigger**: File upload fails or file is invalid

**Handling**:
1. Display specific error message
2. Keep form data intact
3. Allow user to select different file
4. Provide retry option for network failures

**Error Types**:
- File too large: "Photo must be under 5MB. Please compress or choose a different photo"
- Invalid format: "Please upload a JPEG, PNG, or WebP image"
- Upload failed: "Upload failed. Please check your connection and try again"

### Network Errors

**Trigger**: API calls fail due to network issues

**Handling**:
1. Detect network failure
2. Display offline indicator
3. Queue failed requests for retry
4. Implement exponential backoff (1s, 2s, 4s)
5. Show retry button after max attempts

### Backend Errors

**Trigger**: Backend returns 500 or unexpected error

**Handling**:
1. Log full error details
2. Display generic user-friendly message
3. Provide support contact information
4. Allow user to retry or save progress

## Testing Strategy

### Unit Tests

**Framework**: Vitest with React Testing Library

**Coverage Areas**:
1. **Form Validation**:
   - Test each validation rule independently
   - Test edge cases (empty strings, whitespace, special characters)
   - Test email format validation
   - Test phone number format validation
   - Test conditional state requirement

2. **Component Rendering**:
   - Test basic info form renders all fields
   - Test credentials form renders all fields
   - Test progress tracker shows correct step
   - Test error messages display correctly

3. **User Interactions**:
   - Test form field changes update state
   - Test country selection updates available states
   - Test photo upload triggers file selection
   - Test NIN verify button triggers API call

4. **Error Handling**:
   - Test validation errors prevent submission
   - Test API errors display user-friendly messages
   - Test network errors show retry option

### Property-Based Tests

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Cases**:

1. **Property 1: Basic Info Validation**
   - Generate random form data with some fields empty
   - Verify submission is blocked when required fields are missing
   - **Feature: simplified-lawyer-onboarding, Property 1: Basic Info Validation**

2. **Property 2: Email Format Validation**
   - Generate random strings (valid and invalid emails)
   - Verify only valid email formats are accepted
   - **Feature: simplified-lawyer-onboarding, Property 2: Email Format Validation**

3. **Property 5: NIN Format Validation**
   - Generate random strings of various lengths and characters
   - Verify only 11-digit strings are accepted for verification
   - **Feature: simplified-lawyer-onboarding, Property 5: NIN Format Validation**

4. **Property 7: Photo File Type Validation**
   - Generate mock files with various MIME types
   - Verify only JPEG, PNG, WebP are accepted
   - **Feature: simplified-lawyer-onboarding, Property 7: Photo File Type Validation**

5. **Property 8: Photo File Size Validation**
   - Generate mock files with various sizes
   - Verify files over 5MB are rejected
   - **Feature: simplified-lawyer-onboarding, Property 8: Photo File Size Validation**

6. **Property 11: Step Navigation Prevention**
   - Generate random completion states
   - Verify navigation to credentials is blocked when basic info incomplete
   - **Feature: simplified-lawyer-onboarding, Property 11: Step Navigation Prevention**

### Integration Tests

**Framework**: Playwright or Cypress

**Test Scenarios**:
1. Complete happy path: Fill basic info → Fill credentials → Verify NIN → Upload photo → Submit
2. Error recovery: Start form → Encounter error → Fix error → Continue
3. Navigation: Complete step 1 → Navigate to step 2 → Go back → Data persists
4. NIN verification: Enter NIN → Click verify → See verification result
5. Photo upload: Select photo → See preview → Remove → Select different photo

### API Integration Tests

**Framework**: MSW (Mock Service Worker) for mocking APIs

**Test Scenarios**:
1. Mock successful NIN verification response
2. Mock failed NIN verification response
3. Mock network timeout
4. Mock rate limiting response
5. Mock successful photo upload
6. Mock failed photo upload

## API Endpoints

### New Endpoints Required

#### 1. Verify NIN

**Endpoint**: `POST /api/lawyers/verify-nin`

**Purpose**: Verifies NIN via external API

**Request**:
```json
{
  "nin": "12345678901"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "nin": "12345678901",
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "M"
  }
}
```

**Response** (Failure):
```json
{
  "success": false,
  "error": "NIN not found"
}
```

#### 2. Submit Onboarding

**Endpoint**: `POST /api/lawyers/onboarding/submit`

**Purpose**: Submits complete onboarding for admin review

**Request**:
```json
{
  "basicInfo": {
    "firstName": "John",
    "middleName": "A",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+2341234567890",
    "country": "NG",
    "state": "Lagos"
  },
  "credentials": {
    "barNumber": "SCN/12345/2020",
    "nin": "12345678901",
    "ninVerificationData": { /* NIN API response */ },
    "photographUrl": "https://cloudinary.com/...",
    "photographPublicId": "lawyer_photos/..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "lawyerId": "lawyer_123",
    "status": "pending"
  }
}
```

### Existing Endpoints to Use

- `POST /api/lawyers/upload-document` - For photograph upload
- `GET /api/country/` - For country list
- `GET /api/country/:code/states` - For state list

## Implementation Notes

### Form State Management

Use controlled components with local state for form fields, synced to Zustand store on change:

```typescript
const [formData, setFormData] = useState<BasicInfoFormData>({...});

const handleFieldChange = (field: keyof BasicInfoFormData, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  updateBasicInfo({ [field]: value });
};
```

### NIN Verification Flow

1. User enters 11-digit NIN
2. Client validates format
3. User clicks "Verify NIN" button
4. Show loading state
5. Call `/api/lawyers/verify-nin`
6. On success: Display verified name, enable submission
7. On failure: Show error, allow retry

### Photo Upload Flow

1. User selects file via drag-drop or browse
2. Client validates file type and size
3. Show preview immediately
4. On form submission, upload to `/api/lawyers/upload-document`
5. Backend uploads to Cloudinary
6. Store URL and publicId in form state
7. Include in final submission

### Progress Persistence

Since auto-save is removed, progress is only saved when:
1. User completes Step 1 (basic info) and clicks "Continue"
2. User completes Step 2 (credentials) and clicks "Submit"

If user closes browser mid-step, they start that step over.

### Responsive Design

- Mobile: Single column layout, larger touch targets
- Tablet: Single column with wider form
- Desktop: Two-column layout with progress sidebar

### Accessibility

- All form fields have proper labels
- Error messages associated with fields via aria-describedby
- Focus management on validation errors
- Keyboard navigation support
- Screen reader announcements for status changes

## Security Considerations

1. **NIN Data Protection**: NIN verification data stored encrypted at rest
2. **Photo Storage**: Photos stored in secure Cloudinary folder with access controls
3. **API Authentication**: All endpoints require valid session token
4. **Rate Limiting**: NIN verification limited to 5 attempts per hour per user
5. **Input Sanitization**: All user inputs sanitized before storage
6. **HTTPS Only**: All API calls over HTTPS
7. **CORS**: Proper CORS configuration for API endpoints

## Performance Considerations

1. **Lazy Loading**: Load credentials step components only when needed
2. **Image Optimization**: Compress photos before upload (client-side)
3. **API Caching**: Cache country/state data in localStorage
4. **Debouncing**: Debounce validation checks on text inputs
5. **Progress Indicators**: Show loading states for all async operations
6. **Bundle Size**: Code-split onboarding routes

## Migration from Existing System

### Changes Required

1. **Remove Steps**: Delete specializations and documents steps
2. **Update Store**: Simplify onboarding store to 2 steps
3. **Update Routes**: Remove `/onboarding/lawyer/specializations` and `/onboarding/lawyer/documents`
4. **Update Progress Tracker**: Change from 4 steps to 2 steps
5. **Backend**: Add NIN verification endpoint, update submission endpoint

### Data Migration

Existing incomplete onboarding records:
- Mark as "legacy_incomplete"
- Notify users to restart onboarding
- Clean up after 30 days

### Rollout Plan

1. **Phase 1**: Deploy new backend endpoints
2. **Phase 2**: Deploy new frontend (feature flag)
3. **Phase 3**: Enable for new users only
4. **Phase 4**: Migrate existing incomplete onboardings
5. **Phase 5**: Full rollout, remove old code

## Future Enhancements

1. **Biometric Verification**: Add facial recognition to match photo with NIN
2. **Bar Number API**: Integrate with Nigerian Bar Association API for automatic verification
3. **Document OCR**: Extract Bar Number from uploaded license photo
4. **Progress Save**: Add optional progress save with user consent
5. **Multi-language**: Support multiple languages for international lawyers
