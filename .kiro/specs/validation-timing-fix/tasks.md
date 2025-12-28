# Implementation Plan: Validation Timing Fix

## Overview

Fix the validation timing issue in the lawyer onboarding flow where errors show immediately on page load instead of on blur/change events. Simple focused approach to improve user experience.

## Tasks

- [x] 1. Fix basics page validation timing
  - Remove immediate validation error display on page load
  - Only show validation errors after user interacts with fields (onBlur)
  - Show validation errors when user clicks "Continue" button
  - Keep existing validation logic, just change when errors are displayed
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 2. Fix credentials page validation timing  
  - Apply same validation timing fixes as basics page
  - Ensure "Save Credentials" button validates fields before saving
  - Only show errors after user interaction or button clicks
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 3. Test the fixes
  - Test that no errors show on page load
  - Test that errors show on field blur
  - Test that errors show when clicking continue/save buttons
  - Test that navigation works properly with validation
  - _Requirements: All requirements_

## Notes

- Simple approach: just change WHEN errors are displayed, not HOW validation works
- Keep all existing validation logic intact
- Focus on user experience - no errors on page load, errors on interaction
- Use TanStack Form's built-in validation timing if it helps