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
      audience_type = "list",
      audience_id,
      campaign_name,
      subject, 
      preview_text, 
      content_html,
      content_id,
      content_title 
    } = await req.json();

    if (!organization_id || !audience_id || !subject || !content_html) {
      throw new Error("Missing required fields: organization_id, audience_id, subject, content_html");
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

    // Create a DRAFT campaign in Klaviyo (no send_strategy = draft)
    const campaignPayload = {
      data: {
        type: "campaign",
        attributes: {
          name: campaign_name || content_title || subject,
          audiences: {
            included: [audience_id]
          },
          // Omit send_strategy to create a draft campaign
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
      let errorDetail = "Failed to create Klaviyo campaign";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.errors?.[0]?.detail || errorDetail;
      } catch (e) {
        errorDetail = errorText || errorDetail;
      }
      throw new Error(errorDetail);
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
      let errorDetail = "Failed to update campaign content";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.errors?.[0]?.detail || errorDetail;
      } catch (e) {
        errorDetail = errorText || errorDetail;
      }
      throw new Error(errorDetail);
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
          status: "draft",
          metadata: {
            audience_type,
            audience_id,
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
  } catch (error: any) {
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
