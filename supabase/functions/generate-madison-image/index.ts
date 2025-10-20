import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { 
      prompt, 
      organizationId, 
      userId,
      goalType,
      aspectRatio,
      outputFormat = 'png',
      selectedTemplate,
      userRefinements,
      referenceImageUrl,
      referenceDescription,
      brandContext
    } = await req.json();

    console.log('🎨 Generating Madison image:', {
      goalType,
      aspectRatio,
      promptLength: prompt.length,
      hasBrandContext: !!brandContext,
      hasReferenceImage: !!referenceImageUrl
    });

    // Enhance prompt with brand context
    let enhancedPrompt = prompt;
    
    if (brandContext) {
      if (brandContext.colors && brandContext.colors.length > 0) {
        enhancedPrompt += `\n\nBrand Colors to incorporate: ${brandContext.colors.join(', ')}`;
      }
      
      if (brandContext.styleKeywords && brandContext.styleKeywords.length > 0) {
        enhancedPrompt += `\nBrand Aesthetic: ${brandContext.styleKeywords.join(', ')}`;
      }
      
      if (brandContext.voiceTone) {
        enhancedPrompt += `\nBrand Voice: ${brandContext.voiceTone}`;
      }
      
      if (brandContext.productName) {
        enhancedPrompt += `\nProduct: ${brandContext.productName}`;
      }
    }

    // Add explicit reference image instructions if provided
    if (referenceImageUrl) {
      enhancedPrompt = `REFERENCE IMAGE PROVIDED: Use the provided reference image for style, lighting, composition, or visual elements as requested by the user.\n\n${enhancedPrompt}`;
      if (referenceDescription) {
        enhancedPrompt += `\n\nReference Usage Instructions: ${referenceDescription}`;
      }
    }

    // Build message content with optional reference image
    let messageContent: any;
    
    if (referenceImageUrl) {
      // Fetch reference image from storage
      let referenceImageData = referenceImageUrl;
      
      // If it's a Supabase storage URL, fetch it
      if (referenceImageUrl.includes('/storage/v1/object/public/')) {
        try {
          const imageResponse = await fetch(referenceImageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
            referenceImageData = `data:image/jpeg;base64,${base64}`;
          }
        } catch (error) {
          console.error('Failed to fetch reference image:', error);
        }
      }
      
      // Multi-modal message with reference image and text
      messageContent = [
        {
          type: "text",
          text: enhancedPrompt
        },
        {
          type: "image_url",
          image_url: {
            url: referenceImageData
          }
        }
      ];
    } else {
      // Text-only message
      messageContent = enhancedPrompt;
    }
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: messageContent }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ NanoBanana error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Lovable AI credits depleted. Please add credits in Settings.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`NanoBanana API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: savedImage, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        goal_type: goalType,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        selected_template: selectedTemplate,
        user_refinements: userRefinements,
        final_prompt: prompt,
        image_url: imageUrl,
        description: description,
        reference_image_url: referenceImageUrl,
        brand_context_used: brandContext
      })
      .select()
      .single();

    if (dbError) {
      console.error('⚠️ Failed to save to DB:', dbError);
      // Don't fail the request - image was generated successfully
    }

    console.log('✅ Image generated and saved:', savedImage?.id);

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description,
        savedImageId: savedImage?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-madison-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
