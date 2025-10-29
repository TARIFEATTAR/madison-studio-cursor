import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decryptApiKey(encryptedApiKey: string, encryptionKey: string): string {
  const decoded = atob(encryptedApiKey);
  return Array.from(decoded).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length))
  ).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { 
      organization_id, 
      list_id, 
      subject, 
      preview_text, 
      content_html,
      content_id,
      content_title 
    } = await req.json();

    if (!organization_id || !list_id || !subject || !content_html) {
      throw new Error("Missing required fields");
    }

    // Get the encrypted API key
    const { data: connection, error: connectionError } = await supabase
      .from("klaviyo_connections")
      .select("api_key_encrypted")
      .eq("organization_id", organization_id)
      .single();

    if (connectionError || !connection) {
      throw new Error("Klaviyo not connected for this organization");
    }

    // Decrypt the API key
    const encryptionKey = Deno.env.get("KLAVIYO_ENCRYPTION_KEY");
    if (!encryptionKey) {
      throw new Error("Encryption key not configured");
    }

    const apiKey = decryptApiKey(connection.api_key_encrypted, encryptionKey);

    // Create a campaign in Klaviyo
    const campaignPayload = {
      data: {
        type: "campaign",
        attributes: {
          name: content_title || subject,
          audiences: {
            included: [list_id]
          },
          send_strategy: {
            method: "static",
            options_static: {
              datetime: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
              is_local: false,
              send_past_recipients_immediately: false
            }
          },
          campaign_messages: {
            data: [{
              type: "campaign-message",
              attributes: {
                channel: "email",
                label: "Email 1",
                content: {
                  subject: subject,
                  preview_text: preview_text || subject,
                  from_email: "noreply@example.com", // This should be configured per org
                  from_label: "Madison",
                  reply_to_email: "noreply@example.com"
                }
              }
            }]
          }
        }
      }
    };

    const campaignResponse = await fetch("https://a.klaviyo.com/api/campaigns/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-10-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaignPayload),
    });

    if (!campaignResponse.ok) {
      const errorText = await campaignResponse.text();
      console.error("Klaviyo campaign creation error:", errorText);
      throw new Error("Failed to create Klaviyo campaign");
    }

    const campaignData = await campaignResponse.json();
    const campaignId = campaignData.data.id;
    const messageId = campaignData.data.attributes.campaign_messages.data[0].id;

    console.log(`Created Klaviyo campaign ${campaignId} with message ${messageId}`);

    // Update the campaign message with the HTML content
    const updatePayload = {
      data: {
        type: "campaign-message",
        id: messageId,
        attributes: {
          content: {
            subject: subject,
            preview_text: preview_text || subject,
            from_email: "noreply@example.com",
            from_label: "Madison",
            reply_to_email: "noreply@example.com",
            html_content: content_html
          }
        }
      }
    };

    const updateResponse = await fetch(`https://a.klaviyo.com/api/campaign-messages/${messageId}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-10-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Klaviyo message update error:", errorText);
      throw new Error("Failed to update campaign content");
    }

    // Log to publishing history
    if (content_id) {
      await supabase
        .from("publishing_history")
        .insert({
          content_id,
          content_type: "master_content",
          platform: "klaviyo",
          external_id: campaignId,
          external_url: `https://www.klaviyo.com/campaign/${campaignId}`,
          published_by: user.id,
          organization_id,
          status: "scheduled",
          metadata: {
            list_id,
            message_id: messageId,
            subject,
            preview_text
          }
        });
    }

    console.log(`Successfully published to Klaviyo campaign ${campaignId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        campaign_id: campaignId,
        message_id: messageId,
        campaign_url: `https://www.klaviyo.com/campaign/${campaignId}`,
        message: "Content published to Klaviyo successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in publish-to-klaviyo function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
