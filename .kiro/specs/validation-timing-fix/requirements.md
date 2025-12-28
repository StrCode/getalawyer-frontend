# Requirements Document

## Introduction

Fix the validation timing issue in the lawyer onboarding flow where form validation errors are displayed immediately when entering a page instead of on blur or change events, and ensure proper form validation when navigating between steps.

## Glossary

- **Validation_Engine**: The system responsible for validating form fields and displaying errors
- **Form_Navigator**: Component managing navigation between onboarding steps
- **Field_Validator**: Individual field validation logic with timing controls
- **Error_Display**: System for showing validation errors to users

## Requirements

### Requirement 1: Proper Validation Timing

**User Story:** As a lawyer filling out the onboarding form, I want validation errors to appear only when I interact with fields or attempt to navigate, so that I'm not overwhelmed with errors when first entering a page.

#### Acceptance Criteria

1. WHEN a user first enters the basics page, THE Validation_Engine SHALL NOT display any validation errors
2. WHEN a user focuses on a field and then blurs (leaves) the field, THE Field_Validator SHALL validate and display errors for that specific field
3. WHEN a user types in a field and then stops typing, THE Field_Validator SHALL validate after a short delay (debounced validation)
4. WHEN a user attempts to navigate to the next step, THE Form_Navigator SHALL validate all required fields and display errors if validation fails
5. WHEN validation passes for a field, THE Error_Display SHALL clear any previous errors for that field and show success indicators

### Requirement 2: Step Navigation Validation

**User Story:** As a lawyer completing the onboarding process, I want the system to validate my current step when I click continue, so that I can fix any issues before proceeding.

#### Acceptance Criteria

1. WHEN a user clicks "Continue to Credentials" from the basics page, THE Form_Navigator SHALL validate all required fields in the basics step
2. WHEN validation fails during navigation, THE Form_Navigator SHALL prevent navigation and display specific error messages
3. WHEN validation passes during navigation, THE Form_Navigator SHALL allow navigation to the credentials step
4. WHEN a user returns to a previously completed step, THE Form_Navigator SHALL restore the saved data without showing validation errors initially
5. WHEN a user has unsaved changes and attempts to navigate, THE Form_Navigator SHALL validate the current form state

### Requirement 3: Enhanced User Experience

**User Story:** As a lawyer using the onboarding form, I want clear feedback about field validation status, so that I understand what needs to be fixed and what is correct.

#### Acceptance Criteria

1. WHEN a field passes validation, THE Error_Display SHALL show a green checkmark or success indicator
2. WHEN a field has validation errors, THE Error_Display SHALL show specific error messages with suggestions for fixing
3. WHEN multiple fields have errors, THE Error_Display SHALL prioritize critical errors over minor ones
4. WHEN a user is typing in a field, THE Error_Display SHALL not show errors until the user stops typing (debounced)
5. WHEN a field becomes valid after being invalid, THE Error_Display SHALL immediately clear the error and show success state