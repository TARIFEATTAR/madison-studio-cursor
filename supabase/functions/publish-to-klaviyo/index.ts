import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import juice from "https://esm.sh/juice@10.0.1";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
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
      content_title,
      from_email,
      from_name
    } = await req.json();

    if (!organization_id || !subject || !content_html) {
      throw new Error("Missing required fields: organization_id, subject, content_html");
    }

    if (!from_email || !from_name) {
      throw new Error("From email and from name are required");
    }

    // Validate audience_id is provided unless we're updating an existing campaign
    if (!audience_id) {
      throw new Error("Missing audience_id (list, segment, or campaign ID)");
    }

    // Get the encrypted API key
    const { data: connection, error: connectionError } = await supabase
      .from("klaviyo_connections")
      .select("api_key_encrypted")
      .eq("organization_id", organization_id)
      .maybeSingle();

    if (connectionError || !connection) {
      throw new Error("Klaviyo not connected for this organization");
    }

    // Decrypt the API key
    const encryptionKey = Deno.env.get("KLAVIYO_ENCRYPTION_KEY");
    if (!encryptionKey) {
      throw new Error("Encryption key not configured");
    }

    const apiKey = decryptApiKey(connection.api_key_encrypted, encryptionKey);

    // Inline CSS styles for Klaviyo (Klaviyo strips <head> and <style> tags)
    console.log("Inlining CSS styles for Klaviyo compatibility...");
    let inlinedHtml = content_html;
    try {
      inlinedHtml = juice(content_html, {
        preserveMediaQueries: true,
        preserveFontFaces: true,
        preserveKeyFrames: true,
        removeStyleTags: true,
        applyWidthAttributes: true,
        applyHeightAttributes: true,
        applyAttributesTableElements: true,
      });
      console.log("CSS inlining successful");
    } catch (inlineError) {
      console.error("CSS inlining failed, using original HTML:", inlineError);
      // Continue with original HTML if inlining fails
    }

    // Handle two scenarios: 
    // 1. Update existing campaign (audience_type === "campaign")
    // 2. Create new campaign (audience_type === "list" or "segment")
    
    let campaignId: string;
    let messageId: string | undefined;

    if (audience_type === "campaign") {
      // Scenario 1: Update an EXISTING campaign
      campaignId = audience_id;
      console.log(`Updating existing campaign ${campaignId}...`);
      // Fetch existing campaign messages
      const messagesResponse = await fetch(`https://a.klaviyo.com/api/campaigns/${campaignId}/campaign-messages`, {
        method: "GET",
        headers: {
          "Authorization": `Klaviyo-API-Key ${apiKey}`,
          "revision": "2024-07-15",
          "Accept": "application/json",
        },
      });

      if (!messagesResponse.ok) {
        const errorText = await messagesResponse.text();
        console.error("Failed to fetch campaign messages:", errorText);
        throw new Error("Failed to fetch campaign messages");
      }

      const messagesData = await messagesResponse.json();
      messageId = messagesData.data?.[0]?.id as string | undefined;

      if (!messageId) {
        throw new Error("No email message found in the selected campaign");
      }
      
      console.log(`Found message ID: ${messageId} in existing campaign`);
    } else {
      // Scenario 2: Create a NEW campaign for list/segment
      const campaignPayload = {
        data: {
          type: "campaign",
          attributes: {
            name: campaign_name || content_title || subject,
            audiences: {
              included: [audience_id],
              excluded: []
            }
          },
          relationships: {
            "campaign-messages": {
              data: [
                { type: "campaign-message", "temp-id": "msg1", method: "create" }
              ]
            }
          }
        },
        included: [
          {
            type: "campaign-message",
            "temp-id": "msg1",
            attributes: { channel: "email", label: "Email" }
          }
        ]
      };

      console.log("Creating new Klaviyo campaign...");
      const campaignResponse = await fetch("https://a.klaviyo.com/api/campaigns/", {
        method: "POST",
        headers: {
          "Authorization": `Klaviyo-API-Key ${apiKey}`,
          "revision": "2024-07-15",
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
          const firstError = errorJson.errors?.[0];
          errorDetail = firstError?.detail || firstError?.title || errorDetail;
        } catch (e) {
          errorDetail = errorText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      const campaignData = await campaignResponse.json();
      campaignId = campaignData.data.id;
      console.log(`Created new Klaviyo campaign ${campaignId}`);

      // Fetch the campaign message ID (created automatically with the campaign)
      console.log("Fetching new campaign message ID...");
      const newMessagesResponse = await fetch(`https://a.klaviyo.com/api/campaigns/${campaignId}/campaign-messages`, {
        method: "GET",
        headers: {
          "Authorization": `Klaviyo-API-Key ${apiKey}`,
          "revision": "2024-07-15",
          "Accept": "application/json",
        },
      });

      if (!newMessagesResponse.ok) {
        const errorText = await newMessagesResponse.text();
        console.error("Failed to fetch campaign messages:", errorText);
        throw new Error("Failed to fetch campaign messages");
      }

      const newMessagesData = await newMessagesResponse.json();
      messageId = newMessagesData.data?.[0]?.id as string | undefined;

      // If no message exists yet, create one
      if (!messageId) {
        console.log("No campaign message found. Creating one...");
        const createMsgPayload = {
          data: {
            type: "campaign-message",
            attributes: { channel: "email", label: "Email" },
            relationships: {
              campaign: { data: { type: "campaign", id: campaignId } }
            }
          }
        };

        const createMsgRes = await fetch(`https://a.klaviyo.com/api/campaign-messages/`, {
          method: "POST",
          headers: {
            "Authorization": `Klaviyo-API-Key ${apiKey}`,
            "revision": "2024-07-15",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createMsgPayload),
        });

        if (!createMsgRes.ok) {
          const errorText = await createMsgRes.text();
          console.error("Failed to create campaign message:", errorText);
          throw new Error("Failed to create campaign message");
        }

        const created = await createMsgRes.json();
        messageId = created.data?.id as string | undefined;
      }

      if (!messageId) {
        throw new Error("No message found or created for campaign");
      }

      console.log(`Found message ID: ${messageId}`);
    }

    // Update the campaign message with content
    console.log("Updating campaign message with content...");
    const messageUpdatePayload = {
      data: {
        type: "campaign-message",
        id: messageId,
        attributes: {
          content: {
            subject: subject,
            preview_text: preview_text || subject,
            from_email: from_email,
            from_name: from_name,
            html_content: inlinedHtml
          }
        }
      }
    };

    const messageUpdateResponse = await fetch(`https://a.klaviyo.com/api/campaign-messages/${messageId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-07-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageUpdatePayload),
    });

    if (!messageUpdateResponse.ok) {
      const errorText = await messageUpdateResponse.text();
      console.error("Failed to update campaign message:", errorText);
      
      // Parse and extract detailed Klaviyo error
      let errorDetail = "Failed to update campaign message";
      try {
        const errorJson = JSON.parse(errorText);
        const firstError = errorJson.errors?.[0];
        if (firstError) {
          // Check for sender email verification error
          if (firstError.detail?.includes("from_email") || firstError.source?.pointer === "/data/attributes/content/from_email") {
            errorDetail = `Sender email '${from_email}' is not verified in your Klaviyo account. Please verify it in Klaviyo Settings > Email > Sender Profiles.`;
          } else {
            errorDetail = firstError.detail || firstError.title || errorDetail;
          }
        }
      } catch (e) {
        errorDetail = errorText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    console.log("Successfully updated campaign message");

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
