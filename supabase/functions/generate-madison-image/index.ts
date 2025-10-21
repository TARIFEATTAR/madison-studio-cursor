import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Enhanced prompt builder following the core formula:
 * [Shot Type], [Subject/Action], [Environment], [Color/Tone], [Camera/Lens], [Lighting], [Mood]
 */
function enhancePromptWithFormula(
  userScene: string,
  brandContext?: any
): string {
  let enhanced = userScene;
  
  // Add brand color palette if available
  if (brandContext?.colors && brandContext.colors.length > 0) {
    enhanced += `, incorporating ${brandContext.colors.join(" and ")} color tones`;
  }
  
  // Add brand aesthetic/style keywords
  if (brandContext?.styleKeywords && brandContext.styleKeywords.length > 0) {
    enhanced += `, ${brandContext.styleKeywords.join(", ")} aesthetic`;
  }
  
  return enhanced;
}

function buildProductPlacementPrompt(
  sceneDescription: string,
  brandContext?: any
): string {
  const enhancedScene = enhancePromptWithFormula(sceneDescription, brandContext);

  return `PRODUCT PLACEMENT INSTRUCTION:
The reference image shows a product (bottle, item, object). Take this EXACT product and place it into the scene described below. Maintain the product's appearance, colors, shape, and design exactly as shown in the reference image.

SCENE TO CREATE:
${enhancedScene}

PHOTOGRAPHIC REQUIREMENTS:
- Shot Type: Hero product photography with professional composition
- Camera/Lens: DSLR quality with appropriate depth of field for product focus
- Lighting: Ensure the product is well-lit with natural-looking shadows
- Environment: The scene should complement and elevate the product
- The product must be the focal point and clearly visible

IMPORTANT: Do not regenerate or alter the product - use it as-is from the reference image. Only the scene, environment, lighting, and context around it should change according to the description above.`;
}

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

    // Enhance prompt with brand context (works for any business vertical)
    let enhancedPrompt = prompt;
    
    // Add aspect ratio instructions to guide NanoBanana
    const aspectRatioInstructions: Record<string, string> = {
      '1:1': 'square composition with equal width and height',
      '4:5': 'vertical portrait orientation, slightly taller than wide',
      '2:3': 'vertical Pinterest format, taller portrait orientation',
      '3:2': 'horizontal email/web banner format, slightly wider than tall',
      '16:9': 'wide landscape format, cinematic horizontal composition',
      '9:16': 'tall vertical format, mobile-friendly portrait orientation',
      '21:9': 'ultra-wide cinematic format, expansive landscape composition'
    };
    
    if (aspectRatio && aspectRatioInstructions[aspectRatio]) {
      enhancedPrompt = `Create a ${aspectRatioInstructions[aspectRatio]}. ${enhancedPrompt}`;
    }
    
    if (brandContext) {
      // Only add brand context if it exists - system works for ANY business
      if (brandContext.colors && brandContext.colors.length > 0) {
        enhancedPrompt += `\n\nBrand Colors: ${brandContext.colors.join(', ')}`;
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

    // Apply advanced prompt formula if reference image is provided
    if (referenceImageUrl) {
      enhancedPrompt = buildProductPlacementPrompt(enhancedPrompt, brandContext);
      
      if (referenceDescription) {
        enhancedPrompt += `\n\nAdditional Reference Notes: ${referenceDescription}`;
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
    let imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload base64 image to Supabase Storage
    if (imageUrl.startsWith('data:image/')) {
      try {
        console.log('📤 Uploading image to storage...');
        
        // Convert base64 to buffer
        const base64Data = imageUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Generate unique filename
        const filename = `${organizationId}/${Date.now()}-${crypto.randomUUID()}.png`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('generated-images')
          .upload(filename, bytes, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('⚠️ Storage upload failed:', uploadError);
          // Continue with base64 if storage fails
        } else {
          // Get public URL
          const { data: publicUrlData } = supabaseClient
            .storage
            .from('generated-images')
            .getPublicUrl(filename);
          
          imageUrl = publicUrlData.publicUrl;
          console.log('✅ Image uploaded to storage:', imageUrl);
        }
      } catch (storageError) {
        console.error('⚠️ Error uploading to storage:', storageError);
        // Continue with base64 if storage fails
      }
    }

    const { data: savedImage, error: dbError } = await supabaseClient
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
