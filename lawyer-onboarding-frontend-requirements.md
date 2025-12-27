# Lawyer Onboarding Flow - Frontend Requirements

## Overview
Enhance the existing 3-step lawyer registration system with better UX, step validation, progress tracking, and error handling.

## Complete API Specification

### Authentication
All endpoints require authentication via Better Auth. Include the session token in requests:
```
Authorization: Bearer <session_token>
```

### Base URL
```
https://your-backend-domain.com/api
```

### API Endpoints

#### 1. Get Onboarding Status
```http
GET /api/lawyers/onboarding/status
```

**Response:**
```typescript
{
  currentStep: "practice_info" | "documents" | "specializations" | "submitted";
  lawyer: Lawyer | null;
  documents: LawyerDocument[];
  specializations: Specialization[];
}
```

#### 2. Save Practice Information (Step 1)
```http
PATCH /api/lawyers/onboarding/practice-info
Content-Type: application/json
```

**Request Body:**
```typescript
{
  phoneNumber: string;        // Min 10 chars
  country: string;           // Required
  state: string;             // Required  
  yearsOfExperience: number; // Integer >= 0
  barLicenseNumber: string;  // Required
  barAssociation: string;    // Required
  licenseStatus: string;     // Required
}
```

**Response:**
```typescript
{
  success: true;
  message: "Practice information saved";
  data: Lawyer;
}
```

#### 3. Save Documents (Step 2)
```http
PATCH /api/lawyers/onboarding/documents
Content-Type: application/json
```

**Request Body:**
```typescript
{
  documents: Array<{
    type: "bar_license" | "certification";
    url: string;           // Full URL to uploaded file
    publicId: string;      // Cloud provider file ID
    originalName?: string; // Optional original filename
  }>;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Documents saved successfully";
}
```

#### 4. Complete Onboarding (Step 3)
```http
POST /api/lawyers/onboarding/complete
Content-Type: application/json
```

**Request Body:**
```typescript
{
  specializations: Array<{
    specializationId: string;    // UUID
    yearsOfExperience: number;   // Integer >= 0
  }>;
  experienceDescription?: string; // Optional, max 1000 chars
}
```

**Response:**
```typescript
{
  success: true;
  message: "Application submitted successfully. Expected approval in 2 days.";
  data: {
    lawyerId: string;
    specializationsSelected: number;
    status: "pending";
  };
}
```

#### 5. Get All Specializations
```http
GET /api/specializations
```

**Response:**
```typescript
{
  specializations: Specialization[];
}
```

#### 6. Get Specialization by ID
```http
GET /api/specializations/:id
```

**Response:**
```typescript
{
  specialization: Specialization;
}
```

## Data Models & TypeScript Types

### Core Types
```typescript
// Enums
type ApplicationStatus = "pending" | "approved" | "rejected";
type OnboardingStep = "practice_info" | "documents" | "specializations" | "submitted";
type DocumentType = "bar_license" | "certification";

// Main Data Models
interface Lawyer {
  id: string;
  userId: string;
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
  applicationStatus: ApplicationStatus;
  onboardingStep: OnboardingStep;
  reviewNotes?: string;
  experienceDescription?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface LawyerDocument {
  id: string;
  lawyerId: string;
  type: DocumentType;
  url: string;           // Full URL to access file
  publicId: string;      // Cloud provider file ID
  originalName?: string;
  createdAt: string;     // ISO date string
}

interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  onboarding_completed: boolean;
}
```

### Form Input Types
```typescript
interface PracticeInfoInput {
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
}

interface DocumentInput {
  type: "bar_license" | "certification";
  url: string;
  publicId: string;
  originalName?: string;
}

interface DocumentsInput {
  documents: DocumentInput[];
}

interface SpecializationInput {
  specializationId: string;
  yearsOfExperience: number;
}

interface CompleteOnboardingInput {
  specializations: SpecializationInput[];
  experienceDescription?: string;
}
```

## Error Handling

### Error Response Format
All API errors follow this format:
```typescript
{
  error: string;           // User-friendly error message
  code?: string;          // Error code for programmatic handling
  details?: string;       // Additional error details
}
```

### Common Error Codes
```typescript
// Service Errors
"LAWYER_NOT_FOUND"           // Lawyer profile not found
"INVALID_SPECIALIZATIONS"    // Invalid specialization IDs

// Validation Errors  
"VALIDATION_ERROR"           // Request body validation failed
"MISSING_REQUIRED_FIELD"     // Required field missing
"INVALID_FORMAT"             // Invalid data format

// Business Logic Errors
"ONBOARDING_ALREADY_COMPLETED" // User already completed onboarding
"STEP_NOT_ACCESSIBLE"          // Trying to access locked step
"INSUFFICIENT_DOCUMENTS"       // Missing required documents

// System Errors
"INTERNAL_SERVER_ERROR"      // Generic server error
"NETWORK_ERROR"              // Network connectivity issues
"UPLOAD_FAILED"              // File upload failed
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (onboarding completion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource not found)
- `409` - Conflict (onboarding already completed)
- `500` - Internal Server Error

## File Upload Requirements

### Document Upload Process
Since the backend expects document metadata (not files), you'll need to:

1. **Upload files to cloud storage first** (Cloudinary/AWS S3)
2. **Get the URL and publicId** from the upload response
3. **Send metadata to the backend** via the documents endpoint

### File Validation Rules
```typescript
interface FileValidationRules {
  allowedTypes: ["application/pdf", "image/jpeg", "image/png"];
  maxSize: 5 * 1024 * 1024; // 5MB
  required: {
    bar_license: true;     // At least 1 bar license required
    certification: false;  // Optional additional certifications
  };
}
```

### Upload Implementation Example
```typescript
// 1. Upload to cloud storage
const uploadResponse = await uploadToCloudinary(file);

// 2. Prepare metadata for backend
const documentMetadata = {
  type: "bar_license",
  url: uploadResponse.secure_url,
  publicId: uploadResponse.public_id,
  originalName: file.name
};

// 3. Send to backend
await fetch('/api/lawyers/onboarding/documents', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ documents: [documentMetadata] })
});
```

## Key Frontend Requirements
### 1. Step Validation & Navigation
- **Prevent step skipping** - Users can only access unlocked steps
- **Auto-redirect** - Send users to their current valid step on login
- **Progress persistence** - Maintain progress across browser sessions

### 2. Progress Tracking
- **Visual progress bar** showing completed/current/remaining steps
- **Step descriptions** with requirements for each upcoming step
- **Time estimates** based on current progress
- **Progress summary** when users return to registration

### 3. Enhanced Error Handling
- **Field-level validation** with specific error messages next to fields
- **User-friendly server errors** with suggested actions
- **Network error handling** with offline form editing capability
- **Upload error recovery** without losing other form data

### 4. Document Upload Enhancement
- **Pre-upload validation** (file type, size, format)
- **Progress indicators** during upload with cancellation option
- **Document previews/thumbnails** after successful upload
- **Individual document replacement** without affecting others
- **Drag-and-drop support** with multiple file selection

### 5. Specialization Selection
- **Search and filtering** for practice areas
- **Descriptions and requirements** for each specialization
- **Selection limits** (minimum 1, maximum 5)
- **Years of experience input** for each selected area
- **Selection summary** before final submission

### 6. Draft Management
- **Auto-save drafts** every 30 seconds during form editing
- **Resume from drafts** when users return to incomplete steps
- **Draft indicators** showing unsaved changes
- **Clear drafts** after successful step completion

### 7. Application Status
- **Confirmation page** with reference number after completion
- **Status display** on user dashboard after submission
- **Email notifications** for status changes (handled by backend)
- **Resubmission flow** for rejected applications

## Technical Implementation Notes

### State Management
- Track current step, completed steps, and draft data
- Persist state in localStorage for offline capability
- Sync with backend on reconnection

### Form Validation
- Client-side validation for immediate feedback
- Server-side validation as source of truth
- Progressive enhancement for better UX

### File Handling
- Use FormData for multipart uploads
- Implement upload progress tracking
- Handle upload cancellation gracefully
- Generate client-side previews when possible

### Error Recovery
- Retry mechanisms for failed requests
- Offline mode with queued operations
- Graceful degradation during server issues

### Responsive Design
- Mobile-friendly file upload interface
- Touch-friendly progress indicators
- Responsive form layouts for all screen sizes

## User Flow Summary

1. **Login/Resume** → Auto-redirect to current step with progress display
2. **Step 1: Practice Info** → Form with validation, auto-save, progress tracking
3. **Step 2: Documents** → Enhanced upload with previews and progress
4. **Step 3: Specializations** → Search, select, experience input, summary
5. **Completion** → Confirmation page with reference number and next steps
6. **Post-Submission** → Status tracking and communication handling

## Backend Integration
The backend APIs are already implemented and documented. The frontend needs to:
- Call `/api/lawyers/onboarding/status` on app load to determine current step
- Use existing PATCH/POST endpoints for each step
- Handle the response formats and error codes as documented
- Implement proper authentication headers for all requests

## Priority Order
1. Step validation and navigation (core functionality)
2. Progress tracking and visual feedback
3. Enhanced error handling and validation
4. Document upload improvements
5. Draft management and auto-save
6. Specialization selection enhancements
7. Application status and communication features

## Environment Variables & Configuration

### Required Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com

# File Upload (if using Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Authentication (Better Auth)
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-backend-domain.com/api/auth
```

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://getalawyer-frontend.up.railway.app`
- `https://getalawyer-frontend.vercel.app`

Make sure your frontend domain is added to the backend's CORS configuration.

## Mock Data for Development

### Sample Specializations
```typescript
const mockSpecializations: Specialization[] = [
  {
    id: "1",
    name: "Corporate Law",
    description: "Business formation, contracts, mergers and acquisitions",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2", 
    name: "Family Law",
    description: "Divorce, custody, adoption, domestic relations",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Criminal Defense",
    description: "Criminal charges, DUI, white collar crime defense",
    createdAt: "2024-01-01T00:00:00Z", 
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Personal Injury",
    description: "Auto accidents, medical malpractice, slip and fall",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Real Estate Law",
    description: "Property transactions, landlord-tenant, zoning",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];
```

### Sample API Responses
```typescript
// GET /api/lawyers/onboarding/status (new user)
{
  currentStep: "practice_info",
  lawyer: null,
  documents: [],
  specializations: []
}

// GET /api/lawyers/onboarding/status (in progress)
{
  currentStep: "documents",
  lawyer: {
    id: "lawyer-123",
    userId: "user-456", 
    phoneNumber: "+1234567890",
    country: "United States",
    state: "California",
    yearsOfExperience: 5,
    barLicenseNumber: "CA123456",
    barAssociation: "State Bar of California",
    licenseStatus: "Active",
    applicationStatus: "pending",
    onboardingStep: "documents",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  documents: [],
  specializations: []
}
```

## Testing Considerations

### Unit Testing
- Form validation logic
- Step navigation rules
- Error message display
- File upload validation
- Draft save/restore functionality

### Integration Testing  
- API endpoint calls
- Authentication flow
- File upload process
- Error handling scenarios
- Cross-browser compatibility

### E2E Testing
- Complete onboarding flow
- Resume functionality
- Error recovery
- Mobile responsiveness

## Additional Resources Needed

### Design Assets
- Progress indicator designs
- Error state illustrations
- Success confirmation graphics
- Loading states and animations

### Content & Copy
- Step descriptions and help text
- Error messages and guidance
- Success messages and next steps
- Email templates (if handling client-side)

### Third-Party Services
- File upload service (Cloudinary/AWS S3) credentials
- Analytics tracking (if required)
- Error monitoring service (Sentry, etc.)

This document provides everything your frontend team needs to implement the lawyer onboarding flow independently, including complete API specifications, data models, error handling, and implementation guidance.