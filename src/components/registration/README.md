# Lawyer Registration System

This directory contains the implementation of the 7-step lawyer registration and onboarding system.

## Directory Structure

```
src/
├── components/registration/     # Registration UI components
│   ├── shared/                  # Shared components (RegistrationLayout, FormActions, etc.)
│   ├── steps/                   # Individual step form components
│   └── README.md               # This file
├── constants/
│   ├── registration.ts         # Registration constants, enums, messages
│   ├── nigeria-states-lgas.ts  # Nigerian states and LGAs data
│   └── practice-areas.ts       # Legal practice areas data
├── lib/
│   ├── schemas/
│   │   └── registration.ts     # Zod validation schemas for all steps
│   └── utils/
│       └── registration-validation.ts  # Validation utility functions
├── types/
│   └── registration.ts         # TypeScript type definitions
└── stores/
    └── registration-store.ts   # Zustand store (to be implemented)
```

## Features

### 7-Step Registration Flow

1. **Step 1: Account Creation** - Email, password, phone number
2. **Step 2: Personal Information** - Name, DOB, gender, state, LGA
3. **Step 3: NIN Verification** - National ID verification with NDPR consent
4. **Step 4: Professional Information** - Bar number, education details
5. **Step 5: Practice Information** - Practice type, areas, locations
6. **Step 6: Document Upload** - Certificates and passport photo
7. **Step 7: Review & Submit** - Final review and application submission

### Key Features

- **State Management**: Zustand store with localStorage persistence
- **Form Validation**: React Hook Form with Zod schemas
- **API Integration**: TanStack Query for server state management
- **Progress Tracking**: Visual progress indicators and step navigation
- **Error Handling**: Comprehensive error messages and retry logic
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Accessibility**: ARIA labels and keyboard navigation support

## Type Definitions

All TypeScript interfaces and types are defined in `src/types/registration.ts`:

- Form data interfaces for each step
- API response types
- Registration status enum
- Document and verification result types

## Validation Schemas

Zod schemas in `src/lib/schemas/registration.ts` provide:

- Client-side validation for all form fields
- Type inference for form data
- Reusable validation rules
- Custom refinement logic (e.g., password matching, year ordering)

## Constants

### Registration Constants (`src/constants/registration.ts`)

- Registration status enum
- Step configuration
- API endpoints
- Error and success messages
- File upload constraints
- Local storage keys
- Gender and practice type options

### Nigeria States & LGAs (`src/constants/nigeria-states-lgas.ts`)

- Complete list of Nigerian states
- Local Government Areas for each state
- Helper functions to get LGAs by state

### Practice Areas (`src/constants/practice-areas.ts`)

- Legal practice specializations
- Practice area descriptions
- Helper functions to get practice area details

## Validation Utilities

The `src/lib/utils/registration-validation.ts` file provides utility functions for:

- Email format validation
- Password strength validation
- Phone number format validation
- Age validation from date of birth
- NIN format validation
- Year ordering validation
- File type and size validation
- Document completeness validation
- Step navigation helpers

## Usage Example

```typescript
import { accountCreationSchema } from '@/lib/schemas/registration';
import { validateEmail, validatePassword } from '@/lib/utils/registration-validation';
import { REGISTRATION_API_ENDPOINTS, REGISTRATION_ERROR_MESSAGES } from '@/constants/registration';
import type { AccountCreationFormData } from '@/types/registration';

// Use in a form component
const form = useForm<AccountCreationFormData>({
  resolver: zodResolver(accountCreationSchema),
});

// Use validation utilities
if (!validateEmail(email)) {
  console.error(REGISTRATION_ERROR_MESSAGES.INVALID_EMAIL);
}

// Use API endpoints
fetch(REGISTRATION_API_ENDPOINTS.CREATE_ACCOUNT, {
  method: 'POST',
  body: JSON.stringify(formData),
});
```

## Next Steps

1. Implement Zustand registration store (Task 2)
2. Create API integration layer (Task 3)
3. Build shared components (Task 4)
4. Implement individual step components (Tasks 6-13)
5. Add navigation and routing logic (Task 15)
6. Implement error handling (Task 16)
7. Add accessibility features (Task 17)

## Testing

Property-based tests and unit tests will be added to validate:

- Form validation correctness
- State management behavior
- API integration
- UI component rendering
- Navigation logic
- Error handling

See `.kiro/specs/lawyer-registration-system/design.md` for the complete list of correctness properties.
