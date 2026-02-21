# 7-Step Lawyer Registration System

## Overview

This spec defines a comprehensive 7-step lawyer registration and onboarding system that replaces the current simplified 2-step flow. The new system includes identity verification, credential validation, document uploads, and administrative approval workflows.

## Spec Documents

### 1. [requirements.md](./requirements.md)
Complete requirements specification with:
- 12 main requirements
- 76 acceptance criteria using EARS patterns
- User stories for each requirement
- Clear validation rules for each step

### 2. [design.md](./design.md)
Detailed technical design including:
- System architecture and state machine diagrams
- TypeScript interfaces for all data models
- Zod validation schemas
- API integration layer with TanStack Query hooks
- 48 correctness properties for property-based testing
- Error handling strategies
- Testing approach (unit, integration, E2E)

### 3. [tasks.md](./tasks.md)
Implementation plan with:
- 20 top-level tasks
- 60+ sub-tasks
- Property-based test tasks (47 properties)
- Checkpoints for validation
- Task dependencies and ordering

### 4. [CLEANUP.md](./CLEANUP.md)
Migration and cleanup guide with:
- List of all old onboarding files to delete
- Code modifications required
- Database/backend changes needed
- Migration strategy (5 phases)
- Verification checklist
- Rollback plan

## Registration Flow

### Step 1: Account Creation
- Email, password, phone number
- Password strength validation
- Account creation with token storage

### Step 2: Personal Information
- Name, date of birth, gender
- State and LGA selection
- Age validation (18+)

### Step 3: NIN Verification
- 11-digit NIN input
- Real-time verification with NIN database
- Photo and identity confirmation
- Name mismatch detection

### Step 4: Professional Information
- Bar number
- Year of call to bar
- Law school and university
- LLB graduation year
- Year ordering validation

### Step 5: Practice Information
- Practice type (Solo/Firm)
- Firm name (conditional)
- Practice areas (multi-select)
- States of practice
- Office address

### Step 6: Document Upload
- Call to Bar Certificate (PDF/Image, max 2MB)
- LLB Certificate (PDF/Image, max 2MB)
- Passport Photo (Image only, max 5MB)
- File preview and validation

### Step 7: Review & Submit
- Complete summary of all information
- Edit buttons for each section
- Final submission
- Redirect to Pending Approval dashboard

## Key Features

### State Management
- Zustand store with localStorage persistence
- Resume registration from any step
- Draft recovery on browser refresh
- Clear data on successful submission

### Navigation & Progress
- Progress bar (Step X of 7)
- Step indicators with checkmarks
- Navigation guards (can't skip ahead)
- Backward navigation allowed
- "Save & Continue" and "Save & Exit" buttons

### Validation
- Client-side validation with Zod
- Real-time field validation
- Server-side validation
- File type and size validation
- Conditional validation (e.g., firm name)

### Error Handling
- Field-level error messages
- API error display with retry
- Network error handling
- Session timeout redirect
- User-friendly error messages

### Security
- Authentication required (except Step 1)
- Status-based route guards
- File sanitization
- Rate limiting for NIN verification
- HTTPS encryption
- Data encryption at rest

### Accessibility
- ARIA labels on all inputs
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Responsive design (mobile, tablet, desktop)

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with type-safe routes
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand with persist middleware
- **Server State**: TanStack Query for caching
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS (assumed from existing codebase)
- **Testing**: Vitest, React Testing Library, Property-Based Testing

## Getting Started

### Prerequisites
1. Review all spec documents (requirements, design, tasks)
2. Ensure backend API endpoints are ready or plan backend implementation
3. Set up development environment

### Implementation Order
1. Start with Task 1: Set up project structure and utilities
2. Follow tasks.md sequentially
3. Complete checkpoints at milestones (Tasks 5, 9, 14, 20)
4. Run tests after each task
5. Review with team at checkpoints

### Testing Strategy
- Write property-based tests for validation logic (47 properties)
- Write unit tests for components and utilities
- Write integration tests for API interactions
- Write E2E tests for complete flows
- Aim for high test coverage (>80%)

## Migration from Old System

### Current System (2-Step)
- Step 1: Basics (name, email, phone, location)
- Step 2: Credentials (bar number, NIN, photo)
- Review page
- Status tracking

### New System (7-Step)
- More granular steps
- Separate NIN verification step with confirmation
- Professional and practice information separated
- Multiple document uploads
- Comprehensive review

### Migration Plan
See [CLEANUP.md](./CLEANUP.md) for detailed migration strategy including:
- Files to delete
- Code to modify
- Backend changes
- 5-phase migration approach
- Verification checklist
- Rollback plan

## API Endpoints

### Registration Endpoints
```
POST /api/register/step1          - Create account
GET  /api/register/step2          - Get personal info
POST /api/register/step2          - Save personal info
POST /api/register/step3/verify-nin - Verify NIN
POST /api/register/step3/confirm  - Confirm NIN
GET  /api/register/step4          - Get professional info
POST /api/register/step4          - Save professional info
GET  /api/register/step5          - Get practice info
POST /api/register/step5          - Save practice info
POST /api/register/step6          - Upload documents
GET  /api/register/summary        - Get complete summary
POST /api/register/submit         - Submit application
GET  /api/register/status         - Get registration status
```

### Registration Status Values
- `step1` - Account creation incomplete
- `step2` - Personal info incomplete
- `step3` - NIN verification incomplete
- `step4` - Professional info incomplete
- `step5` - Practice info incomplete
- `step6` - Documents incomplete
- `step7` - Ready for review
- `submitted` - Application submitted, pending approval
- `approved` - Application approved
- `rejected` - Application rejected, needs revision

## Property-Based Testing

The spec includes 48 correctness properties that should hold true across all valid executions:

### Categories
- **Form Validation** (16 properties): Email, password, phone, NIN, NIN consent, dates, files
- **State Management** (6 properties): Status progression, navigation, persistence
- **API Integration** (4 properties): Form submission, data fetching, status checks
- **UI Behavior** (7 properties): Loading states, displays, previews
- **Error Handling** (5 properties): Field errors, API errors, network errors
- **Authentication** (3 properties): Route guards, redirects
- **Accessibility** (1 property): ARIA labels
- **Dependent Dropdowns** (1 property): LGA based on state

See design.md for complete property definitions.

## Success Criteria

### Functional
- [ ] All 7 steps implemented and working
- [ ] All validation rules enforced
- [ ] NIN verification integrated
- [ ] Document upload working
- [ ] Review and submission complete
- [ ] Navigation and progress tracking working
- [ ] Save & Exit / Resume working

### Quality
- [ ] All property-based tests passing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing
- [ ] Code coverage >80%
- [ ] No critical accessibility issues
- [ ] Responsive on all devices

### Performance
- [ ] Page load <2 seconds
- [ ] Form submission <3 seconds
- [ ] File upload with progress indicator
- [ ] No UI blocking during async operations

### Security
- [ ] All routes properly protected
- [ ] File uploads sanitized
- [ ] NIN verification rate limited
- [ ] Sensitive data encrypted
- [ ] XSS prevention in place

## Support & Questions

For questions or issues during implementation:
1. Review the spec documents thoroughly
2. Check the tasks.md for implementation guidance
3. Refer to design.md for technical details
4. Consult CLEANUP.md for migration questions

## Timeline Estimate

Based on tasks.md:
- **Setup & Core Utilities**: 2-3 days (Tasks 1-3)
- **Shared Components**: 1-2 days (Task 4)
- **Steps 1-3**: 3-4 days (Tasks 6-8)
- **Steps 4-6**: 3-4 days (Tasks 10-12)
- **Step 7 & Navigation**: 2-3 days (Tasks 13-15)
- **Error Handling & Accessibility**: 2 days (Tasks 16-17)
- **Pending Approval Dashboard**: 1 day (Task 18)
- **Testing & Polish**: 3-4 days (Task 19)

**Total Estimate**: 17-25 days (3.5-5 weeks)

Note: This assumes 1 developer working full-time. Adjust based on team size and availability.

## License

[Your License Here]

## Contributors

[Your Team Here]
