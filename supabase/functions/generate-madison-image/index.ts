import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatVisualContext } from "../_shared/productFieldFilters.ts";

// Gemini configuration
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "models/gemini-2.5-flash-image-preview:generateContent";

if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY env variable");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * ------------------------------
 * PROMPT SYSTEM (unchanged)
 * ------------------------------
 */

function enhancePromptWithFormula(userScene: string, brandContext: any): string {
  let enhanced = userScene;
  if (brandContext?.colors?.length > 0) {
    enhanced += `, incorporating ${brandContext.colors.join(" and ")} color tones`;
  }
  if (brandContext?.styleKeywords?.length > 0) {
    enhanced += `, ${brandContext.styleKeywords.join(", ")} aesthetic`;
  }
  return enhanced;
}

function buildProductPlacementPrompt(sceneDescription: string, brandContext: any) {
  const enhancedScene = enhancePromptWithFormula(sceneDescription, brandContext);
  return `
PRODUCT PLACEMENT INSTRUCTION:
Use the reference image EXACTLY. Insert the product into the scene below without modifying its appearance.

SCENE:
${enhancedScene}

PHOTOGRAPHIC REQUIREMENTS:
- Hero product shot
- Natural lighting + realistic shadows
- Product must be focal point
  `;
}

function buildChainPrompt(originalPrompt: string, refinement: string, depth: number) {
  const base = originalPrompt.replace(
    /\b(with|featuring|showing|adjust:|refinement:)\b.*/gi,
    ""
  ).trim();

  const r = refinement.toLowerCase();

  if (r.match(/\b(darker|lighter|brighter|cooler|warmer)\b/)) {
    return `${originalPrompt}. Adjust: ${refinement}`;
  }
  if (r.match(/\b(add|include|with)\b/)) {
    return `${originalPrompt}. ${refinement}`;
  }
  if (r.match(/\b(remove|without|exclude)\b/)) {
    return `${base}. ${refinement}`;
  }

  return `${originalPrompt}. Refinement: ${refinement}`;
}

function applyProModeControls(basePrompt: string, pro: any) {
  if (!pro || Object.keys(pro).length === 0) return basePrompt;

  const specs = [];
  if (pro.camera) specs.push(`📷 Camera: ${pro.camera}`);
  if (pro.lighting) specs.push(`💡 Lighting: ${pro.lighting}`);
  if (pro.environment) specs.push(`🌍 Environment: ${pro.environment}`);

  return (
    basePrompt +
    `

━━━ PRO MODE SPECIFICATIONS ━━━
${specs.join("\n")}
  
PHOTOGRAPHY DIRECTIVE:
Apply these professional settings exactly.
`
  );
}

/**
 * ------------------------------
 * MAIN EDGE FUNCTION
 * ------------------------------
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    /**
     * 1. Parse incoming request
     */
    const body = await req.json();

    const {
      prompt,
      organizationId,
      userId,
      goalType,
      aspectRatio,
      outputFormat = "png",
      selectedTemplate,
      userRefinements,
      referenceImages,
      brandContext,
      imageConstraints,

      parentImageId,
      isRefinement,
      refinementInstruction,
      parentPrompt,

      proModeControls,

      sessionId,

      product_id,
    } = body;

    console.log("🎨 Incoming Request", {
      goalType,
      aspectRatio,
      isRefinement,
      references: referenceImages?.length || 0,
      proMode: !!proModeControls,
    });

    /**
     * 2. Supabase Client
     */
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /**
     * 3. Resolve organizationId if missing
     */
    let resolvedOrgId = organizationId;

    if (!resolvedOrgId && parentImageId) {
      const { data } = await supabase
        .from("generated_images")
        .select("organization_id")
        .eq("id", parentImageId)
        .single();

      if (data?.organization_id) resolvedOrgId = data.organization_id;
    }

    if (!resolvedOrgId && userId) {
      const { data } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (data?.organization_id) resolvedOrgId = data.organization_id;
    }

    if (!resolvedOrgId) {
      return new Response(
        JSON.stringify({
          error: "Could not resolve organization.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    /**
     * 4. Load Brand Knowledge
     */
    const { data: brandKnowledgeData } = await supabase
      .from("brand_knowledge")
      .select("knowledge_type, content")
      .eq("organization_id", resolvedOrgId)
      .eq("is_active", true);

    const brandKnowledge = {
      visualStandards:
        brandKnowledgeData?.find((k) => k.knowledge_type === "visual_standards")
          ?.content || null,
      vocabulary:
        brandKnowledgeData?.find((k) => k.knowledge_type === "vocabulary")
          ?.content || null,
      brandVoice:
        brandKnowledgeData?.find((k) => k.knowledge_type === "brand_voice")
          ?.content || null,
    };

    /**
     * 5. Load Product Data (all 49 fields)
     */
    let productData = null;
    if (product_id) {
      const { data } = await supabase
        .from("brand_products")
        .select("*")
        .eq("id", product_id)
        .eq("organization_id", resolvedOrgId)
        .maybeSingle();
      productData = data || null;
    }

    /**
     * 6. Build enhanced prompt
     */
    let enhancedPrompt =
      isRefinement && refinementInstruction
        ? buildChainPrompt(parentPrompt || prompt, refinementInstruction, 0)
        : prompt;

    // Apply image constraints
    if (imageConstraints?.rewriteRules) {
      for (const [from, to] of Object.entries(imageConstraints.rewriteRules)) {
        enhancedPrompt = enhancedPrompt.replace(new RegExp(from, "gi"), to);
      }
    }

    if (imageConstraints?.prohibitedTerms) {
      for (const term of imageConstraints.prohibitedTerms) {
        enhancedPrompt = enhancedPrompt.replace(
          new RegExp(`\\b${term}\\b`, "gi"),
          ""
        );
      }
    }

    // Add brand knowledge (visual standards)
    if (brandKnowledge.visualStandards) {
      const vs = brandKnowledge.visualStandards;
      if (vs.color_palette?.length > 0) {
        enhancedPrompt += `\n\n🎨 BRAND COLORS: ${vs.color_palette
          .slice(0, 5)
          .map((c: any) => `${c.name} (${c.hex})`)
          .join(", ")}`;
      }
      if (vs.approved_props?.length > 0) {
        enhancedPrompt += `\n\n📦 APPROVED PROPS: ${vs.approved_props
          .slice(0, 20)
          .join(", ")}`;
      }
      if (vs.lighting_mandates) {
        enhancedPrompt += `\n\n💡 LIGHTING: ${vs.lighting_mandates}`;
      }
      if (vs.forbidden_elements?.length > 0) {
        enhancedPrompt += `\n\n🚫 FORBIDDEN: ${vs.forbidden_elements.join(
          ", "
        )}`;
      }
    }

    // Add 49 product fields (visual DNA)
    if (productData) {
      enhancedPrompt += formatVisualContext(productData);
    }

    // Aspect ratio note
    if (aspectRatio) {
      enhancedPrompt += `\n\n📐 ASPECT RATIO: ${aspectRatio}`;
    }

    // Chain parent reference auto-included
    let actualReferenceImages = referenceImages || [];

    if (isRefinement && parentImageId) {
      const { data: parent } = await supabase
        .from("generated_images")
        .select("image_url, final_prompt, chain_depth")
        .eq("id", parentImageId)
        .single();

      if (parent) {
        actualReferenceImages = [
          {
            url: parent.image_url,
            label: "Previous iteration",
            description: "Auto-included parent reference",
          },
          ...actualReferenceImages,
        ];
      }
    }

    // Apply Pro Mode
    if (proModeControls) {
      enhancedPrompt = applyProModeControls(enhancedPrompt, proModeControls);
    }

    /**
     * -------------------------
     * 7. Convert reference images to base64 (Gemini requirement)
     * -------------------------
     */
    const geminiContent: any[] = [
      {
        text: enhancedPrompt,
      },
    ];

    for (const ref of actualReferenceImages) {
      if (!ref.url) continue;

      const response = await fetch(ref.url);
      const buffer = await response.arrayBuffer();
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
      );

      geminiContent.push({
        inline_data: {
          mime_type: "image/png",
          data: base64,
        },
      });
    }

    /**
     * -------------------------
     * 8. Call Gemini 2.5 Flash Image Preview
     * -------------------------
     */
    const geminiURL =
      `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}?key=${GEMINI_API_KEY}`;

    const geminiResp = await fetch(geminiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: geminiContent,
          },
        ],
      }),
    });

    const geminiData = await geminiResp.json();

    if (!geminiResp.ok) {
      console.error("Gemini Error:", geminiData);
      throw new Error(`Gemini Error: ${JSON.stringify(geminiData)}`);
    }

    const base64Image =
      geminiData?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inline_data
      )?.inline_data?.data;

    if (!base64Image) {
      throw new Error(
        "Gemini returned no image. Check prompt and reference images."
      );
    }

    /**
     * -------------------------
     * 9. Upload image to Supabase Storage
     * -------------------------
     */
    const filename = `${resolvedOrgId}/${Date.now()}-${crypto.randomUUID()}.png`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("generated-images")
      .upload(filename, Uint8Array.from(atob(base64Image), (c) =>
        c.charCodeAt(0)
      ), {
        contentType: "image/png",
      });

    if (uploadErr) {
      console.error("Storage upload error", uploadErr);
      throw uploadErr;
    }

    const { data: urlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(filename);

    const imageUrl = urlData.publicUrl;

    /**
     * -------------------------
     * 10. Save DB record
     * -------------------------
     */
    const { data: savedImage, error: dbError } = await supabase
      .from("generated_images")
      .insert({
        organization_id: resolvedOrgId,
        user_id: userId,
        session_id: sessionId,
        goal_type: goalType,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        selected_template: selectedTemplate,
        user_refinements: userRefinements,

        final_prompt: enhancedPrompt,
        image_url: imageUrl,
        description: "Gemini 2.5 generated image",
        reference_images: actualReferenceImages,

        brand_context_used: {
          ...brandContext,
          knowledgeUsed: {
            hasVisualStandards: !!brandKnowledge.visualStandards,
          },
        },

        image_generator: "gemini-2.5-flash-image-preview",
        saved_to_library: true,
        parent_image_id: isRefinement ? parentImageId : null,
        chain_depth: isRefinement ? 1 : 0,
        is_chain_origin: !isRefinement,
        refinement_instruction: isRefinement ? refinementInstruction : null,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    /**
     * -------------------------
     * 11. Return response
     * -------------------------
     */
    return new Response(
      JSON.stringify({
        imageUrl,
        savedImageId: savedImage?.id,
        description: "Generated via Gemini",
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ generate-madison-image Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Image generation failed.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
