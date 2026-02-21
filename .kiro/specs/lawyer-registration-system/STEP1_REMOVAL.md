# Step 1 Removal - Account Creation Consolidation

## Date: February 21, 2026

## Problem
We had duplicate account creation flows:
1. `/auth/register?type=lawyer` - Basic account creation (email, password, phone)
2. `/register/step1` - Duplicate account creation in the 7-step registration

This caused confusion and unnecessary duplication.

## Solution Implemented: Option 1
Removed `/register/step1` and consolidated account creation at `/auth/register`.

### Changes Made

#### 1. Deleted Files ✅
- `src/routes/register/step1.tsx`
- `src/components/registration/AccountCreationForm.tsx`

#### 2. Updated RegisterForm.tsx ✅
**File**: `src/components/auth/RegisterForm.tsx`

**Changes**:
- Updated redirect for lawyers from `/register/step1` to `/register/step2`
- Updated `handleRegistrationComplete()` callback URL

#### 3. Updated Registration Routes ✅
**File**: `src/routes/register/route.tsx`

**Changes**:
- Unauthenticated users redirect to `/auth/register?type=lawyer`
- Error fallback redirects to `/register/step2`

#### 4. Updated Registration Guards ✅
**File**: `src/lib/guards/registration-guards.ts`

**Changes**:
- `STATUS_TO_ROUTE` mapping: `step1` now maps to `/register/step2`
- Rejected users redirect to `/auth/register` instead of `/register/step1`

#### 5. Updated Constants ✅
**File**: `src/constants/registration.ts`

**Changes**:
- `TOTAL_STEPS` changed from 7 to 6
- `REGISTRATION_STEPS` array updated to start at step 2
- Removed `CREATE_ACCOUNT` endpoint from `REGISTRATION_API_ENDPOINTS`

#### 6. Updated All Step Routes ✅
Updated `currentStep` prop in RegistrationLayout:
- `step2.tsx`: currentStep={1} (was 2) - "Step 1 of 6"
- `step3.tsx`: currentStep={2} (was 3) - "Step 2 of 6"
- `step4.tsx`: currentStep={3} (was 4) - "Step 3 of 6"
- `step5.tsx`: currentStep={4} (was 5) - "Step 4 of 6"
- `step6.tsx`: currentStep={5} (was 6) - "Step 5 of 6"
- `step7.tsx`: currentStep={6} (was 7) - "Step 6 of 6"

#### 7. Updated RegistrationSummary ✅
**File**: `src/components/registration/RegistrationSummary.tsx`

**Changes**:
- Removed "Edit" button from Account section
- Updated description to indicate account was created during registration
- Account info is now read-only

#### 8. Updated Registration API ✅
**File**: `src/lib/api/registration.ts`

**Changes**:
- Deprecated `createAccount()` method
- Added error message indicating account creation is at `/auth/register`

#### 9. Updated Pending Approval Route ✅
**File**: `src/routes/pending-approval.tsx`

**Changes**:
- Rejected users redirect to `/auth/register?type=lawyer` instead of `/register/step1`

## New Registration Flow

### For Lawyers:
1. **Account Creation** - `/auth/register?type=lawyer`
   - Email, password, phone number
   - Creates user account
   - Redirects to `/register/step2`

2. **Step 1: Personal Information** - `/register/step2`
   - Name, DOB, gender, state, LGA
   - Shows as "Step 1 of 6"

3. **Step 2: NIN Verification** - `/register/step3`
   - NIN verification with consent
   - Shows as "Step 2 of 6"

4. **Step 3: Professional Information** - `/register/step4`
   - Bar number, education details
   - Shows as "Step 3 of 6"

5. **Step 4: Practice Information** - `/register/step5`
   - Practice type, areas, locations
   - Shows as "Step 4 of 6"

6. **Step 5: Document Upload** - `/register/step6`
   - Certificates and passport photo
   - Shows as "Step 5 of 6"

7. **Step 6: Review & Submit** - `/register/step7`
   - Review all information
   - Submit application
   - Shows as "Step 6 of 6"

### For Clients:
1. **Account Creation** - `/auth/register?type=user`
   - Email, password, phone number
   - Creates user account
   - Redirects to `/dashboard`

## Benefits

1. **No Duplication** - Single account creation flow at `/auth/register`
2. **Cleaner Separation** - Auth routes for account creation, register routes for lawyer-specific info
3. **Better UX** - Users don't see "Step 1 of 7" twice
4. **Consistent** - Both lawyers and clients use the same account creation flow
5. **Simpler** - 6 steps instead of 7 for lawyer registration

## Backend Requirements

The backend needs to understand that:
- Account creation happens at `/auth/register` (existing endpoint)
- Registration status starts at `step1` but maps to `/register/step2` route
- The `/api/register/step1` endpoint is no longer used

## Testing Checklist

- [ ] Test lawyer registration from `/auth/register?type=lawyer`
- [ ] Verify redirect to `/register/step2` after account creation
- [ ] Test all 6 steps show correct progress (1 of 6, 2 of 6, etc.)
- [ ] Test navigation guards prevent skipping steps
- [ ] Test backward navigation works
- [ ] Test rejected users can restart from `/auth/register`
- [ ] Test account section in summary is read-only
- [ ] Test client registration still works (redirects to dashboard)

## Status

✅ **COMPLETE** - All changes implemented and ready for testing
