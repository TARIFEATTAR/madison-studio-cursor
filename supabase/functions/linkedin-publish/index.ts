/**
 * LinkedIn Publish - Post content to LinkedIn
 * 
 * This edge function publishes content to a user's LinkedIn profile or company page.
 * Supports text posts and posts with images.
 * 
 * LinkedIn Share API Documentation:
 * https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Decrypt token (simple base64 for now)
function decryptToken(encrypted: string): string {
  if (encrypted.startsWith("enc:")) {
    return atob(encrypted.slice(4));
  }
  return encrypted;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { 
      organizationId, 
      text,
      imageUrl,
      contentId,
      contentTable,
      visibility = "PUBLIC" // PUBLIC, CONNECTIONS
    } = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "organizationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Post text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LinkedIn has a 3000 character limit for posts
    if (text.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Post text exceeds LinkedIn's 3000 character limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get LinkedIn connection for this organization
    const { data: connection, error: connectionError } = await supabase
      .from("linkedin_connections")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .single();

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ 
          error: "LinkedIn not connected", 
          message: "Please connect your LinkedIn account in Settings → Integrations"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(connection.token_expiry) < new Date()) {
      // TODO: Implement token refresh using refresh_token
      return new Response(
        JSON.stringify({ 
          error: "LinkedIn token expired", 
          message: "Please reconnect your LinkedIn account in Settings → Integrations"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt access token
    const accessToken = decryptToken(connection.encrypted_access_token);

    // Determine the author URN (person or organization)
    let authorUrn: string;
    if (connection.connection_type === "organization" && connection.linkedin_org_id) {
      authorUrn = `urn:li:organization:${connection.linkedin_org_id}`;
    } else {
      authorUrn = `urn:li:person:${connection.linkedin_user_id}`;
    }

    // Build the post payload
    // Using the Posts API (v2)
    const postPayload: any = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility
      }
    };

    // If there's an image, we need to upload it first
    // For now, we'll support text-only posts
    // TODO: Add image upload support using LinkedIn's image upload API

    console.log(`[linkedin-publish] Publishing to ${authorUrn}, text length: ${text.length}`);

    // Post to LinkedIn using UGC Post API
    const postResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postPayload),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error("[linkedin-publish] LinkedIn API error:", postResponse.status, errorText);
      
      // Parse error for user-friendly message
      let errorMessage = "Failed to publish to LinkedIn";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        if (errorText.includes("DUPLICATE")) {
          errorMessage = "This content was recently posted. LinkedIn prevents duplicate posts.";
        }
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }),
        { status: postResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const postResult = await postResponse.json();
    const postId = postResult.id;
    const postUrn = postId; // UGC post URN

    // Extract the activity/share ID for the URL
    // Format: urn:li:ugcPost:123456789 or urn:li:share:123456789
    const activityId = postUrn?.split(":").pop();
    
    // Build post URL
    let postUrl = "";
    if (connection.connection_type === "organization" && connection.linkedin_org_vanity_name) {
      postUrl = `https://www.linkedin.com/company/${connection.linkedin_org_vanity_name}/posts/`;
    } else {
      postUrl = `https://www.linkedin.com/feed/update/${postUrn}/`;
    }

    // Record the post in our database
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: recordError } = await adminSupabase
      .from("linkedin_posts")
      .insert({
        linkedin_connection_id: connection.id,
        organization_id: organizationId,
        content_id: contentId || null,
        content_table: contentTable || null,
        linkedin_post_id: activityId,
        linkedin_post_urn: postUrn,
        post_url: postUrl,
        post_text: text,
        status: "published",
        published_at: new Date().toISOString(),
      });

    if (recordError) {
      console.error("[linkedin-publish] Failed to record post:", recordError);
      // Don't fail - the post was successful
    }

    // Update last_post_at on connection
    await adminSupabase
      .from("linkedin_connections")
      .update({ last_post_at: new Date().toISOString() })
      .eq("id", connection.id);

    console.log(`[linkedin-publish] Successfully published post ${postUrn}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        postId: activityId,
        postUrn: postUrn,
        postUrl: postUrl,
        message: `Successfully posted to LinkedIn ${connection.linkedin_org_name || connection.linkedin_user_name}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[linkedin-publish] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});






