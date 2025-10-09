import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM encryption/decryption helpers
async function encryptToken(token: string): Promise<{ encrypted: string; iv: string }> {
  const ENCRYPTION_KEY = Deno.env.get('GOOGLE_TOKEN_ENCRYPTION_KEY');
  if (!ENCRYPTION_KEY) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY not configured');
  }

  const keyData = Uint8Array.from(atob(ENCRYPTION_KEY), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedToken = new TextEncoder().encode(token);
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedToken
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    iv: btoa(String.fromCharCode(...iv))
  };
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

      // Encrypt tokens before storing
      const encryptedAccess = await encryptToken(access_token);
      const encryptedRefresh = await encryptToken(refresh_token);

      // Store encrypted tokens in database (upsert to handle reconnections)
      const { error: dbError } = await supabase
        .from('google_calendar_tokens')
        .upsert({
          user_id: userId,
          access_token: '', // Keep for migration, will be removed later
          refresh_token: '', // Keep for migration, will be removed later
          encrypted_access_token: encryptedAccess.encrypted,
          access_token_iv: encryptedAccess.iv,
          encrypted_refresh_token: encryptedRefresh.encrypted,
          refresh_token_iv: encryptedRefresh.iv,
          token_expiry: tokenExpiry.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to store tokens');
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
