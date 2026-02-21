# Implementation Plan: 7-Step Lawyer Registration System

## Overview

This implementation plan breaks down the 7-step lawyer registration system into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests and unit tests integrated throughout to validate correctness early. The implementation follows a bottom-up approach: core utilities and validation first, then state management, then individual step components, and finally integration and navigation.

## Tasks

- [x] 1. Set up project structure and core utilities
  - Create directory structure for registration feature
  - Set up validation utilities and Zod schemas for all 7 steps
  - Create type definitions for all form data interfaces
  - Set up constants (registration status enum, error messages, API endpoints)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 3.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

- [ ]* 1.1 Write property tests for validation utilities
  - **Property 1: Email validation correctness**
  - **Property 2: Password strength validation**
  - **Property 3: Password confirmation matching**
  - **Property 4: Phone number format validation**
  - **Property 5: Age validation from date of birth**
  - **Property 6: NIN format validation**
  - **Property 6a: NIN consent validation**
  - **Property 7: Year ordering validation**
  - **Property 8: Future date prevention**
  - **Property 9: Conditional firm name validation**
  - **Property 10: Array minimum length validation**
  - **Property 11: File type validation for certificates**
  - **Property 12: File type validation for passport photo**
  - **Property 13: File size validation for certificates**
  - **Property 14: File size validation for passport photo**
  - **Property 15: Document completeness validation**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.3, 3.1, 3.2, 3.3, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.7**

- [x] 2. Implement Zustand registration store
  - [x] 2.1 Create Zustand store with registration state
    - Define store interface with all step data
    - Implement actions for updating each step's data
    - Implement registration status management
    - Add localStorage persistence middleware
    - _Requirements: 9.5, 9.6, 9.7_

  - [ ]* 2.2 Write property tests for store state management
    - **Property 16: Registration status progression**
    - **Property 18: Data persistence round-trip**
    - **Property 21: Local storage cleanup on submission**
    - **Validates: Requirements 1.7, 2.6, 3.8, 4.6, 5.8, 6.9, 7.11, 9.5, 9.6, 9.7**

- [x] 3. Implement API integration layer
  - [x] 3.1 Create registration API service
    - Implement all API endpoint functions (createAccount, savePersonalInfo, verifyNIN, etc.)
    - Add error handling and retry logic
    - Integrate with existing httpClient from src/lib/api/client.ts
    - _Requirements: 1.5, 2.1, 2.5, 3.2, 3.6, 4.1, 4.5, 5.1, 5.7, 6.8, 7.1, 7.9, 9.1, 10.2_

  - [x] 3.2 Create TanStack Query hooks
    - Implement query hooks (useRegistrationStatus, usePersonalInfo, etc.)
    - Implement mutation hooks (useCreateAccount, useSavePersonalInfo, etc.)
    - Configure cache invalidation strategies
    - _Requirements: 1.5, 2.1, 2.5, 3.2, 3.6, 4.1, 4.5, 5.1, 5.7, 6.8, 7.1, 7.9, 9.1_

  - [ ]* 3.3 Write property tests for API integration
    - **Property 22: Form submission triggers API call**
    - **Property 23: Page load triggers data fetch**
    - **Property 24: Status check on page load**
    - **Property 25: Token storage on account creation**
    - **Validates: Requirements 1.5, 1.6, 2.1, 2.5, 3.2, 3.6, 4.1, 4.5, 5.1, 5.7, 6.8, 7.1, 7.9, 9.1, 10.2**

- [x] 4. Create shared registration components
  - [x] 4.1 Implement RegistrationLayout component
    - Create layout wrapper with progress bar
    - Implement step indicators with checkmarks
    - Add responsive container styling
    - _Requirements: 8.1, 8.2_

  - [x] 4.2 Implement FormActions component
    - Create "Save & Continue" and "Save & Exit" buttons
    - Handle loading states
    - Implement button click handlers
    - _Requirements: 8.5, 8.6, 8.7_

  - [x] 4.3 Implement ProgressIndicator component
    - Create visual progress bar
    - Implement step indicators with completion status
    - Add navigation guards for future steps
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.4 Write property tests for shared components
    - **Property 32: Progress bar accuracy**
    - **Property 33: Step indicator checkmarks**
    - **Property 34: Action buttons presence**
    - **Validates: Requirements 8.1, 8.2, 8.5**

- [ ] 5. Checkpoint - Ensure foundation is solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Step 1: Account Creation
  - [x] 6.1 Create AccountCreationForm component
    - Build form with React Hook Form and Zod validation
    - Implement email, password, confirm password, and phone number fields
    - Add real-time validation feedback
    - Integrate with useCreateAccount mutation
    - Handle form submission and navigation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 6.2 Create /register/step1 route
    - Set up TanStack Router route
    - Integrate AccountCreationForm component
    - Add route metadata
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 6.3 Write integration tests for Step 1
    - Test complete account creation flow
    - Test validation error handling
    - Test API error handling
    - Test navigation after success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 7. Implement Step 2: Personal Information
  - [x] 7.1 Create PersonalInfoForm component
    - Build form with all personal information fields
    - Implement state/LGA dependent dropdown
    - Add date picker for date of birth
    - Integrate with useSavePersonalInfo mutation
    - Pre-fill form with existing data on mount
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 7.2 Create /register/step2 route
    - Set up TanStack Router route with auth guard
    - Integrate PersonalInfoForm component
    - Add beforeLoad hook for status check
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 10.1_

  - [ ]* 7.3 Write property tests for dependent dropdown
    - **Property 47: LGA population based on state**
    - **Validates: Requirements 2.4**

  - [ ]* 7.4 Write integration tests for Step 2
    - Test form pre-filling from API
    - Test state/LGA dropdown interaction
    - Test age validation
    - Test form submission and navigation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 8. Implement Step 3: NIN Verification
  - [x] 8.1 Create NINVerificationForm component
    - Build NIN input form with validation
    - Implement verification flow with loading state
    - Create verification result display (photo, name, DOB, address)
    - Add name mismatch warning logic
    - Implement confirm/reject buttons
    - Handle rejection with error message and re-entry
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 8.2 Create /register/step3 route
    - Set up TanStack Router route with auth guard
    - Integrate NINVerificationForm component
    - Add beforeLoad hook for status check
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 10.1_

  - [ ]* 8.3 Write property tests for NIN verification
    - **Property 26: Loading indicator during async operations**
    - **Property 27: NIN verification result display**
    - **Property 28: Name mismatch warning**
    - **Property 41: Rejection error handling**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.7**

  - [ ]* 8.4 Write integration tests for Step 3
    - Test NIN verification flow
    - Test name mismatch detection
    - Test confirmation flow
    - Test rejection and re-entry flow
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 9. Checkpoint - Ensure first 3 steps work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Step 4: Professional Information
  - [x] 10.1 Create ProfessionalInfoForm component
    - Build form with bar number, year of call, law school, university, LLB year fields
    - Implement year validation (year of call >= LLB year, no future dates)
    - Integrate with useSaveProfessionalInfo mutation
    - Pre-fill form with existing data on mount
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 10.2 Create /register/step4 route
    - Set up TanStack Router route with auth guard
    - Integrate ProfessionalInfoForm component
    - Add beforeLoad hook for status check
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.1_

  - [ ]* 10.3 Write integration tests for Step 4
    - Test form pre-filling
    - Test year validation logic
    - Test form submission and navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 11. Implement Step 5: Practice Information
  - [x] 11.1 Create PracticeInfoForm component
    - Build form with practice type, firm name, practice areas, states, office address fields
    - Implement conditional firm name validation
    - Add multi-select for practice areas and states
    - Integrate with useSavePracticeInfo mutation
    - Pre-fill form with existing data on mount
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 11.2 Create /register/step5 route
    - Set up TanStack Router route with auth guard
    - Integrate PracticeInfoForm component
    - Add beforeLoad hook for status check
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 10.1_

  - [ ]* 11.3 Write integration tests for Step 5
    - Test conditional firm name validation
    - Test multi-select interactions
    - Test form submission and navigation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 12. Implement Step 6: Document Upload
  - [x] 12.1 Create DocumentUploadForm component
    - Build file upload inputs for 3 documents
    - Implement file type and size validation
    - Add file preview functionality
    - Create FormData and integrate with useUploadDocuments mutation
    - Handle upload progress indicators
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [x] 12.2 Create /register/step6 route
    - Set up TanStack Router route with auth guard
    - Integrate DocumentUploadForm component
    - Add beforeLoad hook for status check
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 10.1_

  - [ ]* 12.3 Write property tests for file upload
    - **Property 29: File preview display**
    - **Validates: Requirements 6.6**

  - [ ]* 12.4 Write integration tests for Step 6
    - Test file upload with valid files
    - Test file type validation
    - Test file size validation
    - Test preview display
    - Test form submission and navigation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [x] 13. Implement Step 7: Review and Submit
  - [x] 13.1 Create RegistrationSummary component
    - Fetch complete registration data on mount
    - Display all sections (account, personal, NIN, professional, practice, documents)
    - Add edit buttons for each section
    - Implement submit button with confirmation
    - Handle submission success and navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

  - [x] 13.2 Create /register/step7 route
    - Set up TanStack Router route with auth guard
    - Integrate RegistrationSummary component
    - Add beforeLoad hook for status check
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 10.1_

  - [ ]* 13.3 Write property tests for summary display
    - **Property 30: Summary completeness**
    - **Property 31: Edit buttons presence**
    - **Property 45: Success message on submission**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10**

  - [ ]* 13.4 Write integration tests for Step 7
    - Test summary data display
    - Test edit button navigation
    - Test application submission
    - Test success message and navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

- [ ] 14. Checkpoint - Ensure all 7 steps are implemented
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement navigation and routing logic
  - [x] 15.1 Create registration route guards
    - Implement beforeLoad hooks for authentication checks
    - Implement status-based navigation enforcement
    - Add redirect logic for submitted/approved applications
    - Handle backward navigation allowance
    - _Requirements: 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3_

  - [x] 15.2 Create /register index route
    - Set up parent route that checks status and redirects to correct step
    - Implement status check on every page load
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 15.3 Write property tests for navigation
    - **Property 17: Step navigation after completion**
    - **Property 19: Status-based navigation enforcement**
    - **Property 20: Backward navigation allowance**
    - **Property 35: Save and continue behavior**
    - **Property 36: Save and exit behavior**
    - **Property 42: Authentication guard for protected steps**
    - **Property 43: Status-based redirection for submitted applications**
    - **Property 44: Status-based redirection for approved applications**
    - **Validates: Requirements 1.8, 2.7, 3.9, 4.7, 5.9, 6.10, 7.12, 8.3, 8.4, 8.6, 8.7, 9.2, 9.3, 9.4, 10.1, 10.3**

- [x] 16. Implement error handling and user feedback
  - [x] 16.1 Create error display components
    - Implement field-level error display
    - Create API error toast notifications
    - Add network error retry UI
    - Implement session timeout redirect
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 16.2 Integrate error handling across all forms
    - Add error boundaries to catch React errors
    - Implement user-friendly error message mapping
    - Add loading states for all async operations
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 16.3 Write property tests for error handling
    - **Property 37: Field-level error display**
    - **Property 38: API error message display**
    - **Property 39: Network error retry option**
    - **Property 40: Session timeout redirect**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [x] 17. Implement accessibility features
  - [x] 17.1 Add ARIA labels to all form inputs
    - Add aria-label or aria-labelledby to all inputs
    - Add aria-describedby for error messages
    - Add aria-required for required fields
    - _Requirements: 12.4_

  - [x] 17.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add focus management for modals and dialogs
    - Test tab order through forms
    - _Requirements: 12.5, 12.6_

  - [ ]* 17.3 Write property tests for accessibility
    - **Property 46: ARIA labels on inputs**
    - **Validates: Requirements 12.4**

- [x] 18. Create Pending Approval dashboard
  - [x] 18.1 Create PendingApprovalDashboard component
    - Display application submitted message
    - Show application status
    - Add contact support option
    - _Requirements: 7.12, 9.3_

  - [x] 18.2 Create /pending-approval route
    - Set up route with auth guard
    - Integrate PendingApprovalDashboard component
    - Add status check to prevent access if not submitted
    - _Requirements: 7.12, 9.3_

- [ ] 19. Final integration and testing
  - [ ]* 19.1 Write end-to-end tests
    - Test complete registration flow (all 7 steps)
    - Test save and exit, then resume flow
    - Test edit from review page flow
    - Test error handling and recovery
    - Test NIN verification complete flow
    - Test document upload complete flow
    - _Requirements: All requirements_

  - [ ] 19.2 Perform manual testing
    - Test on different browsers
    - Test on mobile devices
    - Test with screen readers
    - Test keyboard navigation
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

- [ ] 20. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (47 total properties)
- Unit tests validate specific examples and edge cases
- Integration tests validate component interactions and API flows
- E2E tests validate complete user journeys
- All forms use React Hook Form with Zod validation
- All API calls use TanStack Query for caching and state management
- All state management uses Zustand with localStorage persistence
- Authentication guards use TanStack Router's beforeLoad hooks
