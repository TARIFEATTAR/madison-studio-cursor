import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retrieve token from Supabase Vault
async function getTokenFromVault(supabase: any, secretId: string): Promise<string> {
  const { data, error } = await supabase
    .from('vault.secrets')
    .select('decrypted_secret')
    .eq('id', secretId)
    .single();
  
  if (error) {
    console.error('Error retrieving vault secret:', error);
    throw new Error('Failed to retrieve token from vault');
  }
  
  if (!data?.decrypted_secret) {
    throw new Error('Token not found in vault');
  }
  
  return data.decrypted_secret;
}

// Store token securely in Supabase Vault
async function storeTokenInVault(supabase: any, tokenValue: string, tokenName: string, userId: string): Promise<string> {
  const secretName = `google_calendar_${tokenName}_${userId}`;
  
  // Update existing secret
  const { data, error } = await supabase
    .from('vault.secrets')
    .update({ 
      secret: tokenValue,
      updated_at: new Date().toISOString()
    })
    .eq('name', secretName)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error updating vault secret:', error);
    throw new Error(`Failed to update ${tokenName} in vault`);
  }
  
  return data.id;
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

    // Get user's Google OAuth vault references
    const { data: vaultRefs, error: vaultError } = await supabaseClient
      .from('google_calendar_vault_refs')
      .select('access_token_secret_id, refresh_token_secret_id, token_expiry')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vaultError || !vaultRefs) {
      throw new Error('Google Calendar not connected. Please connect your Google Calendar first.');
    }

    if (!vaultRefs.access_token_secret_id || !vaultRefs.refresh_token_secret_id) {
      throw new Error('Invalid vault references. Please reconnect your Google Calendar.');
    }

    // Retrieve tokens from vault
    const refreshToken = await getTokenFromVault(supabaseClient, vaultRefs.refresh_token_secret_id);
    
    // Check if access token is expired and refresh if needed
    let accessToken: string;
    const tokenExpiry = new Date(vaultRefs.token_expiry);
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

      // Update new access token in vault
      const newAccessTokenSecretId = await storeTokenInVault(supabaseClient, accessToken, 'access_token', user.id);
      
      await supabaseClient
        .from('google_calendar_vault_refs')
        .update({
          access_token_secret_id: newAccessTokenSecretId,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Retrieve existing access token from vault
      accessToken = await getTokenFromVault(supabaseClient, vaultRefs.access_token_secret_id);
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
      const event: any = {
        summary: eventData.title,
        description: `${eventData.notes || ''}\n\nPlatform: ${eventData.platform || 'N/A'}`,
      };

      // Handle date/time properly for Google Calendar API
      if (eventData.time) {
        // Specific time - use dateTime with timezone
        const startDateTime = `${eventData.date}T${eventData.time}:00`;
        const endDateTime = `${eventData.date}T${addHour(eventData.time)}:00`;
        
        event.start = {
          dateTime: startDateTime,
          timeZone: timezone,
        };
        event.end = {
          dateTime: endDateTime,
          timeZone: timezone,
        };
      } else {
        // All-day event - use date field only
        event.start = {
          date: eventData.date,
        };
        event.end = {
          date: eventData.date,
        };
      }

      console.log('Creating Google Calendar event:', JSON.stringify(event, null, 2));

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
      const event: any = {
        summary: eventData.title,
        description: `${eventData.notes || ''}\n\nPlatform: ${eventData.platform || 'N/A'}`,
      };

      // Handle date/time properly for Google Calendar API
      if (eventData.time) {
        // Specific time - use dateTime with timezone
        const startDateTime = `${eventData.date}T${eventData.time}:00`;
        const endDateTime = `${eventData.date}T${addHour(eventData.time)}:00`;
        
        event.start = {
          dateTime: startDateTime,
          timeZone: timezone,
        };
        event.end = {
          dateTime: endDateTime,
          timeZone: timezone,
        };
      } else {
        // All-day event - use date field only
        event.start = {
          date: eventData.date,
        };
        event.end = {
          date: eventData.date,
        };
      }

      console.log('Updating Google Calendar event:', JSON.stringify(event, null, 2));

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
