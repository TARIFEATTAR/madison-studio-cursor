# Check Function Status - Step by Step

## The Problem
Console shows CORS error - function can't be reached. This means either:
1. Function wasn't deployed
2. Function was deployed with wrong code
3. Function needs to be redeployed

## Step 1: Verify Function Exists

Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Question: Do you see `get-subscription` in the list?**

- ✅ **YES** → Go to Step 2
- ❌ **NO** → Function wasn't deployed. Go to Step 3

---

## Step 2: Check Function Code

If `get-subscription` exists:

1. **Click on `get-subscription`** in the list
2. **Click "View Source"** or **"Edit"**
3. **Check the code** - does it have:

```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders 
  });
}
```

- ✅ **YES** → Code is correct, but might need redeploy
- ❌ **NO** → Code is wrong, needs to be replaced

---

## Step 3: Redeploy the Function

### Option A: If function exists but code is wrong

1. Click on `get-subscription`
2. Click **"Edit"** or **"View Source"**
3. Replace ALL code with the correct code (see below)
4. Click **"Save"** then **"Deploy"**

### Option B: If function doesn't exist

1. Click **"Deploy a new function"** (green button)
2. Name: `get-subscription`
3. Paste the code below
4. Click **"Deploy"**

---

## Correct Code to Deploy

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

---

## Step 4: After Deployment

1. Wait 10-15 seconds for deployment to complete
2. Go back to billing page: http://localhost:8080/settings
3. **Hard refresh:** Cmd+Shift+R
4. Check console - CORS error should be gone!

---

## Quick Check List

Tell me:
- [ ] Is `get-subscription` visible in Functions list?
- [ ] When was it last deployed?
- [ ] Does the code have the OPTIONS handler with status 204?


















