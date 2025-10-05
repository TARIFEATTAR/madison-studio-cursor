import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      .select('access_token, refresh_token, token_expiry')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar not connected. Please connect your Google Calendar first.');
    }

    // Check if access token is expired and refresh if needed
    let accessToken = tokenData.access_token;
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
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update tokens in database
      await supabaseClient
        .from('google_calendar_tokens')
        .update({
          access_token: accessToken,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Get calendar ID from sync settings
    const { data: syncSettings } = await supabaseClient
      .from('google_calendar_sync')
      .select('calendar_id, sync_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!syncSettings?.sync_enabled) {
      throw new Error('Google Calendar sync is disabled');
    }

    const calendarId = syncSettings.calendar_id || 'primary';

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
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'UTC',
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
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'UTC',
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
