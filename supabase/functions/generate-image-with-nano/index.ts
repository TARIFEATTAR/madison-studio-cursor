import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiImage } from "../_shared/aiProviders.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("[generate-image-with-nano] Function invoked");
  
  if (req.method === 'OPTIONS') {
    console.log("[generate-image-with-nano] CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('[generate-image-with-nano] Generating image for prompt:', prompt.substring(0, 100));

    const geminiImage = await callGeminiImage({ prompt });
    const base64Image = geminiImage?.data ?? geminiImage?.bytesBase64 ?? geminiImage?.base64;
    const mimeType = geminiImage?.mimeType ?? 'image/png';
    const description = geminiImage?.description ?? '';

    if (!base64Image) {
      throw new Error('No image generated in response');
    }

    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('[generate-image-with-nano] Successfully generated image');

    return new Response(
      JSON.stringify({ imageUrl, description }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-image-with-nano] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: error instanceof Error && errorMessage.includes('Rate limit') ? 429 :
                error instanceof Error && errorMessage.includes('credits') ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});