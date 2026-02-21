# Spec Updates - NIN Consent Field

## Summary

Added NDPR (Nigeria Data Protection Regulation) consent checkbox requirement to Step 3: NIN Verification.

## Changes Made

### 1. Requirements Document (requirements.md)

**Updated Requirement 3: NIN Verification**

Added new acceptance criteria:
- **3.2**: WHEN a lawyer attempts to verify NIN, THE System SHALL require the lawyer to check a consent checkbox agreeing to NDPR terms
- **3.3**: WHEN a lawyer attempts to submit without checking the consent checkbox, THE System SHALL display a validation error
- **3.4**: Updated to include consent flag in API call: `POST /api/register/step3/verify-nin` with `{ nin, consent }`
- **3.6**: Updated to display address from NIN database (in addition to photo, name, DOB)

Total acceptance criteria for Requirement 3: **11** (was 9)

### 2. Design Document (design.md)

#### Updated TypeScript Interfaces

**NINVerificationFormData**:
```typescript
interface NINVerificationFormData {
  nin: string;
  consent: boolean; // NEW: NDPR consent checkbox
}
```

#### Updated Zod Validation Schema

**ninVerificationSchema**:
```typescript
const ninVerificationSchema = z.object({
  nin: z.string()
    .length(11, 'NIN must be exactly 11 digits')
    .regex(/^\d{11}$/, 'NIN must contain only numbers'),
  consent: z.boolean()  // NEW
    .refine((val) => val === true, {
      message: 'You must consent to NDPR terms to verify your NIN',
    }),
});
```

#### Updated API Integration

**RegistrationAPI.verifyNIN**:
```typescript
// OLD: verifyNIN(nin: string)
// NEW: verifyNIN(nin: string, consent: boolean)
```

**useVerifyNIN Hook**:
```typescript
function useVerifyNIN() {
  return useMutation({
    mutationFn: ({ nin, consent }: { nin: string; consent: boolean }) => 
      registrationAPI.verifyNIN(nin, consent),
  });
}
```

#### Added New Correctness Property

**Property 6a: NIN consent validation**
- *For any* NIN verification attempt, the validation should pass if and only if the consent checkbox is checked (value is true).
- **Validates: Requirements 3.2, 3.3**

Total properties: **48** (was 47)

### 3. Tasks Document (tasks.md)

**Updated Task 1.1: Write property tests for validation utilities**

Added:
- **Property 6a: NIN consent validation**

Updated validation requirements to include: `3.2, 3.3`

### 4. README Document (README.md)

Updated property counts:
- Total correctness properties: **48** (was 47)
- Form Validation properties: **16** (was 15)
- Added "NIN consent" to the list of form validation properties

## Implementation Impact

### Frontend Changes Required

1. **NIN Verification Form Component** (`Step3Component.tsx`):
   ```tsx
   // Add consent checkbox field
   <Checkbox
     name="consent"
     label="I consent to the verification of my NIN in accordance with NDPR"
     required
   />
   ```

2. **Form Submission**:
   ```typescript
   // OLD:
   const result = await verifyNIN(formData.nin);
   
   // NEW:
   const result = await verifyNIN({ 
     nin: formData.nin, 
     consent: formData.consent 
   });
   ```

3. **Validation**:
   - Add client-side validation for consent checkbox
   - Display error if user tries to submit without consent
   - Disable "Verify NIN" button until consent is checked

### Backend Changes Required

1. **API Endpoint** (`POST /api/register/step3/verify-nin`):
   ```typescript
   // Request body
   interface VerifyNINRequest {
     nin: string;
     consent: boolean; // NEW
   }
   
   // Validation
   if (!consent) {
     return res.status(400).json({
       success: false,
       error: 'Consent is required for NIN verification'
     });
   }
   ```

2. **Database**:
   - Store consent timestamp in `lawyer_registrations` table
   - Add `nin_consent_given_at` field (optional, for audit trail)

### Testing Updates

1. **Property-Based Tests**:
   - Add test for Property 6a (consent validation)
   - Test that verification fails when consent is false
   - Test that verification succeeds when consent is true

2. **Unit Tests**:
   - Test Zod schema validation for consent field
   - Test form submission with/without consent
   - Test error message display

3. **Integration Tests**:
   - Test complete NIN verification flow with consent
   - Test rejection when consent is not given
   - Test API call includes consent parameter

## UI/UX Considerations

### Consent Checkbox Design

**Recommended Implementation**:
```tsx
<div className="bg-blue-50 p-4 border border-blue-200 rounded-lg mb-4">
  <Checkbox
    id="nin-consent"
    name="consent"
    required
  />
  <label htmlFor="nin-consent" className="ml-2 text-sm">
    I consent to the verification of my National Identification Number (NIN) 
    in accordance with the Nigeria Data Protection Regulation (NDPR). 
    I understand that my personal information will be retrieved from the 
    National Identity Management Commission (NIMC) database for verification 
    purposes only.
    <a href="/privacy-policy" className="text-blue-600 underline ml-1" target="_blank">
      Learn more about how we protect your data
    </a>
  </label>
</div>
```

### Error Messages

**When consent is not checked**:
```
"You must consent to NDPR terms to verify your NIN"
```

**When API rejects due to missing consent**:
```
"Consent is required for NIN verification. Please check the consent checkbox and try again."
```

## Compliance Notes

### NDPR Requirements

The Nigeria Data Protection Regulation (NDPR) requires:
1. **Explicit Consent**: Users must actively consent to data processing
2. **Clear Purpose**: Users must understand why their data is being collected
3. **Right to Withdraw**: Users should be able to withdraw consent (handled in profile settings)
4. **Audit Trail**: Record when consent was given (optional but recommended)

### Privacy Policy Updates

Ensure your privacy policy includes:
- How NIN data is collected and used
- Who has access to NIN data (NIMC, your platform, admins)
- How long NIN data is retained
- User rights under NDPR (access, correction, deletion)
- Contact information for data protection officer

## Migration Notes

### For Existing Users

If you have existing users who completed NIN verification before this update:
1. **Option 1**: Grandfather them in (assume consent was given)
2. **Option 2**: Require re-verification with explicit consent
3. **Option 3**: Show a one-time consent dialog on next login

**Recommended**: Option 1 with a notification:
```
"We've updated our NIN verification process to comply with NDPR. 
Your previous verification remains valid. You can review our updated 
privacy policy here."
```

## Checklist

Before implementing:
- [ ] Review NDPR compliance requirements
- [ ] Update privacy policy
- [ ] Design consent checkbox UI
- [ ] Implement frontend validation
- [ ] Update backend API endpoint
- [ ] Add database field for consent timestamp (optional)
- [ ] Write property-based tests
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test complete flow
- [ ] Update user documentation
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

## Questions?

If you have questions about:
- **NDPR compliance**: Consult with legal team
- **Implementation**: Refer to design.md and tasks.md
- **Testing**: See property definitions in design.md
- **UI/UX**: Review the recommended implementation above

---

**Last Updated**: 2024
**Updated By**: Kiro AI Assistant
**Spec Version**: 1.1
