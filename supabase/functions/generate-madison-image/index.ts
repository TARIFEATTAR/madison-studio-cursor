import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatVisualContext } from '../_shared/productFieldFilters.ts';

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
 * APPENDS professional specs to the base prompt instead of replacing
 */
function applyProModeControls(
  basePrompt: string,
  proModeControls?: { camera?: string; lighting?: string; environment?: string }
): string {
  if (!proModeControls || Object.keys(proModeControls).length === 0) {
    return basePrompt;
  }
  
  let enhanced = basePrompt;
  const specs: string[] = [];
  
  // Extract technical specs from controls
  if (proModeControls.camera) {
    specs.push(`📷 Camera: ${proModeControls.camera}`);
  }
  
  if (proModeControls.lighting) {
    specs.push(`💡 Lighting: ${proModeControls.lighting}`);
  }
  
  if (proModeControls.environment) {
    specs.push(`🌍 Environment: ${proModeControls.environment}`);
  }
  
  // APPEND Pro Mode specs at the end, don't replace
  if (specs.length > 0) {
    enhanced += `\n\n━━━ PRO MODE SPECIFICATIONS ━━━\n${specs.join('\n')}`;
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
      proModeControls,
      // Session tracking
      sessionId,
      // Product context
      product_id
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
      proModeDetails: proModeControls || null,
      proModeKeys: proModeControls ? Object.keys(proModeControls) : [],
      sessionId: sessionId || 'none'
    });

    // Create Supabase client for chain mode and general operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Resolve organization_id if missing
    let resolvedOrganizationId = organizationId;
    
    if (!resolvedOrganizationId) {
      console.log('⚠️ No organizationId provided, attempting fallback resolution');
      
      // Try to get from parent image if this is a refinement
      if (isRefinement && parentImageId) {
        console.log('📎 Attempting to get organization_id from parent image');
        const { data: parentImage, error: parentOrgError } = await supabaseClient
          .from('generated_images')
          .select('organization_id')
          .eq('id', parentImageId)
          .single();
        
        if (!parentOrgError && parentImage?.organization_id) {
          resolvedOrganizationId = parentImage.organization_id;
          console.log('✅ Resolved organization_id from parent image:', resolvedOrganizationId);
        }
      }
      
      // If still no org, get user's first organization
      if (!resolvedOrganizationId && userId) {
        console.log('📎 Attempting to get organization_id from user membership');
        const { data: membership, error: membershipError } = await supabaseClient
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', userId)
          .limit(1)
          .single();
        
        if (!membershipError && membership?.organization_id) {
          resolvedOrganizationId = membership.organization_id;
          console.log('✅ Resolved organization_id from user membership:', resolvedOrganizationId);
        }
      }
      
      if (!resolvedOrganizationId) {
        console.error('❌ Failed to resolve organization_id');
        return new Response(
          JSON.stringify({ error: 'Could not determine organization. Please ensure you are a member of an organization.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Fetch organization's active brand knowledge
    console.log('📚 Fetching active brand knowledge for organization:', resolvedOrganizationId);
    const { data: brandKnowledgeData, error: bkError } = await supabaseClient
      .from('brand_knowledge')
      .select('knowledge_type, content')
      .eq('organization_id', resolvedOrganizationId)
      .eq('is_active', true);

    if (bkError) {
      console.error('⚠️ Failed to fetch brand knowledge:', bkError);
    }
    
    // 🎨 FETCH PRODUCT DATA (ALL 49 FIELDS) FOR IMAGE GENERATION
    let productData: any = null;
    if (product_id && resolvedOrganizationId) {
      console.log('🛍️ Fetching complete product data (all 49 fields) for ID:', product_id);
      const { data: dbProductData, error: productError } = await supabaseClient
        .from('brand_products')
        .select('*')
        .eq('id', product_id)
        .eq('organization_id', resolvedOrganizationId)
        .maybeSingle();
      
      if (productError) {
        console.error('⚠️ Error fetching product data:', productError);
      } else if (dbProductData) {
        productData = dbProductData;
        console.log('✅ Product data loaded:', {
          name: productData.name,
          category: productData.category,
          hasVisualDNA: !!(productData.visual_world || productData.shot_type || productData.lighting_mood),
          fieldCount: Object.keys(productData).filter(k => productData[k] !== null && productData[k] !== '').length
        });
      }
    }

    // Parse brand knowledge into structured object
    const brandKnowledge = {
      visualStandards: brandKnowledgeData?.find(k => k.knowledge_type === 'visual_standards')?.content || null,
      vocabulary: brandKnowledgeData?.find(k => k.knowledge_type === 'vocabulary')?.content || null,
      brandVoice: brandKnowledgeData?.find(k => k.knowledge_type === 'brand_voice')?.content || null
    };

    console.log('✅ Brand knowledge loaded:', {
      hasVisualStandards: !!brandKnowledge.visualStandards,
      visualStandardsSize: brandKnowledge.visualStandards ? JSON.stringify(brandKnowledge.visualStandards).length : 0,
      propCount: brandKnowledge.visualStandards?.approved_props?.length || 0,
      colorCount: brandKnowledge.visualStandards?.color_palette?.length || 0,
      templateCount: brandKnowledge.visualStandards?.templates?.length || 0
    });
    
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
    
    // DON'T apply Pro Mode yet - wait until after reference image logic to preserve specs
    
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
    
    // Enrich prompt with brand knowledge from database
    if (brandKnowledge.visualStandards) {
      const vs = brandKnowledge.visualStandards;
      
      console.log('🎨 Enriching prompt with brand knowledge');
      
      // Add color palette
      if (vs.color_palette && vs.color_palette.length > 0) {
        const topColors = vs.color_palette
          .slice(0, 5)
          .map((c: any) => `${c.name} (${c.hex})`)
          .join(', ');
        enhancedPrompt += `\n\n🎨 BRAND COLOR PALETTE: ${topColors}`;
        console.log(`✅ Added ${vs.color_palette.length} brand colors`);
      }
      
      // Add approved props (critical for freestyle mode)
      if (vs.approved_props && vs.approved_props.length > 0) {
        enhancedPrompt += `\n\n📦 APPROVED PROPS & MATERIALS (use these when contextually appropriate):\n${vs.approved_props.slice(0, 25).join(', ')}`;
        console.log(`✅ Added ${vs.approved_props.length} approved props`);
      }
      
      // Add lighting mandates
      if (vs.lighting_mandates) {
        enhancedPrompt += `\n\n💡 LIGHTING DIRECTIVE: ${vs.lighting_mandates}`;
      }
      
      // Add forbidden elements (prevent off-brand imagery)
      if (vs.forbidden_elements && vs.forbidden_elements.length > 0) {
        enhancedPrompt += `\n\n🚫 FORBIDDEN ELEMENTS (NEVER include): ${vs.forbidden_elements.join(', ')}`;
        console.log(`✅ Added ${vs.forbidden_elements.length} forbidden elements`);
      }
    }
    
    // 🎯 INJECT ALL 49 PRODUCT FIELDS FOR IMAGE GENERATION
    if (productData) {
      const productVisualContext = formatVisualContext(productData);
      enhancedPrompt += productVisualContext;
      console.log('✅ Added complete product visual DNA (all 49 fields)');
    }

    // Still apply basic brandContext if provided (for backward compatibility)
    if (brandContext?.productName) {
      enhancedPrompt += `\n\n📍 Product Focus: ${brandContext.productName}`;
    }
    
    // Append hard constraints at the end
    if (imageConstraints?.hardInstructions) {
      enhancedPrompt += `\n\n${imageConstraints.hardInstructions}`;
    }

    // Apply advanced prompt formula if reference images are provided
    if (actualReferenceImages && actualReferenceImages.length > 0) {
      const hasProMode = proModeControls && Object.keys(proModeControls).length > 0;
      
      if (actualReferenceImages.length === 1) {
        // FIXED: Proper integration of Pro Mode with reference images
        console.log(`🎛️ Building prompt for single reference image (Pro Mode: ${hasProMode})`);
        const originalScene = enhancedPrompt;
        
        enhancedPrompt = `REFERENCE-GUIDED IMAGE GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 REFERENCE IMAGE PROVIDED:
This reference shows the product/subject. Use its EXACT appearance - every detail of color, shape, texture, materials, and design must match the reference precisely.

🎬 SCENE TO CREATE:
${originalScene}

🎯 COMPOSITION REQUIREMENTS:
• Take the product EXACTLY as shown in the reference image
• Place it into the scene described above
• Maintain all product details: colors, textures, materials, shape
• The product must remain recognizable and true to the reference
• Integrate it naturally so it belongs in the scene
• Product should be the primary focal point

📷 PHOTOGRAPHIC STANDARDS:
• Professional product photography quality
• Natural, realistic lighting integration
• Proper depth of field for product emphasis
• The scene should complement and elevate the product`;

        if (actualReferenceImages[0].description) {
          enhancedPrompt += `\n\n📝 REFERENCE NOTES: ${actualReferenceImages[0].description}`;
        }
      } else {
        // Multiple references - build multi-image composite prompt
        console.log(`🎛️ Building prompt for ${actualReferenceImages.length} reference images (Pro Mode: ${hasProMode})`);
        const originalScene = enhancedPrompt;
        
        enhancedPrompt = `MULTI-REFERENCE IMAGE COMPOSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 REFERENCE IMAGES PROVIDED (${actualReferenceImages.length}):
${actualReferenceImages.map((img: any, idx: number) => 
  `${idx + 1}. ${img.label}: ${img.description || 'Use exactly as shown in reference'}`
).join('\n')}

🎬 SCENE TO CREATE:
${enhancePromptWithFormula(originalScene, brandContext)}

🎯 COMPOSITION REQUIREMENTS:
• Preserve exact appearance of all products/subjects from references
• Use background reference for environment and setting
• Apply style/lighting references to overall mood and atmosphere
• Create a cohesive, unified composition
• All elements must feel like they belong in the same scene
• Maintain consistent lighting across all elements
• Natural integration - not separate elements pasted together

📷 PHOTOGRAPHIC STANDARDS:
• Professional product photography composition
• Appropriate depth of field for emphasis
• Unified, realistic lighting
• Natural shadows and highlights
• All references should complement each other`;
      }
    }
    
    // NOW apply Pro Mode controls AFTER all other enhancements (including reference images)
    if (proModeControls && Object.keys(proModeControls).length > 0) {
      console.log('🎛️ Applying Pro Mode controls:', {
        camera: proModeControls.camera || 'none',
        lighting: proModeControls.lighting || 'none', 
        environment: proModeControls.environment || 'none'
      });
      enhancedPrompt = applyProModeControls(enhancedPrompt, proModeControls);
      console.log('✅ Pro Mode controls applied to prompt');
    } else {
      console.log('ℹ️ No Pro Mode controls active');
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
      
      // Fetch and add all reference images with improved error handling
      for (const refImage of actualReferenceImages) {
        let imageData = refImage.url;
        
        // If it's a Supabase storage URL, fetch it directly (public bucket)
        if (refImage.url.includes('/storage/v1/object/public/')) {
          try {
            console.log(`📥 Downloading reference image: ${refImage.label}`);
            console.log(`📍 URL: ${refImage.url}`);
            
            // Add timeout to fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const imageResponse = await fetch(refImage.url, {
              signal: controller.signal,
              headers: {
                'Accept': 'image/*'
              }
            });
            clearTimeout(timeoutId);
            
            if (!imageResponse.ok) {
              throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
            }
            
            // Get the image as array buffer
            const imageBuffer = await imageResponse.arrayBuffer();
            
            if (imageBuffer.byteLength === 0) {
              throw new Error('Downloaded image is empty (0 bytes)');
            }
            
            if (imageBuffer.byteLength > 20 * 1024 * 1024) {
              throw new Error(`Image too large: ${(imageBuffer.byteLength / 1024 / 1024).toFixed(1)}MB (max 20MB)`);
            }
            
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
            
            // Validate content type
            if (!contentType.startsWith('image/')) {
              throw new Error(`Invalid content type: ${contentType} (expected image/*)`);
            }
            
            imageData = `data:${contentType};base64,${base64}`;
            
            console.log(`✅ Converted reference image ${refImage.label} (${(uint8Array.length / 1024).toFixed(1)}KB, ${contentType})`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Failed to download reference image ${refImage.label}:`, errorMsg);
            console.error(`📍 Full error:`, error);
            throw new Error(`Failed to load reference image "${refImage.label}": ${errorMsg}. Please ensure the image is accessible and under 20MB.`);
          }
        } else if (!refImage.url.startsWith('data:image/')) {
          // If it's not a data URL and not a Supabase URL, it might be invalid
          console.warn(`⚠️ Unexpected URL format for reference ${refImage.label}: ${refImage.url.substring(0, 100)}...`);
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
        organization_id: resolvedOrganizationId,
        user_id: userId,
        session_id: sessionId,
        goal_type: goalType,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        selected_template: selectedTemplate,
        user_refinements: userRefinements,
        final_prompt: enhancedPrompt,
        image_url: imageUrl,
        description: description,
        reference_images: actualReferenceImages,
        brand_context_used: {
          ...brandContext,
        knowledgeUsed: {
            visualStandards: !!brandKnowledge.visualStandards,
            vocabulary: !!brandKnowledge.vocabulary,
            brandVoice: !!brandKnowledge.brandVoice,
            propCount: brandKnowledge.visualStandards?.approved_props?.length || 0,
            colorCount: brandKnowledge.visualStandards?.color_palette?.length || 0
          }
        },
        // Chain tracking fields
        parent_image_id: isRefinement ? parentImageId : null,
        chain_depth: isRefinement ? parentChainDepth + 1 : 0,
        is_chain_origin: !isRefinement,
        refinement_instruction: isRefinement ? refinementInstruction : null
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ CRITICAL: Failed to save to DB:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save generated image to database',
          details: dbError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!savedImage?.id) {
      console.error('❌ CRITICAL: No savedImage.id returned from database');
      return new Response(
        JSON.stringify({ error: 'Database save succeeded but no image ID returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Image generated and saved:', savedImage.id);

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description,
        savedImageId: savedImage.id
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
