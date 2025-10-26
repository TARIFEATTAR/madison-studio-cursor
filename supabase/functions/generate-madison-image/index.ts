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

/**
 * Smart prompt combination for chain refinements
 */
function buildChainPrompt(
  originalPrompt: string,
  refinement: string,
  depth: number
): string {
  // Extract base elements from original prompt
  const baseElements = originalPrompt
    .replace(/\b(with|featuring|showing|adjust:|refinement:)\b.*/gi, '')
    .trim();
  
  // Combine intelligently based on refinement type
  const lowerRefinement = refinement.toLowerCase();
  
  if (lowerRefinement.match(/\b(darker|brighter|lighter|warmer|cooler)\b/i)) {
    return `${originalPrompt}. Adjust: ${refinement}`;
  }
  
  if (lowerRefinement.match(/\b(add|include|with)\b/i)) {
    return `${originalPrompt}. ${refinement}`;
  }
  
  if (lowerRefinement.match(/\b(remove|without|exclude)\b/i)) {
    return `${baseElements}. ${refinement}`;
  }
  
  // Default: append refinement
  return `${originalPrompt}. Refinement: ${refinement}`;
}

/**
 * Apply Pro Mode controls with structured formatting
 */
function applyProModeControls(
  basePrompt: string,
  proModeControls?: { camera?: string; lighting?: string; environment?: string }
): string {
  if (!proModeControls || Object.keys(proModeControls).length === 0) {
    return basePrompt;
  }
  
  let enhanced = basePrompt;
  
  // Camera/Lens specifications (structured format)
  if (proModeControls.camera) {
    enhanced += `\n\nCAMERA & LENS SPECIFICATIONS:\n${proModeControls.camera}`;
  }
  
  // Lighting setup (structured format)
  if (proModeControls.lighting) {
    enhanced += `\n\nLIGHTING SETUP:\n${proModeControls.lighting}`;
  }
  
  // Environment & Surface (structured format)
  if (proModeControls.environment) {
    enhanced += `\n\nENVIRONMENT & SURFACE:\n${proModeControls.environment}`;
  }
  
  // Add professional quality mandate
  if (Object.keys(proModeControls).length > 0) {
    enhanced += `\n\nPHOTOGRAPHY DIRECTIVE: Apply these professional specifications precisely. Match the technical characteristics of the specified equipment, lighting, and environment exactly.`;
  }
  
  return enhanced;
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
      referenceImages, // Now an array of {url, description, label}
      brandContext,
      imageConstraints,
      // Chain prompting parameters
      parentImageId,
      isRefinement,
      refinementInstruction,
      parentPrompt,
      // Pro Mode controls
      proModeControls
    } = await req.json();

    console.log('🎨 Generating Madison image:', {
      goalType,
      aspectRatio,
      promptLength: prompt.length,
      hasBrandContext: !!brandContext,
      hasReferenceImages: !!referenceImages && referenceImages.length > 0,
      referenceImageCount: referenceImages?.length || 0,
      hasConstraints: !!imageConstraints,
      isChainRefinement: !!isRefinement,
      parentImageId: parentImageId || null,
      proModeControlsReceived: !!proModeControls,
      proModeDetails: proModeControls || null
    });

    // Create Supabase client for chain mode and general operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Handle chain refinement mode
    let parentChainDepth = 0;
    let actualReferenceImages = referenceImages || [];
    
    if (isRefinement && parentImageId) {
      console.log('⛓️ Chain refinement mode - fetching parent image');
      
      // Fetch parent image data
      const { data: parentImage, error: parentError } = await supabaseClient
        .from('generated_images')
        .select('image_url, final_prompt, chain_depth')
        .eq('id', parentImageId)
        .single();
      
      if (parentError) {
        console.error('❌ Failed to fetch parent image:', parentError);
        throw new Error('Parent image not found for chain refinement');
      }
      
      if (parentImage) {
        parentChainDepth = parentImage.chain_depth || 0;
        console.log(`📊 Parent chain depth: ${parentChainDepth}`);
        
        // Auto-include parent image as primary reference
        const chainReferenceImage = {
          url: parentImage.image_url,
          label: 'Product' as const,
          description: 'Previous iteration from chain'
        };
        
        // Prepend to reference images array
        actualReferenceImages = [chainReferenceImage, ...actualReferenceImages];
        console.log('✅ Added parent image as reference for chain refinement');
      }
    }

    // Build the enhanced prompt
    let enhancedPrompt = isRefinement && refinementInstruction 
      ? buildChainPrompt(parentPrompt || prompt, refinementInstruction, parentChainDepth)
      : prompt;
    
    // Apply Pro Mode controls FIRST (before other enhancements)
    if (proModeControls && Object.keys(proModeControls).length > 0) {
      console.log('🎛️ Applying Pro Mode controls:', proModeControls);
      enhancedPrompt = applyProModeControls(enhancedPrompt, proModeControls);
    }
    
    // Apply image constraints if provided
    if (imageConstraints) {
      // Apply rewrite rules
      if (imageConstraints.rewriteRules) {
        Object.entries(imageConstraints.rewriteRules).forEach(([from, to]) => {
          const regex = new RegExp(from, 'gi');
          enhancedPrompt = enhancedPrompt.replace(regex, to as string);
        });
      }
      
      // Remove prohibited terms
      if (imageConstraints.prohibitedTerms && imageConstraints.prohibitedTerms.length > 0) {
        imageConstraints.prohibitedTerms.forEach((term: string) => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          enhancedPrompt = enhancedPrompt.replace(regex, '');
        });
      }
    }
    
    // Aspect ratio is now handled via image_config API parameter (see line 209)
    // This provides precise control over image dimensions
    
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
    
    // Append hard constraints at the end
    if (imageConstraints?.hardInstructions) {
      enhancedPrompt += `\n\n${imageConstraints.hardInstructions}`;
    }

    // Apply advanced prompt formula if reference images are provided
    if (actualReferenceImages && actualReferenceImages.length > 0) {
      if (actualReferenceImages.length === 1) {
        // Single reference - use existing product placement prompt
        enhancedPrompt = buildProductPlacementPrompt(enhancedPrompt, brandContext);
        if (actualReferenceImages[0].description) {
          enhancedPrompt += `\n\nReference Notes: ${actualReferenceImages[0].description}`;
        }
      } else {
        // Multiple references - build multi-image composite prompt
        enhancedPrompt = `MULTI-REFERENCE IMAGE COMPOSITION:
You have ${actualReferenceImages.length} reference images. Combine them according to the scene description below.

REFERENCE IMAGES:
${actualReferenceImages.map((img: any, idx: number) => `${idx + 1}. ${img.label}: ${img.description || 'Use as-is from image'}`).join('\n')}

SCENE TO CREATE:
${enhancePromptWithFormula(enhancedPrompt, brandContext)}

COMPOSITION REQUIREMENTS:
- Maintain exact appearance of products/subjects from their reference images
- Use background reference for environment and setting
- Apply style/lighting references to the overall composition
- Create a cohesive, professionally composed image that integrates all references naturally
- Ensure proper lighting consistency across all elements

PHOTOGRAPHIC QUALITY:
- Shot Type: Professional product photography with multi-element composition
- Camera/Lens: DSLR quality with appropriate depth of field
- Lighting: Unified lighting that makes all elements feel part of the same scene
- The composition should feel natural, not like separate elements pasted together`;
      }
    }

    // Build message content with optional reference images (supports multiple)
    let messageContent: any;
    
    if (actualReferenceImages && actualReferenceImages.length > 0) {
      // Multi-modal message with reference images and text
      const contentParts: any[] = [
        {
          type: "text",
          text: enhancedPrompt
        }
      ];
      
      // Fetch and add all reference images
      for (const refImage of actualReferenceImages) {
        let imageData = refImage.url;
        
        // If it's a Supabase storage URL, fetch it directly (public bucket)
        if (refImage.url.includes('/storage/v1/object/public/')) {
          try {
            console.log(`📥 Downloading reference image: ${refImage.label}`);
            console.log(`📍 URL: ${refImage.url}`);
            
            // Fetch the image directly from the public URL
            const imageResponse = await fetch(refImage.url);
            
            if (!imageResponse.ok) {
              throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
            }
            
            // Get the image as array buffer
            const imageBuffer = await imageResponse.arrayBuffer();
            const uint8Array = new Uint8Array(imageBuffer);
            
            // Convert to base64 in chunks to avoid stack overflow
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
              binary += String.fromCharCode(...chunk);
            }
            const base64 = btoa(binary);
            
            // Determine content type from response headers
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            imageData = `data:${contentType};base64,${base64}`;
            
            console.log(`✅ Converted reference image ${refImage.label} (${(uint8Array.length / 1024).toFixed(1)}KB)`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Failed to download reference image ${refImage.label}:`, errorMsg);
            throw new Error(`Failed to load reference image "${refImage.label}": ${errorMsg}`);
          }
        }
        
        contentParts.push({
          type: "image_url",
          image_url: {
            url: imageData
          }
        });
      }
      
      messageContent = contentParts;
    } else {
      // Text-only message
      messageContent = enhancedPrompt;
    }
    
    // Build request body with proper aspect ratio configuration
    const requestBody: any = {
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [{ role: 'user', content: messageContent }],
      modalities: ['image', 'text']
    };
    
    // Add aspect ratio via image_config for precise dimension control
    if (aspectRatio) {
      requestBody.image_config = { aspect_ratio: aspectRatio };
    }
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Image generation API error:', response.status, errorText);
      
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
      
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: `Invalid image generation request: ${errorText}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Image generation failed (${response.status}): ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

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
        final_prompt: enhancedPrompt,
        image_url: imageUrl,
        description: description,
        reference_images: actualReferenceImages,
        brand_context_used: brandContext,
        // Chain tracking fields
        parent_image_id: isRefinement ? parentImageId : null,
        chain_depth: isRefinement ? parentChainDepth + 1 : 0,
        is_chain_origin: !isRefinement,
        refinement_instruction: isRefinement ? refinementInstruction : null
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Error in generate-madison-image:', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Image generation failed. Please try again or contact support if the issue persists.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
