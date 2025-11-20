# Deploy get-subscription Function Fix

## The Problem
CORS error: "Response to preflight request doesn't pass access control check: It does not have HTTP ok status."

## The Fix
The OPTIONS handler now explicitly returns `status: 200` instead of `status: 204`.

## Deployment Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
   - Or: Your Project → Edge Functions → `get-subscription`

2. **Open the Function:**
   - Click on `get-subscription` function
   - Click the **"Code"** tab

3. **Replace the OPTIONS Handler:**
   - Find lines 15-21 (the OPTIONS handler)
   - Replace with:
   ```typescript
   serve(async (req) => {
     // Handle CORS preflight
     if (req.method === 'OPTIONS') {
       return new Response(null, { 
         status: 200,
         headers: corsHeaders 
       });
     }
   ```

4. **Deploy:**
   - Click **"Deploy"** or **"Save"** button
   - Wait 30-60 seconds for deployment to complete

5. **Verify:**
   - Check the **"Logs"** tab to ensure no errors
   - The function should show as "Active"

### Option 2: Via Supabase CLI (If you have it set up)

```bash
# Make sure you're in the project root
cd "/Users/jordanrichter/Documents/Asala Project/Asala Studio"

# Deploy the function
supabase functions deploy get-subscription
```

## After Deployment

1. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or use Incognito/Private window

2. **Test the Billing Page:**
   - Go to: `http://localhost:8080/settings` (Billing tab)
   - Open browser console (F12)
   - Check for CORS errors

3. **If Still Failing:**
   - Wait 1-2 minutes (deployment can take time)
   - Check function logs in Supabase Dashboard
   - Try the test below

## Test CORS Directly

Run this in browser console:

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
  console.log('OK:', r.ok);
  console.log('Headers:', [...r.headers.entries()]);
  return r.text();
})
.then(text => console.log('Body:', text));
```

**Expected Result:**
- Status: `200`
- OK: `true`
- Body: `""` (empty)

If you get Status 200 and OK: true, CORS is fixed!

## Full Function Code

If you need to replace the entire function, here's the complete code:

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
      status: 200,
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

















