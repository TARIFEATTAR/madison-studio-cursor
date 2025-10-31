import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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
    if (!LOVABLE_API_KEY) {
      console.error("[generate-image-with-nano] LOVABLE_API_KEY not configured");
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { prompt } = await req.json();
    console.log('[generate-image-with-nano] Generating image for prompt:', prompt.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-image-with-nano] Nano Banana API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });
      
      // Handle specific error cases
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add credits to your workspace in Settings.");
      }
      if (response.status === 401) {
        throw new Error("API key invalid or expired. Please contact support.");
      }
      
      throw new Error(`Nano Banana API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error('[generate-image-with-nano] No image in response:', JSON.stringify(data, null, 2).substring(0, 500));
      throw new Error('No image generated in response');
    }

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