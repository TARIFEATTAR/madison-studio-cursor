/**
 * Remove Background Edge Function
 * 
 * Uses fal.ai's RMBG (Remove Background) model for high-quality
 * background removal from product and lifestyle images.
 * 
 * Supports:
 * - URL-based images
 * - Base64-encoded images
 * - Automatic transparent PNG output
 * - Optional background replacement
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// fal.ai API configuration
// NOTE: trim() prevents subtle 401s caused by copied secrets containing trailing newlines/spaces.
const FAL_API_KEY = (Deno.env.get("FAL_API_KEY") ?? "").trim();
const FAL_API_URL = "https://queue.fal.run/fal-ai/rmbg";

// Alternative providers (fallbacks)
const REPLICATE_API_TOKEN = (Deno.env.get("REPLICATE_API_TOKEN") ?? "").trim();
const PHOTOROOM_API_KEY = (Deno.env.get("PHOTOROOM_API_KEY") ?? "").trim();

interface RemoveBackgroundRequest {
  imageUrl?: string;
  imageBase64?: string;
  userId?: string;
  organizationId?: string;
  saveToLibrary?: boolean;
  // Optional: replace background with color or image
  backgroundColor?: string; // e.g., "#FFFFFF" for white
  backgroundImageUrl?: string;
}

interface RemoveBackgroundResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  savedImageId?: string;
  error?: string;
  provider?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAL.AI BACKGROUND REMOVAL
// ═══════════════════════════════════════════════════════════════════════════════

async function removeBackgroundWithFal(imageUrl: string): Promise<{
  imageUrl?: string;
  error?: string;
}> {
  if (!FAL_API_KEY) {
    return { error: "FAL_API_KEY not configured" };
  }

  try {
    console.log("🎨 Calling fal.ai RMBG model...");

    // Submit the job
    const submitResponse = await fetch(FAL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("fal.ai submit error:", errorText);
      // Include response body (truncated) to aid debugging without leaking secrets.
      const truncated = errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText;
      return { error: `fal.ai error: ${submitResponse.status}${truncated ? ` - ${truncated}` : ""}` };
    }

    const result = await submitResponse.json();

    // fal.ai queue returns request_id for async processing
    if (result.request_id) {
      // Poll for completion
      const statusUrl = `${FAL_API_URL}/requests/${result.request_id}/status`;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(statusUrl, {
          headers: {
            "Authorization": `Key ${FAL_API_KEY}`,
          },
        });

        if (!statusResponse.ok) {
          attempts++;
          continue;
        }

        const status = await statusResponse.json();

        if (status.status === "COMPLETED") {
          // Fetch the result
          const resultUrl = `${FAL_API_URL}/requests/${result.request_id}`;
          const resultResponse = await fetch(resultUrl, {
            headers: {
              "Authorization": `Key ${FAL_API_KEY}`,
            },
          });

          if (resultResponse.ok) {
            const finalResult = await resultResponse.json();
            if (finalResult.image?.url) {
              return { imageUrl: finalResult.image.url };
            }
          }
          break;
        }

        if (status.status === "FAILED") {
          return { error: "fal.ai processing failed" };
        }

        attempts++;
      }

      return { error: "fal.ai timeout" };
    }

    // Synchronous response (direct result)
    if (result.image?.url) {
      return { imageUrl: result.image.url };
    }

    return { error: "No image in fal.ai response" };
  } catch (error) {
    console.error("fal.ai error:", error);
    return { error: `fal.ai exception: ${error.message}` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLICATE FALLBACK (using rembg model)
// ═══════════════════════════════════════════════════════════════════════════════

async function removeBackgroundWithReplicate(imageUrl: string): Promise<{
  imageUrl?: string;
  error?: string;
}> {
  if (!REPLICATE_API_TOKEN) {
    return { error: "REPLICATE_API_TOKEN not configured" };
  }

  try {
    console.log("🎨 Calling Replicate rembg model...");

    // Create prediction
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // rembg model on Replicate
        version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate error:", errorText);
      return { error: `Replicate error: ${response.status}` };
    }

    const prediction = await response.json();

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        return { imageUrl: status.output };
      }

      if (status.status === "failed") {
        return { error: status.error || "Replicate processing failed" };
      }

      attempts++;
    }

    return { error: "Replicate timeout" };
  } catch (error) {
    console.error("Replicate error:", error);
    return { error: `Replicate exception: ${error.message}` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTOROOM FALLBACK (simple API)
// ═══════════════════════════════════════════════════════════════════════════════

async function removeBackgroundWithPhotoroom(imageUrl: string): Promise<{
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
}> {
  if (!PHOTOROOM_API_KEY) {
    return { error: "PHOTOROOM_API_KEY not configured" };
  }

  try {
    console.log("🎨 Calling PhotoRoom API...");

    const response = await fetch("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "x-api-key": PHOTOROOM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        format: "png",
        bg_color: "transparent",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PhotoRoom error:", errorText);
      return { error: `PhotoRoom error: ${response.status}` };
    }

    // PhotoRoom returns the image directly
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return { imageBase64: base64 };
  } catch (error) {
    console.error("PhotoRoom error:", error);
    return { error: `PhotoRoom exception: ${error.message}` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RemoveBackgroundRequest = await req.json();
    const { imageUrl, imageBase64, userId, organizationId, saveToLibrary } = body;

    // Validate input
    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert base64 to URL if needed (upload to temp storage)
    let processImageUrl = imageUrl;

    if (!processImageUrl && imageBase64) {
      // For base64 images, we need to upload to Supabase storage first
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const fileName = `temp-bg-removal/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const buffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("generated-images")
        .upload(fileName, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(fileName);

      processImageUrl = urlData.publicUrl;
    }

    console.log(`🖼️ Processing background removal for: ${processImageUrl?.substring(0, 50)}...`);

    // Try providers in order of preference
    let result: { imageUrl?: string; imageBase64?: string; error?: string } | null = null;
    let provider = "";

    // 1. Try fal.ai first (best quality)
    if (FAL_API_KEY) {
      result = await removeBackgroundWithFal(processImageUrl!);
      provider = "fal.ai";
    }

    // 2. Fallback to Replicate
    if ((!result || result.error) && REPLICATE_API_TOKEN) {
      console.log("Falling back to Replicate...");
      result = await removeBackgroundWithReplicate(processImageUrl!);
      provider = "replicate";
    }

    // 3. Fallback to PhotoRoom
    if ((!result || result.error) && PHOTOROOM_API_KEY) {
      console.log("Falling back to PhotoRoom...");
      result = await removeBackgroundWithPhotoroom(processImageUrl!);
      provider = "photoroom";
    }

    // Check if any provider succeeded
    if (!result || result.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result?.error || "No background removal provider available",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Background removed successfully using ${provider}`);

    // Optionally save to library
    let savedImageId: string | undefined;

    if (saveToLibrary && userId && organizationId && (result.imageUrl || result.imageBase64)) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      try {
        // Download the processed image if we only have URL
        let imageBuffer: Uint8Array;

        if (result.imageUrl) {
          const imageResponse = await fetch(result.imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = new Uint8Array(arrayBuffer);
        } else {
          imageBuffer = Uint8Array.from(atob(result.imageBase64!), (c) => c.charCodeAt(0));
        }

        // Upload to permanent storage
        const fileName = `${organizationId}/${userId}/bg-removed-${Date.now()}.png`;
        
        const { error: uploadError } = await supabase.storage
          .from("generated-images")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("generated-images")
            .getPublicUrl(fileName);

          // Save to generated_images table
          const { data: savedImage } = await supabase
            .from("generated_images")
            .insert({
              user_id: userId,
              organization_id: organizationId,
              image_url: urlData.publicUrl,
              prompt: "Background removed",
              goal_type: "background_removal",
              is_saved: true,
              metadata: {
                provider,
                original_url: imageUrl,
                processing_type: "background_removal",
              },
            })
            .select("id")
            .single();

          savedImageId = savedImage?.id;
        }
      } catch (saveError) {
        console.error("Error saving to library:", saveError);
        // Continue anyway - the removal succeeded
      }
    }

    const response: RemoveBackgroundResponse = {
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageBase64,
      savedImageId,
      provider,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Background removal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Background removal failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});





