# Welcome Email Trigger Analysis

## Current Welcome Email Triggers

Your welcome email is triggered in **THREE** different places:

---

## 1. ✅ Database Trigger (Supabase)

**Location:** `supabase/migrations/20251203000002_fix_welcome_email_trigger.sql`

**Trigger:** When a user **confirms their email**

**How it works:**
```sql
-- Fires when email_confirmed_at changes from NULL to NOT NULL
if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
  -- Calls send-welcome-email Edge Function
end if;
```

**When this fires:**
- User signs up with email/password
- User clicks confirmation link in email
- Database detects `email_confirmed_at` changed
- Automatically sends welcome email

---

## 2. ✅ Auth Page - New User Detection (Frontend)

**Location:** `src/pages/Auth.tsx` (lines 43-55)

**Trigger:** When a **new user** logs in for the first time

**How it works:**
```typescript
const isNewUser = (Math.abs(created - signedIn) < 30000) || 
                  (Math.abs(confirmed - signedIn) < 30000);

if (isNewUser) {
  // Send welcome email
  await supabase.functions.invoke('send-welcome-email', {
    body: {
      userEmail: user.email,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0],
    },
  });
  
  navigate("/onboarding", { replace: true });
}
```

**When this fires:**
- User signs in within 30 seconds of account creation
- User signs in within 30 seconds of email confirmation
- Covers both auto-confirm and email-confirm scenarios

---

## 3. ✅ Auth Page - Email Verification Callback (Frontend)

**Location:** `src/pages/Auth.tsx` (lines 102-107 and 126-132)

**Trigger:** When user returns from **email verification link**

**How it works:**
```typescript
// After OTP verification
supabase.auth.verifyOtp({ token_hash, type }).then(() => {
  supabase.functions.invoke('send-welcome-email', {
    body: { userEmail: user?.email },
  });
});

// After email confirmation code exchange
supabase.auth.exchangeCodeForSession(code).then(({ data }) => {
  supabase.functions.invoke('send-welcome-email', {
    body: {
      userEmail: data.session.user.email,
      userName: data.session.user.user_metadata?.full_name,
    },
  });
});
```

**When this fires:**
- User clicks magic link or confirmation link
- Returns to app with `token_hash` or `code` in URL
- Frontend detects callback and sends welcome email

---

## ⚠️ Potential Duplicate Email Issue

**Problem:** A user might receive **multiple welcome emails** because:

1. Database trigger fires on email confirmation
2. Frontend callback handler fires on email confirmation
3. Frontend new user detection fires on first login

**Example scenario:**
```
1. User signs up → No email yet
2. User clicks confirmation link → Database trigger fires (Email #1)
3. User returns to app → Frontend callback fires (Email #2)
4. User redirects to onboarding → Frontend new user detection fires (Email #3)
```

---

## 🔄 Onboarding Flow Integration

### Current Behavior

The onboarding flow **DOES NOT** directly trigger the welcome email. Instead:

1. **Welcome email is sent BEFORE onboarding**
   - Triggered during signup/confirmation
   - User receives email
   - User is redirected to `/onboarding`

2. **Onboarding flow is separate**
   - User goes through onboarding steps
   - Progress is tracked in `profiles` table
   - No additional emails are sent during onboarding

### Flow Diagram

```
User Signs Up
    ↓
Email Confirmation (if required)
    ↓
Welcome Email Sent ← (Triggered here)
    ↓
Redirect to /onboarding
    ↓
User completes onboarding steps
    ↓
Progress saved to profiles table
    ↓
User reaches dashboard
```

---

## 🎯 Recommended Changes

### Option 1: Single Source of Truth (Database Trigger Only)

**Remove frontend triggers** and rely only on the database trigger:

```typescript
// In Auth.tsx, REMOVE these calls:

// Line 47-52 - Remove this block
await supabase.functions.invoke('send-welcome-email', { ... });

// Line 103-107 - Remove this block
supabase.functions.invoke('send-welcome-email', { ... });

// Line 127-132 - Remove this block
supabase.functions.invoke('send-welcome-email', { ... });
```

**Pros:**
- ✅ No duplicate emails
- ✅ Single source of truth
- ✅ Works for all signup methods
- ✅ Automatic and reliable

**Cons:**
- ❌ Only fires on email confirmation (won't work for auto-confirm)

---

### Option 2: Add Deduplication Flag

**Add a flag to profiles table** to track if welcome email was sent:

```sql
-- Add to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamp;
```

**Update welcome email function** to check flag:

```typescript
// In send-welcome-email Edge Function
const { data: profile } = await supabase
  .from('profiles')
  .select('welcome_email_sent')
  .eq('id', userId)
  .single();

if (profile?.welcome_email_sent) {
  console.log('Welcome email already sent, skipping');
  return;
}

// Send email...

// Mark as sent
await supabase
  .from('profiles')
  .update({ 
    welcome_email_sent: true,
    welcome_email_sent_at: new Date().toISOString()
  })
  .eq('id', userId);
```

**Pros:**
- ✅ Prevents duplicates
- ✅ Works with all triggers
- ✅ Trackable in database

**Cons:**
- ❌ Requires migration
- ❌ More complex

---

### Option 3: Trigger During Onboarding Completion

**Move welcome email to onboarding completion:**

```typescript
// In Onboarding.tsx handleComplete
const handleComplete = async (destination: string) => {
  if (!user) return;
  
  // Mark onboarding as complete
  await updateOnboardingStep(5, {
    onboarding_status: 'complete',
  });
  
  // Send welcome email AFTER onboarding
  await supabase.functions.invoke('send-welcome-email', {
    body: {
      userEmail: user.email,
      userName: user.user_metadata?.full_name,
    },
  });
  
  navigate(destination);
};
```

**Pros:**
- ✅ Email sent after user engagement
- ✅ Single trigger point
- ✅ User has completed onboarding

**Cons:**
- ❌ User doesn't get immediate welcome
- ❌ Might not complete onboarding

---

## 📊 Current State Summary

| Trigger Location | When It Fires | Likelihood of Duplicate |
|-----------------|---------------|------------------------|
| Database (SQL) | Email confirmation | High (with frontend) |
| Frontend (redirectAfterLogin) | First login | High (with database) |
| Frontend (verifyOtp callback) | Magic link return | High (with database) |
| Frontend (exchangeCode callback) | Email confirm return | High (with database) |

---

## ✅ My Recommendation

**Use Option 2: Add Deduplication Flag**

This is the safest approach because:
1. Keeps all existing triggers (no breaking changes)
2. Prevents duplicate emails automatically
3. Provides audit trail of when email was sent
4. Works with all signup methods (Google, email, magic link)

---

## 🚀 Implementation Steps

If you want to add deduplication:

1. **Add migration:**
```sql
-- File: supabase/migrations/add_welcome_email_tracking.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamp;
```

2. **Update TypeScript types:**
```typescript
// In src/integrations/supabase/types.ts
profiles: {
  Row: {
    // ... existing fields
    welcome_email_sent: boolean | null
    welcome_email_sent_at: string | null
  }
}
```

3. **Update send-welcome-email function:**
```typescript
// Add deduplication check at the start
// Add flag update after sending
```

Would you like me to implement the deduplication solution?
