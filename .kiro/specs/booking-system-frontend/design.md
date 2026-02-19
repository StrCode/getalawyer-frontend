# Design Document: Booking System Frontend

## Overview

The booking system frontend is a comprehensive React 19 application that enables lawyers to manage their consultation offerings and availability while allowing clients to discover, book, and manage consultations. The system integrates with an existing backend API and follows modern React patterns using TanStack Router for routing, TanStack Query for data fetching and caching, TanStack Form for form management, Zod for validation, Tailwind CSS for styling, and shadcn/ui for UI components.

The architecture emphasizes separation of concerns with distinct layers for routing, data management, business logic, and presentation. The design prioritizes user experience through optimistic updates, comprehensive error handling, responsive design, and accessibility compliance.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Routing Layer (TanStack Router)                            │
│  ├── Protected Routes (Dashboard, Bookings)                 │
│  ├── Public Routes (Lawyer Profiles)                        │
│  └── Route Guards (Authentication)                          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (TanStack Query)                                │
│  ├── Query Hooks (Fetching)                                 │
│  ├── Mutation Hooks (Updates)                               │
│  ├── Cache Management                                       │
│  └── Optimistic Updates                                     │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Form Validation (Zod Schemas)                          │
│  ├── Data Transformations                                   │
│  ├── Business Rules                                         │
│  └── Utility Functions                                      │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── Page Components                                        │
│  ├── Feature Components                                     │
│  ├── Shared Components (shadcn/ui)                          │
│  └── Dashboard Widgets                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Backend REST API
```

### Component Organization

```
src/
├── routes/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   ├── index.tsx                    # Dashboard route
│   │   │   ├── lawyer.tsx                   # Lawyer dashboard
│   │   │   └── client.tsx                   # Client dashboard
│   │   ├── lawyer/
│   │   │   ├── consultation-types/
│   │   │   │   ├── index.tsx                # List consultation types
│   │   │   │   ├── new.tsx                  # Create consultation type
│   │   │   │   └── $id.edit.tsx             # Edit consultation type
│   │   │   ├── availability/
│   │   │   │   ├── index.tsx                # Manage availability
│   │   │   │   └── exceptions.tsx           # Manage exceptions
│   │   │   ├── bookings/
│   │   │   │   ├── index.tsx                # List bookings
│   │   │   │   └── $id.tsx                  # Booking details
│   │   │   └── calendar/
│   │   │       └── index.tsx                # Calendar integration
│   │   └── client/
│   │       ├── lawyers/
│   │       │   ├── index.tsx                # Browse lawyers
│   │       │   └── $id.tsx                  # Lawyer profile
│   │       ├── bookings/
│   │       │   ├── index.tsx                # List bookings
│   │       │   ├── new.tsx                  # Create booking
│   │       │   └── $id.tsx                  # Booking details
│   │       └── book/
│   │           └── $lawyerId.$typeId.tsx    # Booking flow
│   └── public/
│       └── lawyers/
│           └── $id.tsx                      # Public lawyer profile
├── components/
│   ├── dashboard/
│   │   ├── LawyerDashboard.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── UpcomingBookingsWidget.tsx
│   │   └── PendingRequestsWidget.tsx
│   ├── lawyer/
│   │   ├── ConsultationTypeForm.tsx
│   │   ├── ConsultationTypeList.tsx
│   │   ├── AvailabilitySchedule.tsx
│   │   ├── AvailabilityExceptions.tsx
│   │   ├── BookingList.tsx
│   │   ├── BookingCard.tsx
│   │   └── CalendarIntegration.tsx
│   ├── client/
│   │   ├── LawyerCard.tsx
│   │   ├── LawyerList.tsx
│   │   ├── ConsultationTypeCard.tsx
│   │   ├── SlotPicker.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingCard.tsx
│   └── ui/                                  # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── consultation-types.ts
│   │   ├── availability.ts
│   │   ├── bookings.ts
│   │   ├── lawyers.ts
│   │   └── calendar.ts
│   ├── hooks/
│   │   ├── useConsultationTypes.ts
│   │   ├── useAvailability.ts
│   │   ├── useBookings.ts
│   │   ├── useLawyers.ts
│   │   └── useCalendar.ts
│   ├── schemas/
│   │   ├── consultation-type.ts
│   │   ├── availability.ts
│   │   └── booking.ts
│   └── utils/
│       ├── date.ts
│       ├── timezone.ts
│       └── validation.ts
└── types/
    ├── consultation-type.ts
    ├── availability.ts
    ├── booking.ts
    └── lawyer.ts
```

## Components and Interfaces

### Core Data Types

```typescript
// Consultation Type
interface ConsultationType {
  id: string;
  lawyerId: string;
  name: string;
  description: string;
  duration: number;        // minutes
  price: number;           // currency amount
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Availability Schedule
interface WeeklySchedule {
  [day: string]: TimeRange[];  // day: 'monday' | 'tuesday' | ...
}

interface TimeRange {
  start: string;  // HH:mm format
  end: string;    // HH:mm format
}

interface AvailabilityException {
  id: string;
  lawyerId: string;
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  reason?: string;
  createdAt: string;
}

// Booking
interface Booking {
  id: string;
  clientId: string;
  lawyerId: string;
  consultationTypeId: string;
  startTime: string;      // ISO datetime
  endTime: string;        // ISO datetime
  status: BookingStatus;
  clientNotes?: string;
  lawyerNotes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  client?: User;
  lawyer?: User;
  consultationType?: ConsultationType;
}

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Available Slot
interface AvailableSlot {
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
}

// Calendar Integration
interface CalendarConnection {
  id: string;
  lawyerId: string;
  provider: 'google';
  isConnected: boolean;
  email?: string;
  lastSyncedAt?: string;
}

// Lawyer Profile
interface Lawyer {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  bio?: string;
  consultationTypes?: ConsultationType[];
}
```

### API Client Functions

```typescript
// Consultation Types API
async function getConsultationTypes(): Promise<ConsultationType[]>
async function createConsultationType(data: CreateConsultationTypeInput): Promise<ConsultationType>
async function updateConsultationType(id: string, data: UpdateConsultationTypeInput): Promise<ConsultationType>
async function deleteConsultationType(id: string): Promise<void>

// Availability API
async function getAvailabilitySchedule(): Promise<WeeklySchedule>
async function updateAvailabilitySchedule(schedule: WeeklySchedule): Promise<WeeklySchedule>
async function getAvailabilityExceptions(): Promise<AvailabilityException[]>
async function createAvailabilityException(data: CreateExceptionInput): Promise<AvailabilityException>
async function deleteAvailabilityException(id: string): Promise<void>

// Bookings API (Client)
async function getClientBookings(): Promise<Booking[]>
async function createBooking(data: CreateBookingInput): Promise<Booking>
async function updateClientBooking(id: string, data: UpdateBookingInput): Promise<Booking>

// Bookings API (Lawyer)
async function getLawyerBookings(): Promise<Booking[]>
async function updateLawyerBooking(id: string, data: UpdateLawyerBookingInput): Promise<Booking>

// Available Slots API
async function getAvailableSlots(lawyerId: string, consultationTypeId: string, startDate: string, endDate: string): Promise<AvailableSlot[]>

// Lawyers API
async function getLawyers(): Promise<Lawyer[]>
async function getLawyer(id: string): Promise<Lawyer>

// Calendar API
async function getCalendarConnection(): Promise<CalendarConnection>
async function connectCalendar(authCode: string): Promise<CalendarConnection>
async function disconnectCalendar(): Promise<void>
```

### TanStack Query Hooks

```typescript
// Consultation Types
function useConsultationTypes()
function useCreateConsultationType()
function useUpdateConsultationType()
function useDeleteConsultationType()

// Availability
function useAvailabilitySchedule()
function useUpdateAvailabilitySchedule()
function useAvailabilityExceptions()
function useCreateAvailabilityException()
function useDeleteAvailabilityException()

// Bookings (Client)
function useClientBookings()
function useCreateBooking()
function useUpdateClientBooking()

// Bookings (Lawyer)
function useLawyerBookings()
function useUpdateLawyerBooking()

// Available Slots
function useAvailableSlots(lawyerId: string, consultationTypeId: string, dateRange: DateRange)

// Lawyers
function useLawyers()
function useLawyer(id: string)

// Calendar
function useCalendarConnection()
function useConnectCalendar()
function useDisconnectCalendar()
```

### Zod Validation Schemas

```typescript
// Consultation Type Schema
const consultationTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500),
  duration: z.number().int().positive('Duration must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
  isActive: z.boolean().default(true)
});

// Time Range Schema
const timeRangeSchema = z.object({
  start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
}).refine(
  (data) => data.start < data.end,
  { message: 'Start time must be before end time', path: ['end'] }
);

// Weekly Schedule Schema
const weeklyScheduleSchema = z.record(
  z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  z.array(timeRangeSchema)
);

// Availability Exception Schema
const availabilityExceptionSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reason: z.string().max(200).optional()
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'Start date must be before or equal to end date', path: ['endDate'] }
);

// Booking Schema
const bookingSchema = z.object({
  lawyerId: z.string().uuid(),
  consultationTypeId: z.string().uuid(),
  startTime: z.string().datetime(),
  clientNotes: z.string().max(500).optional()
});
```

## Data Models

### State Management Strategy

The application uses TanStack Query for server state management, eliminating the need for global state management libraries. Each feature has dedicated query hooks that handle:

1. **Data Fetching**: Automatic fetching with caching
2. **Mutations**: Create, update, delete operations
3. **Cache Invalidation**: Automatic refetching after mutations
4. **Optimistic Updates**: Immediate UI updates before server confirmation
5. **Error Handling**: Centralized error handling with retry logic

### Query Key Structure

```typescript
// Consultation Types
['consultation-types']
['consultation-types', id]

// Availability
['availability', 'schedule']
['availability', 'exceptions']

// Bookings
['bookings', 'client']
['bookings', 'lawyer']
['bookings', id]

// Available Slots
['available-slots', lawyerId, consultationTypeId, startDate, endDate]

// Lawyers
['lawyers']
['lawyers', id]

// Calendar
['calendar', 'connection']
```

### Cache Invalidation Rules

```typescript
// After creating/updating/deleting consultation type
invalidateQueries(['consultation-types'])
invalidateQueries(['lawyers', lawyerId])  // Refresh lawyer profile

// After updating availability
invalidateQueries(['availability', 'schedule'])
invalidateQueries(['available-slots'])  // Refresh all slot queries

// After creating/updating availability exception
invalidateQueries(['availability', 'exceptions'])
invalidateQueries(['available-slots'])

// After creating/updating booking (client)
invalidateQueries(['bookings', 'client'])
invalidateQueries(['available-slots'])  // Slot is no longer available

// After updating booking (lawyer)
invalidateQueries(['bookings', 'lawyer'])
invalidateQueries(['bookings', 'client'])  // If client is viewing

// After calendar connection/disconnection
invalidateQueries(['calendar', 'connection'])
```

### Optimistic Update Patterns

```typescript
// Booking Status Update (Lawyer)
const updateBookingMutation = useMutation({
  mutationFn: (data) => updateLawyerBooking(bookingId, data),
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['bookings', 'lawyer']);
    
    // Snapshot previous value
    const previousBookings = queryClient.getQueryData(['bookings', 'lawyer']);
    
    // Optimistically update
    queryClient.setQueryData(['bookings', 'lawyer'], (old) =>
      old.map(booking =>
        booking.id === bookingId
          ? { ...booking, ...newData }
          : booking
      )
    );
    
    return { previousBookings };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['bookings', 'lawyer'], context.previousBookings);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['bookings', 'lawyer']);
  }
});

// Consultation Type Deletion
const deleteConsultationTypeMutation = useMutation({
  mutationFn: deleteConsultationType,
  onMutate: async (id) => {
    await queryClient.cancelQueries(['consultation-types']);
    const previousTypes = queryClient.getQueryData(['consultation-types']);
    
    queryClient.setQueryData(['consultation-types'], (old) =>
      old.filter(type => type.id !== id)
    );
    
    return { previousTypes };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['consultation-types'], context.previousTypes);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['consultation-types']);
  }
});
```

## Data Flow Examples

### Booking Creation Flow

```
1. Client selects lawyer and consultation type
   └─> Navigate to /client/book/:lawyerId/:typeId

2. Fetch available slots
   └─> useAvailableSlots(lawyerId, typeId, dateRange)
   └─> GET /api/lawyers/:lawyerId/available-slots

3. Client selects slot and fills form
   └─> TanStack Form with Zod validation
   └─> Validate: slot selection, client notes

4. Submit booking
   └─> useCreateBooking()
   └─> POST /api/bookings
   └─> Optimistic update: Add to client bookings
   └─> Invalidate: ['bookings', 'client'], ['available-slots']

5. Show confirmation
   └─> Navigate to /client/bookings/:id
   └─> Display booking details
```

### Availability Management Flow

```
1. Lawyer navigates to availability page
   └─> /lawyer/availability

2. Fetch current schedule
   └─> useAvailabilitySchedule()
   └─> GET /api/lawyer/availability/schedule

3. Lawyer modifies schedule
   └─> Update local state in form

4. Submit changes
   └─> useUpdateAvailabilitySchedule()
   └─> POST /api/lawyer/availability/schedule
   └─> Invalidate: ['availability', 'schedule'], ['available-slots']

5. Fetch exceptions
   └─> useAvailabilityExceptions()
   └─> GET /api/lawyer/availability/exceptions

6. Add exception
   └─> useCreateAvailabilityException()
   └─> POST /api/lawyer/availability/exceptions
   └─> Optimistic update: Add to exceptions list
   └─> Invalidate: ['availability', 'exceptions'], ['available-slots']
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form Validation Rejects Invalid Input

*For any* form submission with invalid data (empty required fields, negative numbers where positive required, invalid formats), the validation should fail and display field-level error messages before any API call is made.

**Validates: Requirements 1.5, 1.6, 1.7, 1.8, 2.6, 2.7, 8.1, 12.1**

### Property 2: API Mutations Trigger Correct Endpoints

*For any* data mutation operation (create, update, delete), the system should call the correct API endpoint with properly formatted data matching the expected schema.

**Validates: Requirements 1.1, 1.3, 1.4, 2.1, 2.3, 2.5, 3.2, 3.3, 3.4, 4.1, 4.3, 8.2, 9.3**

### Property 3: Fetched Data is Displayed Completely

*For any* data fetched from the API (consultation types, bookings, availability, lawyers), all items returned should be displayed in the UI with their complete information.

**Validates: Requirements 1.2, 2.2, 2.4, 3.1, 6.1, 6.2, 9.1, 11.1**

### Property 4: Required Fields are Displayed

*For any* entity displayed in the UI (consultation type, booking, lawyer profile), all required fields specified in the requirements should be present in the rendered output.

**Validates: Requirements 3.6, 6.3, 9.6, 11.3, 11.5**

### Property 5: Bookings are Correctly Grouped by Status

*For any* list of bookings with mixed statuses, the UI should correctly group them by status (pending, confirmed, completed, cancelled) with each booking appearing in exactly one group.

**Validates: Requirements 3.5, 9.5**

### Property 6: Bookings are Correctly Categorized by Time

*For any* list of bookings, those with start times in the future should appear in "upcoming" and those with start times in the past should appear in "past" consultations.

**Validates: Requirements 9.2**

### Property 7: Dashboard Widgets Display Correct Bookings

*For any* set of bookings, the lawyer dashboard should display the next 5 upcoming confirmed bookings, the client dashboard should display the next 3 upcoming confirmed bookings, and pending requests should show all bookings with status "pending".

**Validates: Requirements 5.1, 5.2, 5.3, 10.1**

### Property 8: Optimistic Updates Rollback on Failure

*For any* optimistic update that fails, the UI should revert to the previous state and display an error message, ensuring the displayed data matches the server state.

**Validates: Requirements 3.7, 13.3, 13.4**

### Property 9: Cache Invalidation Triggers Refetch

*For any* data mutation, the system should invalidate the relevant query caches, causing affected data to be refetched and the UI to update with fresh data.

**Validates: Requirements 5.5, 10.5, 13.2, 13.5**

### Property 10: Available Slots are Fetched with Correct Parameters

*For any* consultation type selection, the system should fetch available slots with the correct lawyer ID, consultation type ID, and date range parameters.

**Validates: Requirements 7.1**

### Property 11: Slots are Grouped by Date

*For any* list of available slots, the UI should group them by date with all slots for the same date appearing together in chronological order.

**Validates: Requirements 7.2**

### Property 12: Timezone Conversion is Applied

*For any* time slot or booking time displayed to the client, the time should be converted from UTC to the client's local timezone.

**Validates: Requirements 7.5**

### Property 13: Lawyer Search Filters Correctly

*For any* search query or filter applied to the lawyer list, only lawyers matching the search criteria (specialty or consultation type) should be displayed in the results.

**Validates: Requirements 6.4**

### Property 14: Active Consultation Types Only

*For any* public lawyer profile, only consultation types with `isActive: true` should be displayed to visitors.

**Validates: Requirements 11.2**

### Property 15: Error Messages Distinguish Error Types

*For any* API error response, the system should display different error messages for client errors (4xx status codes) versus server errors (5xx status codes).

**Validates: Requirements 12.3, 12.4**

### Property 16: Loading States During Submission

*For any* form submission in progress, the system should display a loading indicator and disable the submit button until the request completes or fails.

**Validates: Requirements 12.6**

### Property 17: Focus Management on Validation Errors

*For any* form with validation errors, the system should move focus to the first invalid field to aid keyboard navigation.

**Validates: Requirements 12.5**

### Property 18: Keyboard Navigation for Interactive Elements

*For any* interactive element (button, link, form input), the element should be reachable and operable using only keyboard navigation (Tab, Enter, Space, Arrow keys).

**Validates: Requirements 15.1**

### Property 19: ARIA Labels Present on Form Elements

*For any* form input or button, the element should have an associated ARIA label (via aria-label, aria-labelledby, or a visible label element).

**Validates: Requirements 15.2**

### Property 20: Focus Trap in Modals

*For any* open modal or dialog, keyboard focus should be trapped within the modal, and focus should return to the triggering element when the modal closes.

**Validates: Requirements 15.3**

### Property 21: Dynamic Content Announced to Screen Readers

*For any* dynamic content change (new booking added, status updated, error message displayed), the change should be announced to screen readers via ARIA live regions.

**Validates: Requirements 15.5**

### Property 22: Semantic HTML Structure

*For any* page in the application, the HTML should use semantic elements (nav, main, article, section, header, footer) to provide proper document structure.

**Validates: Requirements 15.6**

## Error Handling

### Error Categories

The application handles four categories of errors:

1. **Validation Errors**: Client-side validation failures before API calls
2. **Client Errors (4xx)**: User errors like invalid input, unauthorized access
3. **Server Errors (5xx)**: Backend failures, database issues
4. **Network Errors**: Connection failures, timeouts

### Error Handling Strategy

```typescript
// Validation Errors
// Handled by Zod schemas and TanStack Form
// Display field-level errors inline with form inputs

// API Errors
function handleApiError(error: ApiError) {
  if (error.status >= 400 && error.status < 500) {
    // Client error - user can fix
    return {
      title: 'Invalid Request',
      message: error.message || 'Please check your input and try again.',
      canRetry: true
    };
  } else if (error.status >= 500) {
    // Server error - backend issue
    return {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      canRetry: true
    };
  } else if (error.name === 'NetworkError') {
    // Network error - connection issue
    return {
      title: 'Connection Error',
      message: 'Unable to connect. Please check your internet connection.',
      canRetry: true
    };
  }
}

// Error Display Component
function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const errorInfo = handleApiError(error);
  
  return (
    <Alert variant="destructive">
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription>
        {errorInfo.message}
        {errorInfo.canRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### Error Boundaries

```typescript
// Top-level error boundary for catastrophic failures
class AppErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    logError(error, errorInfo);
    
    // Display fallback UI
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// Route-level error boundaries for graceful degradation
function RouteErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
}
```

### Retry Logic

```typescript
// TanStack Query retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 3 times for server/network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't auto-retry mutations
    },
  },
});
```

## Testing Strategy

### Dual Testing Approach

The application uses both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific user flows (e.g., booking creation with valid data)
- Edge cases (e.g., empty booking list, no available slots)
- Error conditions (e.g., API failures, validation errors)
- Component integration (e.g., form submission triggers API call)

**Property Tests**: Verify universal properties across all inputs
- Run minimum 100 iterations per test due to randomization
- Generate random valid data to test properties
- Each test references its design document property
- Tag format: `Feature: booking-system-frontend, Property {number}: {property_text}`

### Testing Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing with user-centric queries
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **fast-check**: Property-based testing library for TypeScript

### Test Organization

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ConsultationTypeForm.test.tsx
│   │   ├── BookingList.test.tsx
│   │   └── SlotPicker.test.tsx
├── lib/
│   ├── __tests__/
│   │   ├── api.test.ts
│   │   ├── schemas.test.ts
│   │   └── utils.test.ts
│   └── __property-tests__/
│       ├── validation.property.test.ts
│       ├── api-integration.property.test.ts
│       ├── data-display.property.test.ts
│       └── accessibility.property.test.ts
└── routes/
    └── __tests__/
        ├── booking-flow.test.tsx
        └── availability-management.test.tsx
```

### Example Property Test

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// Feature: booking-system-frontend, Property 1: Form Validation Rejects Invalid Input
describe('Property 1: Form Validation Rejects Invalid Input', () => {
  it('should reject consultation types with invalid data', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.oneof(fc.constant(''), fc.string({ maxLength: 0 })),
          duration: fc.oneof(fc.constant(0), fc.integer({ max: -1 })),
          price: fc.integer({ max: -1 }),
          description: fc.string()
        }),
        (invalidData) => {
          const result = consultationTypeSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: booking-system-frontend, Property 3: Fetched Data is Displayed Completely
describe('Property 3: Fetched Data is Displayed Completely', () => {
  it('should display all consultation types returned from API', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            duration: fc.integer({ min: 1, max: 480 }),
            price: fc.float({ min: 0, max: 10000 }),
            isActive: fc.boolean()
          }),
          { minLength: 0, maxLength: 20 }
        ),
        async (consultationTypes) => {
          // Mock API response
          server.use(
            http.get('/api/consultation-types', () => {
              return HttpResponse.json(consultationTypes);
            })
          );
          
          // Render component
          const { findAllByTestId } = render(<ConsultationTypeList />);
          
          // Verify all items are displayed
          const items = await findAllByTestId('consultation-type-item');
          expect(items).toHaveLength(consultationTypes.length);
          
          // Verify each item contains the data
          consultationTypes.forEach((type, index) => {
            expect(items[index]).toHaveTextContent(type.name);
            expect(items[index]).toHaveTextContent(type.description);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Example Unit Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Booking Creation Flow', () => {
  it('should create a booking when valid data is submitted', async () => {
    const user = userEvent.setup();
    const mockCreateBooking = vi.fn().mockResolvedValue({
      id: '123',
      status: 'pending'
    });
    
    render(<BookingForm onSubmit={mockCreateBooking} />);
    
    // Fill form
    await user.type(screen.getByLabelText('Client Notes'), 'Need help with contract');
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));
    
    // Verify API call
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          clientNotes: 'Need help with contract'
        })
      );
    });
    
    // Verify success message
    expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
  });
  
  it('should display error when booking fails', async () => {
    const user = userEvent.setup();
    const mockCreateBooking = vi.fn().mockRejectedValue(
      new Error('Slot no longer available')
    );
    
    render(<BookingForm onSubmit={mockCreateBooking} />);
    
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));
    
    await waitFor(() => {
      expect(screen.getByText(/slot no longer available/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });
  
  it('should prevent booking within 24 hours of cancellation', () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 12);
    
    const booking = {
      id: '123',
      startTime: tomorrow.toISOString(),
      status: 'confirmed'
    };
    
    render(<BookingCard booking={booking} />);
    
    const cancelButton = screen.queryByRole('button', { name: 'Cancel' });
    expect(cancelButton).not.toBeInTheDocument();
    expect(screen.getByText(/contact the lawyer/i)).toBeInTheDocument();
  });
});
```

### Coverage Goals

- **Unit Test Coverage**: 80% code coverage minimum
- **Property Test Coverage**: All correctness properties implemented
- **Integration Test Coverage**: All critical user flows tested
- **Accessibility Testing**: All interactive components tested with keyboard and screen reader simulation

