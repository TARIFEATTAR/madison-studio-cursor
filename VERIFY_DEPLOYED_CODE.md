# Verify Deployed Function Code

## The function is deployed! ✅

`get-subscription` shows:
- Created: 05 Nov, 2025 22:43
- Last Updated: 9 minutes ago
- Deployments: 1

## But CORS error persists - need to verify code

The function might have been deployed with template code instead of the correct code.

## Step 1: Check the Deployed Code

1. **Click on `get-subscription`** in the functions list
2. **Click "View Source"** or **"Edit"** button
3. **Look for this code** (should be at the top):

```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders 
  });
}
```

**Does it have this?**
- ✅ **YES** → Code is correct, might be caching issue
- ❌ **NO** → Code is wrong, needs to be replaced

---

## Step 2: If Code is Wrong

1. **Click "Edit"** on the function
2. **Select ALL** the code (Cmd+A / Ctrl+A)
3. **Delete it**
4. **Paste the correct code** (see below)
5. **Click "Save"** then **"Deploy"**

---

## Correct Code (Copy this entire block)

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

## Step 3: After Updating Code

1. **Wait 15-20 seconds** for deployment to complete
2. **Go to billing page:** http://localhost:8080/settings
3. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. **Clear browser cache** if needed:
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"
5. **Check console** - CORS error should be gone!

---

## Quick Check

**Click on `get-subscription` → View Source**

**Does the first line say:**
```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
```

**OR does it say something like:**
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
```

- If it says `xhr@0.1.0` → Code is correct ✅
- If it says `functions-js` → Code is wrong, needs replacement ❌
















