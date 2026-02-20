# Implementation Plan: Booking System Frontend

## Overview

This implementation plan breaks down the booking system frontend into logical phases, starting with foundational infrastructure, then building lawyer-facing features, followed by client-facing features, and finally integration and polish. Each task builds incrementally on previous work, with testing integrated throughout to catch issues early.

The implementation uses TypeScript, React 19, TanStack Router, TanStack Query, TanStack Form, Zod, Tailwind CSS, and shadcn/ui components.

## Tasks

- [x] 1. Set up project foundation and shared infrastructure
  - Create TypeScript types for all domain models (ConsultationType, Booking, Availability, Lawyer)
  - Set up Zod validation schemas for all forms
  - Create API client functions with proper error handling
  - Set up TanStack Query client with retry logic and cache configuration
  - Create shared utility functions for date/time handling and timezone conversion
  - Set up error handling utilities and error display components
  - _Requirements: 12.2, 12.3, 12.4, 12.7, 13.1, 13.2, 7.5_

- [ ]* 1.1 Write property test for form validation
  - **Property 1: Form Validation Rejects Invalid Input**
  - **Validates: Requirements 1.5, 1.6, 1.7, 1.8, 2.6, 2.7, 8.1, 12.1**

- [ ]* 1.2 Write property test for timezone conversion
  - **Property 12: Timezone Conversion is Applied**
  - **Validates: Requirements 7.5**

- [ ]* 1.3 Write property test for error message distinction
  - **Property 15: Error Messages Distinguish Error Types**
  - **Validates: Requirements 12.3, 12.4**

- [x] 2. Implement lawyer consultation type management
  - [x] 2.1 Create TanStack Query hooks for consultation types (useConsultationTypes, useCreateConsultationType, useUpdateConsultationType, useDeleteConsultationType)
    - Implement query hooks with proper cache keys
    - Implement mutation hooks with optimistic updates
    - Set up cache invalidation on mutations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 13.2, 13.3, 13.4_

  - [x] 2.2 Build ConsultationTypeForm component with TanStack Form and Zod validation
    - Create form with fields for name, description, duration, price, isActive
    - Integrate Zod schema validation
    - Display field-level error messages
    - Show loading states during submission
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 12.1, 12.5, 12.6_

  - [x] 2.3 Build ConsultationTypeList component
    - Display all consultation types with complete information
    - Add edit and delete actions
    - Implement optimistic updates for deletions
    - _Requirements: 1.2, 1.4, 3.6_

  - [x] 2.4 Create routes for consultation type management
    - Create /lawyer/consultation-types route for listing
    - Create /lawyer/consultation-types/new route for creation
    - Create /lawyer/consultation-types/$id/edit route for editing
    - Wire up components to routes
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 2.5 Write property test for API mutations
    - **Property 2: API Mutations Trigger Correct Endpoints**
    - **Validates: Requirements 1.1, 1.3, 1.4**

  - [ ]* 2.6 Write property test for data display
    - **Property 3: Fetched Data is Displayed Completely**
    - **Validates: Requirements 1.2**

  - [ ]* 2.7 Write unit tests for consultation type management
    - Test form validation edge cases
    - Test successful creation, update, and deletion flows
    - Test error handling scenarios
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8_

- [x] 3. Checkpoint - Ensure consultation type management works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement lawyer availability management
  - [x] 4.1 Create TanStack Query hooks for availability (useAvailabilitySchedule, useUpdateAvailabilitySchedule, useAvailabilityExceptions, useCreateAvailabilityException, useDeleteAvailabilityException)
    - Implement query hooks for schedule and exceptions
    - Implement mutation hooks with cache invalidation
    - Invalidate available-slots queries when availability changes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 13.2_

  - [x] 4.2 Build AvailabilitySchedule component
    - Create weekly calendar interface showing all days
    - Allow adding/editing/removing time ranges for each day
    - Validate that start times are before end times
    - Display in user-friendly format
    - _Requirements: 2.1, 2.2, 2.6, 2.8_

  - [x] 4.3 Build AvailabilityExceptions component
    - Display list of exceptions with date ranges and reasons
    - Create form for adding new exceptions
    - Validate that start dates are before or equal to end dates
    - Allow deleting exceptions
    - _Requirements: 2.3, 2.4, 2.5, 2.7_

  - [x] 4.4 Create routes for availability management
    - Create /lawyer/availability route for schedule management
    - Create /lawyer/availability/exceptions route for exceptions
    - Wire up components to routes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.5 Write property test for API mutations
    - **Property 2: API Mutations Trigger Correct Endpoints**
    - **Validates: Requirements 2.1, 2.3, 2.5**

  - [ ]* 4.6 Write property test for data display
    - **Property 3: Fetched Data is Displayed Completely**
    - **Validates: Requirements 2.2, 2.4**

  - [ ]* 4.7 Write unit tests for availability management
    - Test schedule updates with valid and invalid time ranges
    - Test exception creation and deletion
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 5. Checkpoint - Ensure availability management works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement lawyer booking management
  - [x] 6.1 Create TanStack Query hooks for lawyer bookings (useLawyerBookings, useUpdateLawyerBooking)
    - Implement query hook for fetching lawyer bookings
    - Implement mutation hook for updating booking status
    - Set up optimistic updates with rollback on error
    - Invalidate relevant caches on mutations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 13.2, 13.3, 13.4_

  - [x] 6.2 Build BookingCard component for lawyers
    - Display all booking details (client name, consultation type, date, time, duration)
    - Show booking status with visual indicators
    - Add action buttons for confirm, cancel, complete
    - _Requirements: 3.6, 9.5_

  - [x] 6.3 Build BookingList component for lawyers
    - Group bookings by status (pending, confirmed, completed, cancelled)
    - Display each group separately with headers
    - Use BookingCard for individual bookings
    - _Requirements: 3.1, 3.5, 3.6_

  - [x] 6.4 Create route for lawyer booking management
    - Create /lawyer/bookings route for listing all bookings
    - Create /lawyer/bookings/$id route for booking details
    - Wire up components to routes
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 6.5 Write property test for bookings grouped by status
    - **Property 5: Bookings are Correctly Grouped by Status**
    - **Validates: Requirements 3.5, 9.5**

  - [ ]* 6.6 Write property test for required fields display
    - **Property 4: Required Fields are Displayed**
    - **Validates: Requirements 3.6, 9.6**

  - [ ]* 6.7 Write property test for optimistic updates
    - **Property 8: Optimistic Updates Rollback on Failure**
    - **Validates: Requirements 3.7, 13.3, 13.4**

  - [ ]* 6.8 Write unit tests for lawyer booking management
    - Test booking status updates (confirm, cancel, complete)
    - Test optimistic update rollback on error
    - Test booking grouping by status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 7. Implement calendar integration
  - [x] 7.1 Create TanStack Query hooks for calendar (useCalendarConnection, useConnectCalendar, useDisconnectCalendar)
    - Implement query hook for connection status
    - Implement mutation hooks for connect and disconnect
    - Set up cache invalidation
    - _Requirements: 4.1, 4.2, 4.3, 13.2_

  - [x] 7.2 Build CalendarIntegration component
    - Display connection status with visual indicator
    - Add connect button that initiates OAuth flow
    - Add disconnect button for connected calendars
    - Display error messages with troubleshooting guidance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.3 Create route for calendar integration
    - Create /lawyer/calendar route
    - Wire up CalendarIntegration component
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 7.4 Write unit tests for calendar integration
    - Test connection flow
    - Test disconnection flow
    - Test error handling
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Implement lawyer dashboard
  - [x] 8.1 Build UpcomingBookingsWidget component
    - Fetch and display next 5 upcoming confirmed bookings
    - Show booking details in compact format
    - Add navigation to detailed booking view
    - _Requirements: 5.1, 5.4_

  - [x] 8.2 Build PendingRequestsWidget component
    - Fetch and display all pending booking requests
    - Show count badge for pending requests
    - Add navigation to booking management
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 8.3 Build LawyerDashboard component
    - Compose UpcomingBookingsWidget and PendingRequestsWidget
    - Set up automatic refresh on booking updates
    - Add quick action links to key features
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 8.4 Create route for lawyer dashboard
    - Create /dashboard/lawyer route
    - Wire up LawyerDashboard component
    - _Requirements: 5.1, 5.2_

  - [ ]* 8.5 Write property test for dashboard widgets
    - **Property 7: Dashboard Widgets Display Correct Bookings**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 8.6 Write property test for cache invalidation
    - **Property 9: Cache Invalidation Triggers Refetch**
    - **Validates: Requirements 5.5, 13.2, 13.5**

  - [ ]* 8.7 Write unit tests for lawyer dashboard
    - Test widget display with various booking states
    - Test navigation from widgets
    - Test automatic refresh
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Checkpoint - Ensure lawyer features are complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement client lawyer discovery
  - [x] 10.1 Create TanStack Query hooks for lawyers (useLawyers, useLawyer)
    - Implement query hook for fetching all lawyers
    - Implement query hook for fetching single lawyer with consultation types
    - Set up stale-while-revalidate caching
    - _Requirements: 6.1, 6.2, 13.6_

  - [x] 10.2 Build LawyerCard component
    - Display lawyer name, specialty, and brief info
    - Show consultation types offered
    - Add view profile button
    - _Requirements: 6.1, 6.3_

  - [x] 10.3 Build LawyerList component
    - Display all lawyers using LawyerCard
    - Implement search/filter by specialty or consultation type
    - Handle empty states
    - _Requirements: 6.1, 6.4_

  - [x] 10.4 Build ConsultationTypeCard component for clients
    - Display consultation type details (name, description, duration, price)
    - Add book button that navigates to booking flow
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 10.5 Create routes for lawyer discovery
    - Create /client/lawyers route for browsing lawyers
    - Create /client/lawyers/$id route for lawyer profile
    - Wire up components to routes
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]* 10.6 Write property test for lawyer search filtering
    - **Property 13: Lawyer Search Filters Correctly**
    - **Validates: Requirements 6.4**

  - [ ]* 10.7 Write property test for data display
    - **Property 3: Fetched Data is Displayed Completely**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 10.8 Write property test for required fields
    - **Property 4: Required Fields are Displayed**
    - **Validates: Requirements 6.3**

  - [ ]* 10.9 Write unit tests for lawyer discovery
    - Test lawyer list display
    - Test search and filtering
    - Test navigation to lawyer profile
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Implement available slot selection
  - [ ] 11.1 Create TanStack Query hook for available slots (useAvailableSlots)
    - Implement query hook with lawyer ID, consultation type ID, and date range parameters
    - Set up proper cache keys for different parameter combinations
    - _Requirements: 7.1, 13.2_

  - [ ] 11.2 Build SlotPicker component
    - Display available slots grouped by date
    - Implement calendar navigation (week/month)
    - Allow single slot selection
    - Display "no availability" message when appropriate
    - Convert slot times to client's local timezone
    - Make touch-friendly for mobile
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 14.5_

  - [ ]* 11.3 Write property test for available slots parameters
    - **Property 10: Available Slots are Fetched with Correct Parameters**
    - **Validates: Requirements 7.1**

  - [ ]* 11.4 Write property test for slots grouped by date
    - **Property 11: Slots are Grouped by Date**
    - **Validates: Requirements 7.2**

  - [ ]* 11.5 Write unit tests for slot picker
    - Test slot display and grouping
    - Test calendar navigation
    - Test slot selection
    - Test empty state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 12. Implement client booking creation
  - [ ] 12.1 Create TanStack Query hooks for client bookings (useClientBookings, useCreateBooking, useUpdateClientBooking)
    - Implement query hook for fetching client bookings
    - Implement mutation hook for creating bookings with optimistic updates
    - Implement mutation hook for updating bookings
    - Invalidate available-slots cache after booking creation
    - _Requirements: 8.2, 9.1, 9.3, 9.4, 13.2, 13.3_

  - [ ] 12.2 Build BookingForm component
    - Create form with slot selection, client notes field
    - Validate all required fields
    - Validate slot is still available before submission
    - Display booking summary before confirmation
    - Show loading states during submission
    - Display success confirmation with booking details
    - Handle and display errors with retry option
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 12.1, 12.6_

  - [ ] 12.3 Create booking flow route
    - Create /client/book/$lawyerId/$typeId route
    - Integrate SlotPicker and BookingForm
    - Handle navigation after successful booking
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 12.4 Write property test for form validation
    - **Property 1: Form Validation Rejects Invalid Input**
    - **Validates: Requirements 8.1, 12.1**

  - [ ]* 12.5 Write property test for API mutations
    - **Property 2: API Mutations Trigger Correct Endpoints**
    - **Validates: Requirements 8.2**

  - [ ]* 12.6 Write property test for loading states
    - **Property 16: Loading States During Submission**
    - **Validates: Requirements 12.6**

  - [ ]* 12.7 Write unit tests for booking creation
    - Test successful booking flow
    - Test validation errors
    - Test slot no longer available error
    - Test booking summary display
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 13. Implement client booking management
  - [ ] 13.1 Build BookingCard component for clients
    - Display all booking details (lawyer name, consultation type, date, time, meeting link)
    - Show booking status with visual indicators
    - Add cancel button (disabled if within 24 hours)
    - Add reschedule button
    - Display message for bookings within 24 hours
    - _Requirements: 9.3, 9.5, 9.6, 9.7_

  - [ ] 13.2 Build BookingList component for clients
    - Separate bookings into upcoming and past consultations
    - Display each category with headers
    - Use BookingCard for individual bookings
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

  - [ ] 13.3 Implement reschedule functionality
    - Allow selecting new time slot
    - Update booking with new time
    - Invalidate relevant caches
    - _Requirements: 9.4, 13.2_

  - [ ] 13.4 Create routes for client booking management
    - Create /client/bookings route for listing bookings
    - Create /client/bookings/$id route for booking details
    - Wire up components to routes
    - _Requirements: 9.1, 9.3, 9.4_

  - [ ]* 13.5 Write property test for bookings categorized by time
    - **Property 6: Bookings are Correctly Categorized by Time**
    - **Validates: Requirements 9.2**

  - [ ]* 13.6 Write property test for required fields display
    - **Property 4: Required Fields are Displayed**
    - **Validates: Requirements 9.6**

  - [ ]* 13.7 Write unit tests for client booking management
    - Test booking list display with upcoming and past separation
    - Test cancel functionality
    - Test 24-hour cancellation prevention
    - Test reschedule functionality
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 14. Implement client dashboard
  - [ ] 14.1 Build ClientDashboard component
    - Display widget showing next 3 upcoming confirmed bookings
    - Add quick action button to book new consultation
    - Display message when no upcoming bookings
    - Set up automatic refresh on booking updates
    - Add navigation to detailed booking views
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 14.2 Create route for client dashboard
    - Create /dashboard/client route
    - Wire up ClientDashboard component
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 14.3 Write property test for dashboard widgets
    - **Property 7: Dashboard Widgets Display Correct Bookings**
    - **Validates: Requirements 10.1**

  - [ ]* 14.4 Write property test for cache invalidation
    - **Property 9: Cache Invalidation Triggers Refetch**
    - **Validates: Requirements 10.5, 13.2, 13.5**

  - [ ]* 14.5 Write unit tests for client dashboard
    - Test widget display with bookings
    - Test empty state
    - Test navigation
    - Test automatic refresh
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 15. Checkpoint - Ensure client features are complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement public lawyer profiles
  - [ ] 16.1 Build public lawyer profile page
    - Display lawyer information (name, specialty, bio, experience)
    - Display all active consultation types
    - Show consultation type details (name, description, duration, price)
    - Redirect unauthenticated users to sign up/login when attempting to book
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 16.2 Create public route
    - Create /public/lawyers/$id route
    - Wire up public profile component
    - Set up authentication redirect
    - _Requirements: 11.1, 11.4_

  - [ ]* 16.3 Write property test for active consultation types only
    - **Property 14: Active Consultation Types Only**
    - **Validates: Requirements 11.2**

  - [ ]* 16.4 Write property test for required fields display
    - **Property 4: Required Fields are Displayed**
    - **Validates: Requirements 11.3, 11.5**

  - [ ]* 16.5 Write unit tests for public profiles
    - Test profile display
    - Test consultation type filtering (active only)
    - Test authentication redirect
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 17. Implement responsive design
  - [ ] 17.1 Add responsive Tailwind classes to all components
    - Ensure mobile breakpoint (320px+) works correctly
    - Ensure tablet breakpoint (768px+) works correctly
    - Ensure desktop breakpoint (1024px+) works correctly
    - _Requirements: 14.1, 14.2, 14.3, 14.6_

  - [ ] 17.2 Implement mobile-optimized navigation
    - Create mobile menu for protected routes
    - Ensure touch-friendly tap targets
    - _Requirements: 14.4_

  - [ ] 17.3 Optimize calendar and slot picker for mobile
    - Make touch-friendly with appropriate sizing
    - Optimize layout for small screens
    - _Requirements: 14.5_

  - [ ]* 17.4 Write unit tests for responsive behavior
    - Test component rendering at different breakpoints
    - Test mobile navigation
    - Test touch interactions
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 18. Implement accessibility features
  - [ ] 18.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Implement proper tab order
    - Add keyboard shortcuts where appropriate
    - _Requirements: 15.1_

  - [ ] 18.2 Add ARIA labels and semantic HTML
    - Add ARIA labels to all form inputs and buttons
    - Use semantic HTML elements (nav, main, article, section, header, footer)
    - Ensure proper heading hierarchy
    - _Requirements: 15.2, 15.6_

  - [ ] 18.3 Implement focus management
    - Add focus traps to modals and dialogs
    - Return focus to triggering element when closing modals
    - Focus first invalid field on validation errors
    - _Requirements: 15.3, 12.5_

  - [ ] 18.4 Add ARIA live regions for dynamic content
    - Announce booking status changes
    - Announce error messages
    - Announce success confirmations
    - _Requirements: 15.5_

  - [ ] 18.5 Ensure color contrast compliance
    - Verify all text meets WCAG AA contrast standards
    - Update colors if needed
    - _Requirements: 15.4_

  - [ ]* 18.6 Write property test for keyboard navigation
    - **Property 18: Keyboard Navigation for Interactive Elements**
    - **Validates: Requirements 15.1**

  - [ ]* 18.7 Write property test for ARIA labels
    - **Property 19: ARIA Labels Present on Form Elements**
    - **Validates: Requirements 15.2**

  - [ ]* 18.8 Write property test for focus trap
    - **Property 20: Focus Trap in Modals**
    - **Validates: Requirements 15.3**

  - [ ]* 18.9 Write property test for dynamic content announcements
    - **Property 21: Dynamic Content Announced to Screen Readers**
    - **Validates: Requirements 15.5**

  - [ ]* 18.10 Write property test for semantic HTML
    - **Property 22: Semantic HTML Structure**
    - **Validates: Requirements 15.6**

  - [ ]* 18.11 Write property test for focus management on errors
    - **Property 17: Focus Management on Validation Errors**
    - **Validates: Requirements 12.5**

  - [ ]* 18.12 Write unit tests for accessibility features
    - Test keyboard navigation flows
    - Test screen reader announcements
    - Test focus management
    - Test color contrast
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 19. Integration and polish
  - [ ] 19.1 Wire up main dashboard route
    - Create /dashboard route that redirects to appropriate dashboard based on user role
    - Implement role detection
    - _Requirements: 5.1, 10.1_

  - [ ] 19.2 Add route guards for protected routes
    - Implement authentication checks
    - Redirect unauthenticated users to login
    - Implement role-based access control
    - _Requirements: 11.4_

  - [ ] 19.3 Implement global error boundary
    - Add top-level error boundary for catastrophic failures
    - Add route-level error boundaries for graceful degradation
    - Log errors to error tracking service
    - _Requirements: 12.3, 12.4, 12.7_

  - [ ] 19.4 Add loading states and skeletons
    - Create skeleton components for loading states
    - Add loading indicators to all async operations
    - Ensure smooth transitions
    - _Requirements: 12.6_

  - [ ] 19.5 Optimize cache configuration
    - Review and tune stale times
    - Set up background refetching where appropriate
    - Implement prefetching for common navigation paths
    - _Requirements: 13.1, 13.5, 13.6_

  - [ ]* 19.6 Write integration tests for complete user flows
    - Test complete booking creation flow (lawyer discovery → slot selection → booking)
    - Test complete availability management flow
    - Test complete booking management flow
    - _Requirements: All_

- [ ] 20. Final checkpoint and verification
  - Ensure all tests pass (unit and property tests)
  - Verify all requirements are implemented
  - Test complete user flows manually
  - Verify responsive design on multiple devices
  - Verify accessibility with keyboard and screen reader
  - Ask the user if questions arise or if any adjustments are needed

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests should run minimum 100 iterations and be tagged with: `Feature: booking-system-frontend, Property {number}: {property_text}`
- Unit tests focus on specific examples, edge cases, and integration points
- Property tests verify universal correctness properties across all inputs
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a logical progression: foundation → lawyer features → client features → integration
- All components use TypeScript, React 19, TanStack Router, TanStack Query, TanStack Form, Zod, Tailwind CSS, and shadcn/ui
- Error handling is integrated throughout with proper retry logic and user-friendly messages
- Accessibility and responsive design are built in from the start, not added as afterthoughts
