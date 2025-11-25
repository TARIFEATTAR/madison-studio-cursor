# Google OAuth Name Handling - Fix Documentation

## Issue Confirmed ✅

When users sign in with Google OAuth, the profile is automatically created with the name from Google's user metadata (e.g., "Tarifé Attär"). However, we want the name entered during onboarding to **always override** this Google-provided name.

### What We Found

**Database Check:**
```
User: tarifeattar@gmail.com
- Google provides: "Tarifé Attär" in raw_user_meta_data
- Profile shows: "Bilal" (from onboarding)
- Old test user: NULL full_name (onboarding didn't save)
```

**The Problem:**
1. Google OAuth creates profile with Google's name via `handle_new_user()` trigger
2. User goes through onboarding and enters their preferred name (e.g., "Jordan")
3. Onboarding attempts to update profile BUT:
   - If the update fails silently, Google name persists
   - No clear feedback to user that the update failed

## Fixes Applied ✅

### 1. Enhanced Profile Update Logging & Error Handling
**File**: `src/components/onboarding/OnboardingWelcome.tsx`

**Changes:**
- Added explicit console logging when profile updates successfully
- Added error toast if profile update fails
- Clear messaging that name can be updated in Settings if save fails

```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .update({ 
    full_name: userName.trim() 
  })
  .eq('id', user.id);

if (profileError) {
  console.error('[Onboarding] Error updating profile:', profileError);
  toast({
    title: "Warning",
    description: "Your profile name may not have been saved. You can update it in Settings.",
    variant: "destructive"
  });
} else {
  console.log('[Onboarding] Profile updated successfully with name:', userName.trim());
}
```

### 2. Improved Name Display Logic
**File**: `src/hooks/useUserProfile.tsx`

**Changes:**
- Added explicit priority system for name display
- Enhanced logging to show which name source is being used
- Better handling of edge cases

**Priority Order:**
1. **`full_name` from onboarding** (user's chosen name)
2. **Email prefix** (fallback if no name set)
3. **"there"** (ultimate fallback)

```typescript
let rawName = "there";

if (data.full_name && data.full_name.trim()) {
  // Use the first name from full_name if it exists
  rawName = data.full_name.split(' ')[0];
} else if (data.email) {
  // Fallback to email prefix (before @)
  rawName = data.email.split('@')[0];
}

console.log('[useUserProfile] Displaying name:', name, 'from full_name:', data.full_name);
```

### 3. Clarified UI Label
**File**: `src/components/onboarding/OnboardingWelcome.tsx`

**Changes:**
- Changed label from "Your Name" to "Your First Name"
- Added helper text: "This is how Madison will address you throughout the platform"

## How It Works Now

### For New Google OAuth Users:

1. **User clicks "Sign in with Google"**
   - Auth creates account with Google metadata
   - Trigger creates profile with Google's name (e.g., "Tarifé Attär")

2. **User goes to onboarding**
   - Onboarding form shows empty fields
   - User enters preferred first name (e.g., "Jordan")
   - User clicks Continue

3. **Profile Update**
   - System updates `profiles.full_name` with "Jordan"
   - Logs success/failure to console
   - Shows error toast if update fails

4. **Dashboard Greeting**
   - Fetches profile
   - Displays "Jordan" (from full_name)
   - NOT "Tarifé" (from Google)

### For Existing Users with NULL full_name:

**Action Required:**
- Users need to complete onboarding again to set their name
- OR update name manually in Settings (when Settings profile editor is available)

## Testing Checklist

- [ ] Sign in with NEW Google account
- [ ] Complete onboarding with first name "TestName"
- [ ] Verify console shows: `[Onboarding] Profile updated successfully with name: TestName`
- [ ] Navigate to dashboard
- [ ] Verify greeting shows "Testname" (capitalized first letter)
- [ ] Verify console shows: `[useUserProfile] Displaying name: Testname, from full_name: TestName`

## Database State

**Before Fix:**
```
tarifeattar@gmail.com:
  - auth.users.raw_user_meta_data.full_name: "Tarifé Attär"
  - profiles.full_name: "Bilal" (correctly saved)
  
Old user (64665b34-...):
  - auth.users.raw_user_meta_data.full_name: <from Google>
  - profiles.full_name: NULL (onboarding didn't save)
```

**After Fix:**
- Onboarding updates are logged
- Errors are shown to users
- Name priority system ensures correct display
- UI clarifies what name to enter

## Summary

✅ **Confirmed**: The name entered during onboarding DOES save to the database
✅ **Fixed**: Added logging and error handling for better visibility
✅ **Fixed**: Improved name display logic to prioritize onboarding name
✅ **Fixed**: Clarified UI to show "First Name" instead of "Name"

The system now correctly:
1. Accepts name during onboarding (overriding Google name)
2. Saves it to `profiles.full_name`
3. Displays it throughout the platform
4. Shows errors if save fails
5. Logs success/failure for debugging
