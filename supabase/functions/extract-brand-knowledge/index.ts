import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, organizationId, documentName, detectVisualStandards } = await req.json();

    if (!extractedText || !organizationId) {
      throw new Error('extractedText and organizationId are required');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Extracting brand knowledge from ${documentName || 'document'} for org: ${organizationId}`);
    
    // Detect if this is a visual standards document
    const isVisualStandards = detectVisualStandards || 
      /visual|photo|image|lighting|color palette|aspect ratio|template|composition|forbidden element/i.test(extractedText.slice(0, 2000));

    // Different extraction prompts based on document type
    let extractionPrompt: string;
    
    if (isVisualStandards) {
      extractionPrompt = `You are analyzing VISUAL STANDARDS for AI-generated product photography.

Extract structured visual guidelines from this document:

DOCUMENT TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extractedText.slice(0, 50000)} 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return your analysis as a JSON object with this exact structure:

{
  "visual_standards": {
    "golden_rule": "The overarching visual philosophy (e.g., 'If it looks like an ad, it fails')",
    "color_palette": [
      {
        "name": "Stone Beige",
        "hex": "#D8C8A9",
        "usage": "Primary background color for product shots"
      }
    ],
    "lighting_mandates": "Lighting requirements (e.g., 'Always golden hour, never harsh studio lighting')",
    "templates": [
      {
        "name": "Hero Product Shot",
        "aspectRatio": "4:5",
        "prompt": "Example prompt template for this style"
      }
    ],
    "forbidden_elements": ["chrome", "glossy surfaces", "white backgrounds"],
    "approved_props": ["aged brass", "matte ceramic", "natural linen"],
    "raw_document": "FULL EXTRACTED TEXT HERE - include everything"
  }
}

CRITICAL: Extract ALL visual standards mentioned. Include the FULL raw document text.`;
    } else {
      extractionPrompt = `You are a brand strategist analyzing brand guidelines for a luxury beauty brand to extract structured knowledge.

Analyze the following brand document and detect if it contains category-specific information for:
- **Personal Fragrance**: Perfume oils, sprays, attars, essential oils, solid perfumes
- **Home Fragrance**: Incense, bakhoor, oud wood chips, candles, reed diffusers, room sprays
- **Skincare**: Serums, creams, cleansers, toners, masks

DOCUMENT TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extractedText.slice(0, 50000)} 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return your analysis as a JSON object with this exact structure:

{
  "voice": {
    "toneAttributes": ["sophisticated", "warm"],
    "personalityTraits": ["confident", "authentic"],
    "writingStyle": "description of overall writing approach",
    "keyCharacteristics": ["concise sentences", "sensory language"]
  },
  "vocabulary": {
    "approvedTerms": ["fragrance", "composition", "notes"],
    "forbiddenPhrases": ["game-changing", "must-have"],
    "industryTerminology": ["olfactory", "sillage"],
    "preferredPhrasing": {"composition": "formula"}
  },
  "examples": {
    "goodExamples": [
      {
        "text": "Example of on-brand copy",
        "analysis": "Why this works"
      }
    ],
    "badExamples": [
      {
        "text": "Example to avoid",
        "analysis": "Why to avoid"
      }
    ]
  },
  "structure": {
    "sentenceStructure": "Mix of short and flowing",
    "paragraphLength": "Short to medium",
    "punctuationStyle": "Strategic use of em-dashes",
    "rhythmPatterns": "Varied cadence"
  },
  "categories": {
    "personal_fragrance": {
      "detected": true,
      "vocabulary": ["wearable", "skin chemistry", "projection"],
      "product_types": ["oil", "spray", "attar", "essential_oil", "solid_perfume"],
      "copy_style_notes": "How to write for personal fragrances"
    },
    "home_fragrance": {
      "detected": false,
      "vocabulary": [],
      "product_types": [],
      "copy_style_notes": ""
    },
    "skincare": {
      "detected": false,
      "vocabulary": [],
      "product_types": [],
      "copy_style_notes": ""
    }
  }
}

CRITICAL INSTRUCTIONS:
- Set "detected": true ONLY if the document explicitly mentions that category
- Extract category-specific vocabulary and product types
- For undetected categories, set detected: false with empty arrays
- Return ONLY valid JSON, no additional commentary`;
    }

    // Call Lovable AI (Claude)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    console.log('Raw AI response:', extractedContent.substring(0, 500));

    // Parse JSON from response (handle markdown code blocks if present)
    let parsedKnowledge;
    try {
      // Remove markdown code blocks if present
      const cleanJson = extractedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedKnowledge = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response was:', extractedContent);
      
      // Return partial data if parsing fails
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to parse extraction results',
          rawResponse: extractedContent.substring(0, 1000)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log(`Successfully extracted brand knowledge from ${documentName}`);
    
    // Return different structure based on document type
    if (isVisualStandards && parsedKnowledge.visual_standards) {
      console.log('Visual standards detected:', parsedKnowledge.visual_standards.golden_rule);
      return new Response(
        JSON.stringify({
          success: true,
          isVisualStandards: true,
          visualStandards: parsedKnowledge.visual_standards
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Voice attributes:', parsedKnowledge.voice?.toneAttributes);
      console.log('Approved terms count:', parsedKnowledge.vocabulary?.approvedTerms?.length);
      
      return new Response(
        JSON.stringify({
          success: true,
          isVisualStandards: false,
          voice: parsedKnowledge.voice,
          vocabulary: parsedKnowledge.vocabulary,
          examples: parsedKnowledge.examples,
          structure: parsedKnowledge.structure,
          categories: parsedKnowledge.categories || {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in extract-brand-knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
