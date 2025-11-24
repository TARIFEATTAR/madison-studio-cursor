import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageId, userId, createRecipe = true } = await req.json();

    if (!imageId || !userId) {
      return new Response(
        JSON.stringify({ error: 'imageId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('💾 Marking image as saved:', { imageId, userId, createRecipe });

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, verify the user has access to this image
    // (either owns it or is a member of the organization that owns it)
    const { data: imageCheck, error: checkError } = await supabaseClient
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (checkError || !imageCheck) {
      console.error('❌ Image not found:', checkError);
      return new Response(
        JSON.stringify({ error: 'Image not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access
    if (imageCheck.user_id !== userId) {
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabaseClient
        .from('organization_members')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', imageCheck.organization_id)
        .single();

      if (membershipError || !membership) {
        console.error('❌ User does not have access to this image');
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update the image to mark as saved (using service role to bypass RLS)
    const { data: updatedImage, error: updateError } = await supabaseClient
      .from('generated_images')
      .update({ saved_to_library: true })
      .eq('id', imageId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update image:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update image', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Automatically create recipe if requested
    if (createRecipe) {
      try {
        // Check if prompt already exists
        const { data: existingPrompt } = await supabaseClient
          .from('prompts')
          .select('id')
          .eq('generated_image_id', imageId)
          .maybeSingle();

        if (!existingPrompt) {
          console.log('📝 Creating recipe for saved image...');
          
          const promptText = imageCheck.final_prompt || imageCheck.prompt || "Generated Image";
          const goalType = imageCheck.goal_type || 'product_photography';
          
          // Infer category logic (mirrored from generate-madison-image)
          const categoryMap: Record<string, string> = {
            'product_photography': 'product',
            'lifestyle': 'lifestyle',
            'ecommerce': 'ecommerce',
            'social_media': 'social',
            'editorial': 'editorial',
            'creative': 'creative',
            'flat_lay': 'flat_lay',
          };

          let inferredCategory = categoryMap[goalType] || 'product';
          const promptLower = promptText.toLowerCase();
          
          if (!categoryMap[goalType]) {
            if (promptLower.includes('flat lay') || promptLower.includes('flatlay')) inferredCategory = 'flat_lay';
            else if (promptLower.includes('lifestyle')) inferredCategory = 'lifestyle';
            else if (promptLower.includes('ecommerce')) inferredCategory = 'ecommerce';
            else if (promptLower.includes('social')) inferredCategory = 'social';
            else if (promptLower.includes('editorial')) inferredCategory = 'editorial';
            else if (promptLower.includes('artistic')) inferredCategory = 'creative';
          }

          const recipeTitle = `Image Recipe - ${new Date().toLocaleDateString()}`;

          const { error: promptError } = await supabaseClient
            .from('prompts')
            .insert([{
              title: recipeTitle,
              prompt_text: promptText,
              content_type: 'visual',
              collection: 'General',
              organization_id: imageCheck.organization_id,
              created_by: userId,
              is_template: true,
              deliverable_format: 'image_prompt',
              generated_image_id: imageId,
              image_source: 'generated',
              category: inferredCategory,
              image_url: imageCheck.image_url, // Important: Store the image URL on the prompt
              additional_context: {
                aspect_ratio: imageCheck.aspect_ratio,
                output_format: imageCheck.output_format,
                image_type: goalType,
                category: inferredCategory,
                model: 'nano-banana',
                style: 'Photorealistic'
              }
            }]);

          if (promptError) {
            console.error('❌ Failed to create recipe:', promptError);
            // We don't fail the whole request, but we log it
          } else {
            console.log('✅ Recipe created successfully');
          }
        } else {
          console.log('ℹ️ Recipe already exists for this image');
        }
      } catch (recipeErr) {
        console.error('❌ Error in recipe creation logic:', recipeErr);
      }
    }

    console.log('✅ Image marked as saved:', imageId);

    return new Response(
      JSON.stringify({ success: true, image: updatedImage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in mark-generated-image-saved:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
