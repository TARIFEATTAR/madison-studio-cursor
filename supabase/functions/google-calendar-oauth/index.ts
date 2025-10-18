import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store tokens securely in Supabase Vault
async function storeTokenInVault(supabase: any, tokenValue: string, tokenName: string, userId: string): Promise<string> {
  console.log(`Attempting to store ${tokenName} in vault for user ${userId}`);
  
  const secretName = `google_calendar_${tokenName}_${userId}`;
  
  try {
    // Insert directly into vault.secrets table - Vault handles encryption automatically
    const { data, error } = await supabase
      .from('vault.secrets')
      .insert({
        secret: tokenValue,
        name: secretName,
        description: `Google Calendar ${tokenName} for user ${userId}`
      })
      .select('id')
      .single();
    
    if (error) {
      // If duplicate key (secret already exists), update instead
      if (error.code === '23505') {
        console.log(`Secret ${secretName} already exists, updating...`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('vault.secrets')
          .update({ 
            secret: tokenValue,
            updated_at: new Date().toISOString()
          })
          .eq('name', secretName)
          .select('id')
          .single();
        
        if (updateError) {
          console.error('Error updating vault secret:', updateError);
          throw new Error(`Failed to update ${tokenName} in vault: ${updateError.message}`);
        }
        
        console.log(`Successfully updated ${tokenName} in vault`);
        return updateData.id;
      }
      
      console.error('Error creating vault secret:', error);
      throw new Error(`Failed to store ${tokenName} in vault: ${error.message}`);
    }
    
    console.log(`Successfully stored ${tokenName} in vault`);
    return data.id;
  } catch (err) {
    console.error(`Failed to store ${tokenName} in vault:`, err);
    throw err;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Step 1: Redirect to Google OAuth consent screen
    if (path === 'auth') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error('Unauthorized');
      }

      // Get app origin from request body
      const body = await req.json();
      const appOrigin = body.app_origin || 'https://the-whispered-codex.lovable.app';

      // Store user ID and app origin in state parameter for callback
      const stateData = {
        user_id: user.id,
        app_origin: appOrigin,
      };
      const state = btoa(JSON.stringify(stateData));
      const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar-oauth/callback`;
      
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      googleAuthUrl.searchParams.set('state', state);

      return new Response(JSON.stringify({ authUrl: googleAuthUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Handle OAuth callback from Google
    if (path === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      // Parse state first to get app_origin (needed for redirects)
      const stateData = state ? JSON.parse(atob(state)) : null;
      const userId = stateData?.user_id;
      const appOrigin = stateData?.app_origin || 'https://the-whispered-codex.lovable.app';

      if (error) {
        console.error('OAuth error:', error);
        return Response.redirect(`${appOrigin}/schedule?error=access_denied`);
      }

      if (!code || !state || !userId) {
        throw new Error('Missing code, state, or user ID parameter');
      }

      const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar-oauth/callback`;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', errorData);
        throw new Error('Failed to exchange authorization code');
      }

      const tokens = await tokenResponse.json();
      const { access_token, refresh_token, expires_in } = tokens;

      if (!refresh_token) {
        throw new Error('No refresh token received. User may need to revoke access and re-authorize.');
      }

      const tokenExpiry = new Date(Date.now() + expires_in * 1000);

      // Store tokens securely in Supabase Vault
      const accessTokenSecretId = await storeTokenInVault(supabase, access_token, 'access_token', userId);
      const refreshTokenSecretId = await storeTokenInVault(supabase, refresh_token, 'refresh_token', userId);

      // Store vault references in database (upsert to handle reconnections)
      const { error: dbError } = await supabase
        .from('google_calendar_vault_refs')
        .upsert({
          user_id: userId,
          access_token_secret_id: accessTokenSecretId,
          refresh_token_secret_id: refreshTokenSecretId,
          token_expiry: tokenExpiry.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to store vault references');
      }

      // Enable sync by default
      await supabase
        .from('google_calendar_sync')
        .upsert({
          user_id: userId,
          sync_enabled: true,
          calendar_id: 'primary',
        }, {
          onConflict: 'user_id'
        });

      console.log('Successfully stored tokens for user:', userId);

      // Redirect back to schedule page with success
      return Response.redirect(`${appOrigin}/schedule?connected=true`);
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('OAuth function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
