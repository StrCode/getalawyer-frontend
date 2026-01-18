# NIN Verification Mock Mode Guide

## Overview
The NIN verification feature now includes a mock mode that simulates backend responses without requiring the actual backend service to be running. This allows you to test and visualize the complete NIN verification flow.

## How to Enable Mock Mode

### Option 1: Environment Variable
Set `VITE_USE_MOCK_NIN=true` in your `.env` file:

```env
VITE_USE_MOCK_NIN=true
```

### Option 2: Automatic Detection
Mock mode automatically activates when:
- The `VITE_API_URL` does not contain `localhost` (i.e., when using production URLs)
- This ensures mock mode is used when the backend is not available locally

## Test NINs

### Valid NINs (Will Pass Verification)
These NINs will simulate successful verification:

| NIN | Name | DOB | Gender |
|-----|------|-----|--------|
| `12345678901` | Chioma Okafor | 1990-05-15 | Female |
| `98765432101` | Emeka Nwosu | 1988-03-22 | Male |
| `55555555555` | Aisha Mohammed | 1992-07-10 | Female |

**Expected Result:** ✅ Green success message with verified details

### Invalid NINs (Will Fail Verification)
These NINs will simulate failed verification:

| NIN |
|-----|
| `11111111111` |
| `22222222222` |
| `33333333333` |

**Expected Result:** ❌ Red error message indicating NIN not found

## Testing the Flow

### Step 1: Navigate to Credentials Page
1. Go through the onboarding flow to reach the "Verify Your Credentials" page
2. You should see a yellow banner indicating "🧪 MOCK MODE - Backend not available"

### Step 2: Test Valid NIN
1. Enter one of the valid test NINs (e.g., `12345678901`)
2. Click "Verify NIN"
3. Wait ~1.5 seconds for the simulated network delay
4. You should see:
   - ✅ Green success box with verified details
   - Toast notification: "NIN Verified Successfully"
   - The button changes to "Verified"
   - The NIN input becomes disabled

### Step 3: Test Invalid NIN
1. Clear the NIN field or click "Replace" if needed
2. Enter an invalid test NIN (e.g., `11111111111`)
3. Click "Verify NIN"
4. Wait ~1.5 seconds
5. You should see:
   - ❌ Red error message
   - Toast notification: "Verification Failed"
   - The button remains clickable for retry

### Step 4: Complete the Form
1. Fill in the Bar Number
2. Upload a photograph
3. Click "Submit Application"

## Visual Feedback

### Loading State
- Spinner animation appears
- Message: "Verifying your NIN with the national database..."
- Button shows "Verifying..."

### Success State
- Green box with checkmark icon
- Shows: Full Name, Date of Birth, Gender
- Button changes to "Verified" and becomes disabled
- NIN input field becomes disabled

### Error State
- Red error message displayed
- Shows reason for failure
- Button remains clickable for retry
- User can modify NIN and try again

## Implementation Details

### Files Modified
- `src/services/nin-verification.ts` - Added mock mode logic
- `src/routes/onboarding/lawyer/credentials.tsx` - Added mock mode UI notice
- `.env` - Added `VITE_USE_MOCK_NIN` variable

### Mock Mode Features
- Simulates 1.5-second network delay for realistic UX
- Returns appropriate success/error responses
- Maintains all validation logic
- Shows test NIN list in UI when mock mode is active
- Clearly labeled as "[MOCK]" in responses

## Switching to Real Backend

When your backend service is ready:

1. Set `VITE_USE_MOCK_NIN=false` in `.env`
2. Ensure `VITE_API_URL` points to your backend
3. The service will automatically use real API calls
4. The mock mode banner will disappear from the UI

## Troubleshooting

### Mock Mode Banner Not Showing
- Check that `VITE_USE_MOCK_NIN=true` is set in `.env`
- Restart the development server after changing `.env`
- Verify `import.meta.env.VITE_USE_MOCK_NIN` is accessible

### NIN Not Verifying
- Ensure you're using exactly 11 digits
- Check that the NIN is in the valid test list
- Look for error messages in the browser console

### Still Calling Real Backend
- Verify `VITE_USE_MOCK_NIN=true` is set
- Check that `VITE_API_URL` doesn't contain `localhost`
- Restart the dev server
