/**
 * Madison Studio - Video Generation Edge Function
 * 
 * Converts generated images into dynamic product videos using Freepik's Seedance API.
 * 
 * Features:
 * - Image-to-video conversion
 * - 5s or 10s duration
 * - 720p or 1080p resolution
 * - Fixed or dynamic camera motion
 * - Multiple aspect ratios for social media
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateVideo } from "../_shared/freepikProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      imageUrl,
      imageId,
      prompt,
      duration = "5",
      resolution = "720p",
      aspectRatio = "16:9",
      cameraFixed = false,
      userId,
      organizationId,
    } = body;

    // Validation
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required for video generation" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🎬 Video Generation Request:", {
      imageId,
      duration,
      resolution,
      aspectRatio,
      cameraFixed,
      promptLength: prompt.length,
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve organization if not provided
    let resolvedOrgId = organizationId;

    if (!resolvedOrgId && userId) {
      const { data } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (data?.organization_id) {
        resolvedOrgId = data.organization_id;
      }
    }

    if (!resolvedOrgId) {
      return new Response(
        JSON.stringify({ error: "Could not resolve organization" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Build motion prompt with product photography context
    const enhancedPrompt = buildVideoPrompt(prompt, cameraFixed);

    console.log("🎥 Starting Freepik video generation...");

    // Generate video using Freepik
    const { videoUrl, taskId } = await generateVideo({
      imageUrl,
      prompt: enhancedPrompt,
      duration: duration as "5" | "10",
      resolution: resolution as "720p" | "1080p",
      aspectRatio: mapToFreepikRatio(aspectRatio),
      cameraFixed,
    });

    console.log("✅ Video generated:", { taskId, videoUrl });

    // Save to database
    const { data: savedVideo, error: dbError } = await supabase
      .from("generated_images")
      .insert({
        organization_id: resolvedOrgId,
        user_id: userId,
        media_type: "video",
        image_url: imageUrl, // Original source image
        video_url: videoUrl,
        video_duration: parseInt(duration),
        source_image_id: imageId || null,
        final_prompt: enhancedPrompt,
        goal_type: "product_video",
        aspect_ratio: aspectRatio,
        description: `Product video (${duration}s, ${resolution})`,
        generation_provider: "freepik",
        saved_to_library: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Still return the video URL even if DB save fails
    }

    return new Response(
      JSON.stringify({
        videoUrl,
        savedVideoId: savedVideo?.id,
        taskId,
        duration: parseInt(duration),
        resolution,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Video generation error:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Video generation failed",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

/**
 * Build an enhanced motion prompt for product videos
 */
function buildVideoPrompt(userPrompt: string, cameraFixed: boolean): string {
  let prompt = userPrompt;

  // If user didn't specify motion, add professional defaults
  if (!prompt.toLowerCase().includes("camera") && !cameraFixed) {
    prompt += ". Smooth, cinematic camera movement with gentle zoom.";
  }

  // Add professional video quality cues
  if (!prompt.toLowerCase().includes("lighting")) {
    prompt += " Professional studio lighting with soft shadows.";
  }

  // Ensure product focus
  if (!prompt.toLowerCase().includes("product") && !prompt.toLowerCase().includes("bottle")) {
    prompt += " Keep the product as the main focus throughout.";
  }

  return prompt;
}

/**
 * Map common aspect ratios to Freepik's format
 */
function mapToFreepikRatio(ratio: string): any {
  const mapping: Record<string, string> = {
    "16:9": "widescreen_16_9",
    "9:16": "social_story_9_16",
    "1:1": "square_1_1",
    "4:3": "classic_4_3",
    "3:4": "traditional_3_4",
    "21:9": "film_horizontal_21_9",
  };

  return mapping[ratio] || "widescreen_16_9";
}
