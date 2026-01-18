# Implementation Plan: Simplified Lawyer Onboarding

## Overview

This implementation plan breaks down the simplified lawyer onboarding system into discrete, manageable tasks. The system consists of two main steps: Basic Information collection and Credentials verification (Bar Number, NIN, and photograph).

## Tasks

- [x] 1. Update onboarding store for simplified flow
  - Modify `src/stores/enhanced-onboarding-store.ts` to support 2-step flow
  - Update step types: `'basic_info' | 'credentials' | 'pending_approval'`
  - Add credentials state management (barNumber, nin, ninVerified, photograph)
  - Remove specializations and documents state
  - _Requirements: 6.1, 6.2_

- [ ]* 1.1 Write property test for store state transitions
  - **Property 10: Progress Tracking Accuracy**
  - **Validates: Requirements 6.1, 6.2**

- [x] 2. Update progress tracker component
  - Modify `src/components/onboarding/progress-tracker.tsx` for 2 steps
  - Update step labels: "Basic Info" → "Credentials"
  - Update progress calculation (50% per step)
  - _Requirements: 6.1, 6.3_

- [x] 3. Update basic information form
  - Modify `src/routes/onboarding/lawyer/basics.tsx`
  - Remove draft management and auto-save functionality
  - Update navigation to point to credentials step
  - Simplify validation to only required fields
  - Update progress indicator to show "Step 1 of 2"
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 3.1 Write property test for basic info validation
  - **Property 1: Basic Info Validation**
  - **Validates: Requirements 1.3, 1.4**

- [ ]* 3.2 Write property test for email format validation
  - **Property 2: Email Format Validation**
  - **Validates: Requirements 1.3**

- [ ]* 3.3 Write property test for conditional state requirement
  - **Property 3: State Requirement Conditional**
  - **Validates: Requirements 1.4**

- [x] 4. Create NIN verification service
  - Create `src/services/nin-verification.ts`
  - Implement `verifyNIN(nin: string)` function
  - Add retry logic with exponential backoff (3 attempts)
  - Handle API errors and timeouts gracefully
  - _Requirements: 3.2, 3.3, 3.4, 8.2, 8.5_

- [ ]* 4.1 Write unit tests for NIN verification service
  - Test successful verification
  - Test failed verification
  - Test network errors
  - Test retry logic
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 5. Create photo uploader component
  - Create `src/components/onboarding/photo-uploader.tsx`
  - Implement drag-and-drop file selection
  - Add file type validation (JPEG, PNG, WebP)
  - Add file size validation (max 5MB)
  - Show image preview after selection
  - Add remove/replace functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ]* 5.1 Write property test for photo file type validation
  - **Property 7: Photo File Type Validation**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for photo file size validation
  - **Property 8: Photo File Size Validation**
  - **Validates: Requirements 4.2**

- [x] 6. Create credentials form component
  - Create `src/routes/onboarding/lawyer/credentials.tsx`
  - Add Bar Number input field with format validation
  - Add NIN input field with format validation (11 digits)
  - Integrate NIN verification service with "Verify" button
  - Display NIN verification status and verified data
  - Integrate photo uploader component
  - Add form validation before submission
  - Show progress indicator "Step 2 of 2"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 6.1 Write property test for Bar Number format validation
  - **Property 4: Bar Number Format Validation**
  - **Validates: Requirements 2.2, 2.4**

- [ ]* 6.2 Write property test for NIN format validation
  - **Property 5: NIN Format Validation**
  - **Validates: Requirements 3.1**

- [ ]* 6.3 Write property test for NIN verification requirement
  - **Property 6: NIN Verification Requirement**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 6.4 Write property test for complete submission requirements
  - **Property 9: Complete Submission Requirements**
  - **Validates: Requirements 5.1, 5.2**

- [x] 7. Implement step navigation guards
  - Add navigation guard to prevent accessing credentials without completing basic info
  - Update router configuration in `src/router.tsx`
  - Redirect to current incomplete step on page load
  - _Requirements: 6.4_

- [ ]* 7.1 Write property test for step navigation prevention
  - **Property 11: Step Navigation Prevention**
  - **Validates: Requirements 6.4**

- [x] 8. Implement error handling and validation
  - Add inline error messages for all form fields
  - Add validation summary alert at top of forms
  - Implement user-friendly error messages for API failures
  - Add retry buttons for failed operations
  - Preserve form data on errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for error message specificity
  - **Property 12: Error Message Specificity**
  - **Validates: Requirements 7.1**

- [ ]* 8.2 Write property test for form data preservation on error
  - **Property 14: Form Data Preservation on Error**
  - **Validates: Requirements 7.3**

- [x] 9. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify forms render correctly
  - Test validation logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create backend NIN verification endpoint
  - Create `POST /api/lawyers/verify-nin` endpoint
  - Integrate with external NIN verification API
  - Implement rate limiting (5 attempts per hour per user)
  - Add error handling for API failures
  - Store verification results securely
  - _Requirements: 3.2, 3.3, 8.2_

- [ ]* 10.1 Write unit tests for NIN verification endpoint
  - Test successful verification
  - Test invalid NIN
  - Test rate limiting
  - Test API errors
  - _Requirements: 3.2, 3.3_

- [ ] 11. Create backend onboarding submission endpoint
  - Create `POST /api/lawyers/onboarding/submit` endpoint
  - Validate all required data is present
  - Store lawyer profile with credentials
  - Set status to 'pending' for admin review
  - Send confirmation email to lawyer
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.4_

- [ ]* 11.1 Write unit tests for submission endpoint
  - Test successful submission
  - Test missing required fields
  - Test duplicate submissions
  - Test database errors
  - _Requirements: 5.1, 5.2_

- [ ] 12. Implement photo upload integration
  - Update credentials form to upload photo to `/api/lawyers/upload-document`
  - Handle upload progress indication
  - Handle upload failures with retry
  - Store photo URL and publicId in form state
  - _Requirements: 4.4, 4.5, 8.3_

- [ ]* 12.1 Write property test for API retry logic
  - **Property 13: API Retry Logic**
  - **Validates: Requirements 8.5**

- [ ] 13. Create pending approval page
  - Create `src/routes/onboarding/lawyer/pending.tsx`
  - Display confirmation message with reference number
  - Show application status
  - Provide contact information for support
  - _Requirements: 5.3, 5.5_

- [ ] 14. Update routing configuration
  - Update `src/router.tsx` to include new routes
  - Remove old specializations and documents routes
  - Add navigation guards for step access control
  - Set up redirect logic based on onboarding status
  - _Requirements: 6.3, 6.4_

- [ ] 15. Implement responsive design
  - Ensure forms work on mobile devices (touch-friendly)
  - Test layouts on tablet and desktop
  - Verify photo upload works on mobile
  - Test progress tracker on all screen sizes
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 16. Implement accessibility features
  - Add proper ARIA labels to all form fields
  - Ensure keyboard navigation works throughout
  - Test with screen readers
  - Add focus management for validation errors
  - _Requirements: 9.3, 9.4_

- [ ] 17. Final checkpoint - Integration testing
  - Test complete onboarding flow end-to-end
  - Test error recovery scenarios
  - Test navigation between steps
  - Test NIN verification flow
  - Test photo upload flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 17.1 Write integration tests for complete flow
  - Test happy path: basic info → credentials → submit
  - Test error recovery flows
  - Test navigation with incomplete steps
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Backend tasks (10, 11) may require coordination with backend team
- Photo upload uses existing `/api/lawyers/upload-document` endpoint
- NIN verification requires new backend endpoint and external API integration
