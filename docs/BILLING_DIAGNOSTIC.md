# Billing Page Diagnostic & Fix Guide

## Current Issues
1. **CORS Error**: Preflight request not returning HTTP OK status
2. **404 Error**: `subscription_plans` table query failing

## Step 1: Verify Function Deployment

The function code looks correct, but we need to ensure it's actually deployed.

### In Supabase Dashboard:
1. Go to **Edge Functions** → **get-subscription**
2. Click **"Code"** tab
3. Verify the code has:
   - Line 1: `import "https://deno.land/x/xhr@0.1.0/mod.ts";`
   - Lines 15-21: The OPTIONS handler with `status: 204`

### If the code is different:
1. Click **"Edit"** or **"Deploy"**
2. Replace the entire code with the correct version (see below)
3. Click **"Deploy"** or **"Save"**

## Step 2: Verify subscription_plans Table

Run this SQL in Supabase SQL Editor to verify the table exists:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_plans'
);

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'subscription_plans';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'subscription_plans';

-- Check if plans exist
SELECT id, name, slug, is_active, sort_order 
FROM subscription_plans 
ORDER BY sort_order;
```

## Step 3: Test CORS Directly

Open browser console and run:

```javascript
fetch('https://likkskifwsrvszxdvufw.supabase.co/functions/v1/get-subscription', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization',
    'Origin': 'http://localhost:8080'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', [...r.headers.entries()]);
  return r.text();
})
.then(text => console.log('Body:', text));
```

Expected: Status 204, no body

## Step 4: If CORS Still Fails

The function might need to be redeployed. Try:

1. **Redeploy via Dashboard:**
   - Go to Edge Functions → get-subscription
   - Click "Deploy" or "Redeploy"
   - Wait 30 seconds

2. **Clear Browser Cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or use Incognito window

3. **Check Function Logs:**
   - Go to Edge Functions → get-subscription → Logs
   - Look for any errors

## Step 5: If subscription_plans 404 Persists

Run this SQL to ensure the table and RLS are correct:

```sql
-- Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER,
  features JSONB DEFAULT '{}'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy (idempotent)
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Verify plans exist
SELECT COUNT(*) as plan_count FROM subscription_plans WHERE is_active = true;
```

## Correct get-subscription Function Code

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get organization for user
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If no organization, return empty data (not an error - user may not have completed onboarding)
    if (!orgMember) {
      return new Response(
        JSON.stringify({
          subscription: null,
          paymentMethods: [],
          invoices: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const organizationId = orgMember.organization_id;

    // Get subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          slug,
          description,
          price_monthly,
          price_yearly,
          features
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get payment methods
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(
      JSON.stringify({
        subscription: subscription || null,
        paymentMethods: paymentMethods || [],
        invoices: invoices || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

















