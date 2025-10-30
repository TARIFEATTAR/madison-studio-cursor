import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decryptApiKey(encryptedApiKey: string, encryptionKey: string): string {
  const decoded = atob(encryptedApiKey);
  return Array.from(decoded)
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length)))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error("Unauthorized: Missing authorization header");
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
      console.error("Auth error:", userError);
      throw new Error("Unauthorized: Invalid authentication");
    }

    const { organization_id } = await req.json();

    if (!organization_id) {
      throw new Error("Organization ID is required");
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

    const apiKeyRaw = decryptApiKey(connection.api_key_encrypted, encryptionKey);
    const apiKey = apiKeyRaw.trim();
    const masked = apiKey.length > 6 ? `${apiKey.slice(0,3)}***${apiKey.slice(-3)}` : "***";
    console.log(`[fetch-klaviyo-sender-profiles] Decrypted key startsWith pk_:`, apiKey.startsWith("pk_"), `len=`, apiKey.length, `mask=`, masked);

    // Fetch sender profiles from Klaviyo
    const response = await fetch("https://a.klaviyo.com/api/sender-profiles/", {
      method: "GET",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2025-07-15",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Klaviyo API error (sender-profiles)", response.status, errorText);
      throw new Error(`Klaviyo sender-profiles failed (${response.status}): ${errorText}`);
    }

    const profilesData = await response.json();

    const senderProfiles = (profilesData?.data || []).map((p: any) => ({
      id: p.id,
      name: p.attributes?.name,
      email: p.attributes?.email,
      is_verified: p.attributes?.is_verified || false,
      default_from_name: p.attributes?.default_from_name,
      default_reply_to_email: p.attributes?.default_reply_to_email,
    }));

    // Filter to only verified profiles
    const verifiedProfiles = senderProfiles.filter((p: any) => p.is_verified);

    console.log(`Fetched ${verifiedProfiles.length} verified Klaviyo sender profiles for organization ${organization_id}`);

    return new Response(
      JSON.stringify({ sender_profiles: verifiedProfiles }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in fetch-klaviyo-sender-profiles function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
