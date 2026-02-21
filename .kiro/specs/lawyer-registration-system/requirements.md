# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive 7-step lawyer registration and onboarding system that will replace the current simplified 2-step onboarding flow. The system enables lawyers to register their professional credentials, verify their identity through NIN (National Identification Number), upload required documents, and submit their application for administrative approval. The system maintains state across all steps, supports resumption of incomplete registrations, and enforces proper validation at each stage.

## Glossary

- **System**: The 7-step lawyer registration and onboarding application
- **Lawyer**: A user registering to use the legal services platform
- **Registration_Status**: An enumerated value tracking the current step in the registration process
- **NIN**: National Identification Number - an 11-digit unique identifier
- **Backend**: The server-side API that persists registration data
- **Step**: One of seven sequential stages in the registration process
- **Session**: An authenticated user session identified by a token
- **Practice_Area**: A legal specialty (e.g., Criminal Law, Corporate Law)
- **Bar_Number**: A unique identifier assigned to a lawyer by the bar association
- **Admin**: A system administrator who reviews and approves lawyer applications

## Requirements

### Requirement 1: Account Creation

**User Story:** As a prospective lawyer user, I want to create an account with my email and password, so that I can begin the registration process.

#### Acceptance Criteria

1. WHEN a lawyer provides an email, password, confirmation password, and phone number, THE System SHALL validate the email format
2. WHEN a lawyer provides a password, THE System SHALL validate it contains at least 8 characters, at least one number, and at least one special character
3. WHEN a lawyer provides a confirmation password, THE System SHALL validate it matches the password field
4. WHEN a lawyer provides a phone number, THE System SHALL validate it is in a valid format with country code
5. WHEN all Step 1 fields are valid and the lawyer submits, THE System SHALL send the data to the Backend via POST to /api/register/step1
6. WHEN the Backend successfully creates the account, THE System SHALL store the lawyer_id and token in browser storage
7. WHEN the Backend successfully creates the account, THE System SHALL update the registration_status to step2
8. WHEN Step 1 is complete, THE System SHALL redirect the lawyer to Step 2

### Requirement 2: Personal Information Collection

**User Story:** As a lawyer, I want to provide my personal information, so that the system has my identity details.

#### Acceptance Criteria

1. WHEN a lawyer navigates to Step 2, THE System SHALL retrieve any previously saved personal information from the Backend via GET /api/register/step2
2. WHEN a lawyer provides first name, last name, date of birth, gender, state, and LGA, THE System SHALL validate all required fields are filled
3. WHEN a lawyer provides a date of birth, THE System SHALL validate the lawyer is at least 18 years old
4. WHEN a lawyer selects a state, THE System SHALL populate the LGA dropdown with local government areas for that state
5. WHEN a lawyer completes Step 2 and submits, THE System SHALL send the data to the Backend via POST to /api/register/step2
6. WHEN the Backend successfully saves personal information, THE System SHALL update the registration_status to step3
7. WHEN Step 2 is complete, THE System SHALL redirect the lawyer to Step 3

### Requirement 3: NIN Verification

**User Story:** As a lawyer, I want to verify my identity using my National Identification Number, so that the system can confirm I am who I claim to be.

#### Acceptance Criteria

1. WHEN a lawyer provides an 11-digit NIN, THE System SHALL validate it contains exactly 11 numeric digits
2. WHEN a lawyer attempts to verify NIN, THE System SHALL require the lawyer to check a consent checkbox agreeing to NDPR (Nigeria Data Protection Regulation) terms
3. WHEN a lawyer attempts to submit without checking the consent checkbox, THE System SHALL display a validation error
4. WHEN a lawyer submits a valid NIN with consent, THE System SHALL send the NIN and consent flag to the Backend via POST to /api/register/step3/verify-nin
5. WHEN the Backend is verifying the NIN, THE System SHALL display a loading indicator
6. WHEN the Backend returns NIN verification data, THE System SHALL display the photo, full name, date of birth, and address from the NIN database
7. WHEN the NIN name does not match the Step 2 name, THE System SHALL display a mismatch warning before the confirmation screen
8. WHEN a lawyer confirms the NIN information is correct, THE System SHALL send confirmation to the Backend via POST to /api/register/step3/confirm
9. WHEN a lawyer indicates the NIN information is not theirs, THE System SHALL display an error message and allow re-entry or contact support
10. WHEN the Backend successfully confirms NIN verification, THE System SHALL update the registration_status to step4
11. WHEN Step 3 is complete, THE System SHALL redirect the lawyer to Step 4

### Requirement 4: Professional Information Collection

**User Story:** As a lawyer, I want to provide my professional credentials, so that the system can verify my legal qualifications.

#### Acceptance Criteria

1. WHEN a lawyer navigates to Step 4, THE System SHALL retrieve any previously saved professional information from the Backend via GET /api/register/step4
2. WHEN a lawyer provides bar number, year of call, law school, university, and LLB graduation year, THE System SHALL validate all fields are filled
3. WHEN a lawyer provides a year of call and LLB graduation year, THE System SHALL validate the year of call is after or equal to the LLB graduation year
4. WHEN a lawyer provides years, THE System SHALL validate they are not in the future
5. WHEN a lawyer completes Step 4 and submits, THE System SHALL send the data to the Backend via POST to /api/register/step4
6. WHEN the Backend successfully saves professional information, THE System SHALL update the registration_status to step5
7. WHEN Step 4 is complete, THE System SHALL redirect the lawyer to Step 5

### Requirement 5: Practice Information Collection

**User Story:** As a lawyer, I want to provide details about my legal practice, so that clients can find me based on my specialties and location.

#### Acceptance Criteria

1. WHEN a lawyer navigates to Step 5, THE System SHALL retrieve any previously saved practice information from the Backend via GET /api/register/step5
2. WHEN a lawyer selects "Law Firm" as practice type, THE System SHALL require the firm name field
3. WHEN a lawyer selects "Solo Practitioner" as practice type, THE System SHALL not require the firm name field
4. WHEN a lawyer completes Step 5, THE System SHALL validate at least one practice area is selected
5. WHEN a lawyer completes Step 5, THE System SHALL validate at least one state of practice is selected
6. WHEN a lawyer completes Step 5, THE System SHALL validate office address, city, and state are provided
7. WHEN a lawyer completes Step 5 and submits, THE System SHALL send the data to the Backend via POST to /api/register/step5
8. WHEN the Backend successfully saves practice information, THE System SHALL update the registration_status to step6
9. WHEN Step 5 is complete, THE System SHALL redirect the lawyer to Step 6

### Requirement 6: Document Upload

**User Story:** As a lawyer, I want to upload my credentials and photo, so that the system can verify my qualifications.

#### Acceptance Criteria

1. WHEN a lawyer uploads a Call to Bar Certificate, THE System SHALL validate the file is PDF or image format (JPEG, PNG, WebP)
2. WHEN a lawyer uploads an LLB Certificate, THE System SHALL validate the file is PDF or image format (JPEG, PNG, WebP)
3. WHEN a lawyer uploads a Passport Photo, THE System SHALL validate the file is image format only (JPEG, PNG, WebP)
4. WHEN a lawyer uploads a certificate file, THE System SHALL validate the file size does not exceed 2MB
5. WHEN a lawyer uploads a passport photo, THE System SHALL validate the file size does not exceed 5MB
6. WHEN a lawyer uploads a file, THE System SHALL display a preview of the uploaded file
7. WHEN a lawyer completes Step 6, THE System SHALL validate all three required documents are uploaded
8. WHEN a lawyer completes Step 6 and submits, THE System SHALL send the files to the Backend via POST to /api/register/step6 using multipart/form-data
9. WHEN the Backend successfully saves documents, THE System SHALL update the registration_status to step7
10. WHEN Step 6 is complete, THE System SHALL redirect the lawyer to Step 7

### Requirement 7: Review and Submission

**User Story:** As a lawyer, I want to review all my information before submitting, so that I can ensure everything is correct.

#### Acceptance Criteria

1. WHEN a lawyer navigates to Step 7, THE System SHALL retrieve all registration data from the Backend via GET /api/register/summary
2. WHEN displaying the summary, THE System SHALL show account information (email, phone)
3. WHEN displaying the summary, THE System SHALL show personal information (name, DOB, gender, state, LGA)
4. WHEN displaying the summary, THE System SHALL show NIN verification status
5. WHEN displaying the summary, THE System SHALL show professional information (bar number, education)
6. WHEN displaying the summary, THE System SHALL show practice information (firm, areas, locations)
7. WHEN displaying the summary, THE System SHALL show uploaded documents with thumbnails or previews
8. WHEN displaying each section, THE System SHALL provide an "Edit" button that links back to that step
9. WHEN a lawyer submits the application, THE System SHALL send the submission to the Backend via POST to /api/register/submit
10. WHEN the Backend successfully accepts the submission, THE System SHALL display a success message
11. WHEN the Backend successfully accepts the submission, THE System SHALL update the registration_status to submitted
12. WHEN the application is submitted, THE System SHALL redirect the lawyer to a Pending Approval dashboard

### Requirement 8: Progress Tracking and Navigation

**User Story:** As a lawyer, I want to see my progress through the registration steps, so that I know how much is left to complete.

#### Acceptance Criteria

1. WHEN a lawyer is on any registration step, THE System SHALL display a progress bar showing the current step number out of 7
2. WHEN a lawyer is on any registration step, THE System SHALL display step indicators with checkmarks for completed steps
3. WHEN a lawyer attempts to navigate to a future incomplete step, THE System SHALL prevent navigation and keep them on the current step
4. WHEN a lawyer navigates to a previous completed step, THE System SHALL allow navigation
5. WHEN a lawyer is on any step, THE System SHALL display both "Save & Continue" and "Save & Exit" buttons
6. WHEN a lawyer clicks "Save & Continue", THE System SHALL validate the current step and move to the next step
7. WHEN a lawyer clicks "Save & Exit", THE System SHALL save current progress and redirect to the dashboard

### Requirement 9: Registration State Management

**User Story:** As a lawyer, I want to resume my registration from where I left off, so that I don't have to start over if I exit.

#### Acceptance Criteria

1. WHEN a lawyer loads any registration page, THE System SHALL check the registration_status from the Backend via GET /api/register/status
2. WHEN the registration_status indicates an incomplete step, THE System SHALL redirect the lawyer to the correct step
3. WHEN the registration_status is "submitted", THE System SHALL redirect the lawyer to the Pending Approval dashboard
4. WHEN the registration_status is "approved", THE System SHALL redirect the lawyer to the main dashboard
5. WHEN a lawyer completes a step, THE System SHALL save all form data to the Backend
6. WHEN a lawyer returns to a previous step, THE System SHALL pre-fill the form with previously saved data
7. WHEN a lawyer successfully submits the application, THE System SHALL clear any locally stored draft data

### Requirement 10: Authentication and Security

**User Story:** As a system administrator, I want to ensure only authenticated users can access registration steps, so that the system remains secure.

#### Acceptance Criteria

1. WHEN a lawyer attempts to access Step 2 through Step 7 without authentication, THE System SHALL redirect to the login page
2. WHEN a lawyer attempts to access a step, THE System SHALL validate the registration_status on the Backend
3. WHEN a lawyer attempts to skip steps via URL manipulation, THE System SHALL redirect to the correct step based on registration_status
4. WHEN a lawyer uploads files, THE System SHALL sanitize and validate file types on the Backend
5. WHEN a lawyer attempts NIN verification, THE System SHALL rate limit verification attempts to prevent abuse
6. WHEN the System transmits sensitive data, THE System SHALL encrypt data in transit using HTTPS
7. WHEN the Backend stores sensitive data, THE System SHALL encrypt data at rest

### Requirement 11: Error Handling and Validation

**User Story:** As a lawyer, I want clear error messages when something goes wrong, so that I can correct issues and continue registration.

#### Acceptance Criteria

1. WHEN a field validation fails, THE System SHALL display an error message next to the specific field
2. WHEN an API request fails, THE System SHALL display a clear error message to the lawyer
3. WHEN a network error occurs, THE System SHALL provide a retry option
4. WHEN a session timeout occurs, THE System SHALL redirect to the login page with a timeout message
5. WHEN the Backend returns an error, THE System SHALL display the error message in a user-friendly format

### Requirement 12: Responsive Design and Accessibility

**User Story:** As a lawyer using a mobile device, I want the registration system to work well on my device, so that I can complete registration anywhere.

#### Acceptance Criteria

1. WHEN a lawyer accesses the System on a mobile device, THE System SHALL display a mobile-optimized layout
2. WHEN a lawyer accesses the System on a tablet, THE System SHALL display a tablet-optimized layout
3. WHEN a lawyer accesses the System on a desktop, THE System SHALL display a desktop-optimized layout
4. WHEN a lawyer uses a screen reader, THE System SHALL provide ARIA labels on all input fields
5. WHEN a lawyer navigates using a keyboard, THE System SHALL support keyboard navigation through all interactive elements
6. WHEN a lawyer tabs through form fields, THE System SHALL manage focus appropriately
