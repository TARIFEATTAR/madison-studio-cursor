import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM decryption helper
async function decryptToken(encryptedToken: string, ivString: string): Promise<string> {
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
    ['decrypt']
  );

  const iv = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

// AES-256-GCM encryption helper
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

interface SyncRequest {
  operation: 'create' | 'update' | 'delete';
  scheduledContentId: string;
  eventData?: {
    title: string;
    date: string;
    time?: string;
    notes?: string;
    platform?: string;
  };
  googleEventId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { operation, scheduledContentId, eventData, googleEventId }: SyncRequest = await req.json();

    console.log('Sync operation:', operation, 'for user:', user.id);

    // Get user's Google OAuth tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('google_calendar_tokens')
      .select('encrypted_access_token, access_token_iv, encrypted_refresh_token, refresh_token_iv, token_expiry')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar not connected. Please connect your Google Calendar first.');
    }

    if (!tokenData.encrypted_access_token || !tokenData.access_token_iv || 
        !tokenData.encrypted_refresh_token || !tokenData.refresh_token_iv) {
      throw new Error('Invalid token data. Please reconnect your Google Calendar.');
    }

    // Decrypt tokens
    const refreshToken = await decryptToken(tokenData.encrypted_refresh_token, tokenData.refresh_token_iv);
    
    // Check if access token is expired and refresh if needed
    let accessToken: string;
    const tokenExpiry = new Date(tokenData.token_expiry);
    const now = new Date();

    if (now >= tokenExpiry) {
      console.log('Access token expired, refreshing...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Encrypt and update new access token in database
      const encryptedAccess = await encryptToken(accessToken);
      await supabaseClient
        .from('google_calendar_tokens')
        .update({
          encrypted_access_token: encryptedAccess.encrypted,
          access_token_iv: encryptedAccess.iv,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Decrypt existing access token
      accessToken = await decryptToken(tokenData.encrypted_access_token, tokenData.access_token_iv);
    }

    // Get calendar ID and timezone from settings
    const { data: syncSettings } = await supabaseClient
      .from('google_calendar_sync')
      .select('calendar_id, sync_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!syncSettings?.sync_enabled) {
      throw new Error('Google Calendar sync is disabled');
    }

    const { data: calendarSettings } = await supabaseClient
      .from('calendar_settings')
      .select('timezone')
      .eq('user_id', user.id)
      .maybeSingle();

    const calendarId = syncSettings.calendar_id || 'primary';
    const timezone = calendarSettings?.timezone || 'America/Los_Angeles';

    let result: any = {};

    if (operation === 'create' && eventData) {
      // Create Google Calendar event
      const startDateTime = eventData.time 
        ? `${eventData.date}T${eventData.time}:00`
        : `${eventData.date}T09:00:00`;
      
      const endDateTime = eventData.time
        ? `${eventData.date}T${addHour(eventData.time)}:00`
        : `${eventData.date}T10:00:00`;

      const event = {
        summary: eventData.title,
        description: `${eventData.notes || ''}\n\nPlatform: ${eventData.platform || 'N/A'}`,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
      };

      const createResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error('Google Calendar API error:', error);
        throw new Error('Failed to create Google Calendar event');
      }

      result = await createResponse.json();

      // Update scheduled_content with google_event_id and sync_status
      await supabaseClient
        .from('scheduled_content')
        .update({
          google_event_id: result.id,
          sync_status: 'synced',
        })
        .eq('id', scheduledContentId);

    } else if (operation === 'update' && eventData && googleEventId) {
      // Update Google Calendar event
      const startDateTime = eventData.time 
        ? `${eventData.date}T${eventData.time}:00`
        : `${eventData.date}T09:00:00`;
      
      const endDateTime = eventData.time
        ? `${eventData.date}T${addHour(eventData.time)}:00`
        : `${eventData.date}T10:00:00`;

      const event = {
        summary: eventData.title,
        description: `${eventData.notes || ''}\n\nPlatform: ${eventData.platform || 'N/A'}`,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
      };

      const updateResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        console.error('Google Calendar API error:', error);
        throw new Error('Failed to update Google Calendar event');
      }

      result = await updateResponse.json();

      // Update sync_status
      await supabaseClient
        .from('scheduled_content')
        .update({ sync_status: 'synced' })
        .eq('id', scheduledContentId);

    } else if (operation === 'delete' && googleEventId) {
      // Delete Google Calendar event
      const deleteResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        const error = await deleteResponse.text();
        console.error('Google Calendar API error:', error);
        throw new Error('Failed to delete Google Calendar event');
      }

      result = { deleted: true };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-to-google-calendar:', error);
    
    // Update sync_status to failed if scheduledContentId is available
    if (error.scheduledContentId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient
          .from('scheduled_content')
          .update({ sync_status: 'failed' })
          .eq('id', error.scheduledContentId);
      } catch (updateError) {
        console.error('Failed to update sync_status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to add one hour to a time string
function addHour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
