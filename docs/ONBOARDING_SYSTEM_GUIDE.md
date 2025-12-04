# Onboarding System Implementation Guide

## Overview

This document describes the updated onboarding system for Madison Studio, which uses Supabase profiles table for persistent onboarding state tracking.

## Database Schema

### Profiles Table Updates

The following fields have been added to the `profiles` table:

```sql
-- Onboarding tracking fields
current_onboarding_step integer DEFAULT 1
onboarding_status text DEFAULT 'not_started'
has_scanned_website boolean DEFAULT false
has_uploaded_docs boolean DEFAULT false
has_scheduled_call boolean DEFAULT false
```

### Migration

Run the migration file to add these fields:

```bash
# Apply migration to your Supabase project
supabase db push
```

Or manually run the SQL in your Supabase SQL editor:
```sql
-- See: supabase/migrations/add_onboarding_fields_to_profiles.sql
```

## Helper Functions

### Location
`src/lib/onboarding.ts`

### Available Functions

#### `updateOnboardingStep(stepNumber, updates)`

Updates the user's onboarding step and optional profile fields.

**Parameters:**
- `stepNumber` (number): The step number to update to (1-5)
- `updates` (OnboardingUpdate): Optional profile field updates

**Returns:** Updated profile or null if error

**Example:**
```typescript
// After scanning website
await updateOnboardingStep(3, { has_scanned_website: true });

// After uploading docs
await updateOnboardingStep(4, { has_uploaded_docs: true });

// After scheduling call
await updateOnboardingStep(5, {
  has_scheduled_call: true,
  onboarding_status: 'complete'
});
```

#### `getUserProfile()`

Gets the current user's profile with onboarding information.

**Returns:** User profile or null if error

**Example:**
```typescript
const profile = await getUserProfile();
if (profile) {
  console.log('Current step:', profile.current_onboarding_step);
  console.log('Status:', profile.onboarding_status);
}
```

#### `getOnboardingRedirectPath()`

Determines where to redirect the user based on their onboarding status.

**Returns:** Redirect path string or null if no redirect needed

**Example:**
```typescript
const redirectPath = await getOnboardingRedirectPath();
if (redirectPath) {
  navigate(redirectPath);
}
```

#### `checkOnboardingStatus()`

Comprehensive check of user's onboarding status.

**Returns:** Object with:
- `shouldRedirect` (boolean): Whether user needs to be redirected
- `path` (string | null): Where to redirect
- `profile` (any): User's profile data

**Example:**
```typescript
const { shouldRedirect, path, profile } = await checkOnboardingStatus();
if (shouldRedirect && path) {
  navigate(path);
}
```

## Onboarding Guard

### Component: `OnboardingGuard`

**Location:** `src/components/onboarding/OnboardingGuard.tsx`

Wrap protected routes with this component to ensure proper onboarding flow.

**Example:**
```tsx
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard';

function ProtectedRoute() {
  return (
    <OnboardingGuard>
      <YourProtectedContent />
    </OnboardingGuard>
  );
}
```

### Hook: `useOnboardingGuard`

Use this hook in components to manually trigger onboarding redirects.

**Example:**
```tsx
import { useOnboardingGuard } from '@/components/onboarding/OnboardingGuard';

function MyComponent() {
  const { redirectBasedOnOnboarding } = useOnboardingGuard();
  
  useEffect(() => {
    redirectBasedOnOnboarding();
  }, []);
  
  return <div>Content</div>;
}
```

## Onboarding Flow

### Step Mapping

1. **Step 1**: `/onboarding/step1` - Welcome & Brand Basics
2. **Step 2**: `/onboarding/step2` - Brand DNA Scan (optional)
3. **Step 3**: `/onboarding/step3` - Document Upload / Essential 5
4. **Step 4**: `/onboarding/schedule` - Schedule Call (optional)
5. **Step 5**: `/onboarding/finish` - Completion
6. **Complete**: `/dashboard` - User can access dashboard

### Status Values

- `not_started`: User hasn't begun onboarding
- `in_progress`: User is actively onboarding
- `complete`: User has completed onboarding

## Implementation in Onboarding Page

The main onboarding page (`src/pages/Onboarding.tsx`) has been updated to:

1. **Load state from Supabase** on mount
2. **Update database** after each step completion
3. **Maintain localStorage** for form state (backward compatibility)
4. **Persist progress** across sessions

### Key Changes

```tsx
// Load from database
useEffect(() => {
  const loadOnboardingProgress = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setCurrentStep(profile.current_onboarding_step || 1);
    }
  };
  loadOnboardingProgress();
}, [user]);

// Update database on step completion
const handleStepComplete = async (stepData: any) => {
  await updateOnboardingStep(3, {
    has_scanned_website: !!stepData.hasWebsiteScan,
    onboarding_status: 'in_progress',
  });
  setCurrentStep(3);
};

// Mark as complete
const handleComplete = async (destination: string) => {
  await updateOnboardingStep(5, {
    onboarding_status: 'complete',
  });
  navigate(destination);
};
```

## Usage Examples

### Example 1: After Website Scan

```typescript
// In OnboardingWelcome component
const handleWebsiteScan = async () => {
  // ... scan logic ...
  
  // Update step and mark website as scanned
  await updateOnboardingStep(2, { 
    has_scanned_website: true,
    onboarding_status: 'in_progress'
  });
  
  onContinue({ hasWebsiteScan: true });
};
```

### Example 2: After Document Upload

```typescript
// In OnboardingBrandUpload component
const handleUploadComplete = async () => {
  // ... upload logic ...
  
  // Update step and mark docs as uploaded
  await updateOnboardingStep(4, { 
    has_uploaded_docs: true,
    onboarding_status: 'in_progress'
  });
  
  onContinue({ uploadComplete: true });
};
```

### Example 3: After Scheduling Call

```typescript
// In ScheduleCall component
const handleCallScheduled = async () => {
  // ... scheduling logic ...
  
  // Mark onboarding as complete
  await updateOnboardingStep(5, {
    has_scheduled_call: true,
    onboarding_status: 'complete'
  });
  
  navigate('/dashboard');
};
```

## Routing Integration

### React Router (Current Setup)

Since this is a Vite + React Router app, use the `OnboardingGuard` component:

```tsx
// In App.tsx or your router setup
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard';

<Route 
  path="/dashboard" 
  element={
    <OnboardingGuard>
      <Dashboard />
    </OnboardingGuard>
  } 
/>
```

### Manual Redirect in Components

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardingRedirectPath } from '@/lib/onboarding';

function Dashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkOnboarding = async () => {
      const redirectPath = await getOnboardingRedirectPath();
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    };
    checkOnboarding();
  }, [navigate]);
  
  return <div>Dashboard Content</div>;
}
```

## Testing

### Reset Onboarding

To reset a user's onboarding progress:

```typescript
// Option 1: Via URL parameter
// Navigate to: /onboarding?reset=true

// Option 2: Programmatically
await updateOnboardingStep(1, {
  onboarding_status: 'not_started',
  has_scanned_website: false,
  has_uploaded_docs: false,
  has_scheduled_call: false,
});
```

### Check Current State

```typescript
const profile = await getUserProfile();
console.log('Current Step:', profile?.current_onboarding_step);
console.log('Status:', profile?.onboarding_status);
console.log('Scanned Website:', profile?.has_scanned_website);
console.log('Uploaded Docs:', profile?.has_uploaded_docs);
console.log('Scheduled Call:', profile?.has_scheduled_call);
```

## Troubleshooting

### User Stuck in Onboarding Loop

```typescript
// Force complete onboarding
await updateOnboardingStep(5, {
  onboarding_status: 'complete'
});
```

### Profile Not Found

The system will automatically create a profile when a user signs up. If issues persist:

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'user-id-here';

-- Create profile manually if needed
INSERT INTO profiles (id, email, onboarding_status, current_onboarding_step)
VALUES ('user-id', 'user@email.com', 'not_started', 1);
```

### TypeScript Errors

If you see TypeScript errors about missing properties, regenerate types:

```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## Migration from Old System

The new system maintains backward compatibility with localStorage:

1. **Reads from Supabase** as source of truth
2. **Falls back to localStorage** for form state
3. **Writes to both** for transition period

To fully migrate:

1. Run the SQL migration
2. Update TypeScript types
3. Test onboarding flow
4. Monitor for any issues
5. Eventually remove localStorage fallbacks

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test the onboarding flow** with a new user
3. **Update any custom onboarding components** to use `updateOnboardingStep`
4. **Add onboarding guards** to protected routes
5. **Monitor** for any issues in production

## Support

For issues or questions:
- Check the Supabase dashboard for profile data
- Review browser console for errors
- Check network tab for failed API calls
- Verify environment variables are set correctly
