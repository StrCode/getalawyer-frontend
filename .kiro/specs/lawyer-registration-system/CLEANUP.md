# Old Onboarding System Cleanup

This document lists all files and code that need to be removed as part of migrating from the old 2-step onboarding system to the new 7-step lawyer registration system.

## Files to Delete

### Onboarding Route Files
```
src/routes/(protected)/onboarding/index.tsx
src/routes/(protected)/onboarding/(lawyer)/route.tsx
src/routes/(protected)/onboarding/(lawyer)/basics.tsx
src/routes/(protected)/onboarding/(lawyer)/credentials.tsx
src/routes/(protected)/onboarding/(lawyer)/review.tsx
src/routes/(protected)/onboarding/(lawyer)/status.tsx
src/routes/(protected)/onboarding/(lawyer)/lawyer-specializations.tsx
src/routes/(protected)/onboarding/(client)/route.tsx
src/routes/(protected)/onboarding/(client)/client-location.tsx
src/routes/(protected)/onboarding/(client)/client-specializations.tsx
```

### Onboarding Component Files
```
src/components/onboarding/application-status-tracker.tsx
src/components/onboarding/draft-indicator.tsx
src/components/onboarding/draft-manager.tsx
src/components/onboarding/enhanced-specializations.tsx
src/components/onboarding/index.ts
src/components/onboarding/onboarding-header.tsx
src/components/onboarding/onboarding-status-loader.tsx
src/components/onboarding/onboarding-sync-provider.tsx
src/components/onboarding/photo-uploader.tsx
src/components/onboarding/progress-tracker.tsx
src/components/onboarding/specializations.tsx
src/components/onboarding/step-navigator.tsx
```

### Onboarding Store Files
```
src/stores/enhanced-onboarding-store.ts
src/stores/onBoardingClient.ts
src/stores/onBoardingLawyer.ts
```

### Documentation Files
```
docs/onboarding-system.md
NIN_MOCK_MODE_GUIDE.md (if it's specific to old onboarding)
```

## Code Modifications Required

### 1. RegisterForm.tsx
**File**: `src/components/auth/RegisterForm.tsx`

**Remove/Update**:
- Remove references to `/onboarding/client-location` and `/onboarding/basics`
- Update redirect logic to point to new registration routes
- Remove `onboarding_completed: false` from signUp call (will be handled by new system)

**Changes**:
```typescript
// OLD:
const handleRegistrationComplete = (userType: "user" | "lawyer") => {
  if (userType === "user") {
    return "/onboarding/client-location";
  } else {
    return "/onboarding/basics";
  }
};

// NEW:
const handleRegistrationComplete = (userType: "user" | "lawyer") => {
  if (userType === "user") {
    return "/dashboard"; // Or client-specific route
  } else {
    return "/register/step1"; // New 7-step registration
  }
};

// OLD:
const { data, error } = await authClient.signUp.email({
  name: registrationData.name,
  email: registrationData.email,
  password: value.password,
  userType,
  onboarding_completed: false,
});

// NEW:
const { data, error } = await authClient.signUp.email({
  name: registrationData.name,
  email: registrationData.email,
  password: value.password,
  userType,
  // onboarding_completed removed - handled by registration system
});

// OLD navigation:
if (data.user?.role === "user") {
  navigate({ to: "/onboarding/client-location" });
} else {
  navigate({ to: "/onboarding/basics" });
}

// NEW navigation:
if (data.user?.role === "user") {
  navigate({ to: "/dashboard" });
} else {
  navigate({ to: "/register/step1" });
}
```

### 2. session-management.md
**File**: `docs/session-management.md`

**Remove/Update**:
- Remove all references to old onboarding routes
- Remove references to `clearEnhancedOnboardingStore()`
- Remove references to `onboarding-form-draft`, `onboarding-progress` localStorage keys
- Update examples to use new registration routes

**Sections to update**:
- "Registration Flow" section
- "Local Storage Usage" section
- "Logout Cleanup" section

### 3. NIN Verification Service
**File**: `src/services/nin-verification.ts`

**Update**:
- Change API endpoint from `/api/lawyers/onboarding/verify-nin` to `/api/register/step3/verify-nin`

```typescript
// OLD:
const response = await fetch(`${API_URL}/api/lawyers/onboarding/verify-nin`, {

// NEW:
const response = await fetch(`${API_URL}/api/register/step3/verify-nin`, {
```

### 4. Protected Route
**File**: `src/routes/(protected)/route.tsx`

**Update**:
- Remove onboarding completion checks if they redirect to old onboarding routes
- Add registration status checks that redirect to new registration routes

## Database/Backend Changes Required

### Schema Updates
The backend will need to:
1. Add new `lawyer_registrations` table with all 7-step fields
2. Add `registration_status` enum field
3. Migrate existing `onboarding_completed` boolean to new status system
4. Create new API endpoints for registration steps

### API Endpoints to Add
```
POST /api/register/step1
GET  /api/register/step2
POST /api/register/step2
POST /api/register/step3/verify-nin
POST /api/register/step3/confirm
GET  /api/register/step4
POST /api/register/step4
GET  /api/register/step5
POST /api/register/step5
POST /api/register/step6
GET  /api/register/summary
POST /api/register/submit
GET  /api/register/status
```

### API Endpoints to Remove/Deprecate
```
GET  /api/lawyers/onboarding/status
PATCH /api/lawyers/onboarding/practice-info
PATCH /api/lawyers/onboarding/documents
POST /api/lawyers/onboarding/complete
POST /api/lawyers/onboarding/verify-nin
POST /api/lawyers/upload-document
```

## Migration Strategy

### Phase 1: Preparation
1. ✅ Create new spec (DONE)
2. Review and approve spec
3. Create feature branch: `feature/7-step-registration`

### Phase 2: Backend Implementation
1. Create new database tables
2. Implement new API endpoints
3. Add data migration scripts for existing users
4. Test API endpoints

### Phase 3: Frontend Implementation
1. Implement new registration components (follow tasks.md)
2. Keep old onboarding routes temporarily for existing users
3. Add feature flag to switch between old and new systems
4. Test new registration flow end-to-end

### Phase 4: Migration
1. Run data migration for existing users
2. Enable new registration system for new users
3. Gradually migrate existing incomplete registrations
4. Monitor for issues

### Phase 5: Cleanup
1. Remove old onboarding files (this document)
2. Update documentation
3. Remove feature flags
4. Deploy to production

## Verification Checklist

Before deleting old files, verify:
- [ ] New registration system is fully implemented
- [ ] All tests pass
- [ ] Backend API endpoints are deployed
- [ ] Data migration is complete
- [ ] No references to old onboarding routes in codebase
- [ ] Documentation is updated
- [ ] Feature flag is removed
- [ ] Production deployment is successful

## Rollback Plan

If issues arise after cleanup:
1. Revert the cleanup commit
2. Re-enable old onboarding routes
3. Update RegisterForm.tsx to use old routes
4. Investigate and fix issues
5. Retry cleanup when ready

## Notes

- Keep `src/services/nin-verification.ts` but update the API endpoint
- Keep `src/services/photo-upload.ts` as it may be reused in new system
- The new registration system will have its own components in `src/components/registration/`
- The new registration routes will be under `/register/` instead of `/onboarding/`
- Client onboarding may remain simplified or be updated separately
