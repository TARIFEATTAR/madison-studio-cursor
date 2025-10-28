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
    
    // Check if document contains visual standards sections
    const hasVisualStandards = detectVisualStandards || 
      /visual standards|image generation|photography guidelines|product photography|lighting guidelines|composition rules|color palette guidelines/i.test(extractedText);

    // ALWAYS extract brand voice/vocabulary, AND extract visual standards if present
    let extractionPrompt: string;
    
    if (hasVisualStandards) {
      // Extract BOTH brand voice AND visual standards
      extractionPrompt = `You are a brand strategist analyzing comprehensive brand guidelines.

DOCUMENT TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extractedText.slice(0, 50000)} 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This document contains BOTH brand voice guidelines AND visual standards. Extract BOTH.

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
    "forbiddenPhrases": ["game-changing", "must-have", "indulge", "treat yourself", "whisper rather than declaration", "embark on a journey"],
    "industryTerminology": ["olfactory", "sillage"],
    "preferredPhrasing": {"composition": "formula"},
    "avoidHistoricalReferences": true
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
  "visual_standards": {
    "golden_rule": "The overarching visual philosophy",
    "color_palette": [
      {
        "name": "Stone Beige",
        "hex": "#D8C8A9",
        "usage": "Primary background"
      }
    ],
    "lighting_mandates": "Lighting requirements",
    "templates": [
      {
        "name": "Hero Product Shot",
        "aspectRatio": "4:5",
        "prompt": "Example prompt template"
      }
    ],
    "forbidden_elements": ["chrome", "glossy surfaces"],
    "approved_props": ["aged brass", "matte ceramic"],
    "raw_document": "FULL EXTRACTED TEXT - include everything from visual standards section"
  },
  "categories": {
    "personal_fragrance": {
      "detected": true,
      "vocabulary": ["wearable", "skin chemistry"],
      "product_types": ["oil", "spray"],
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
- Extract BOTH voice/vocabulary AND visual standards if present
- Pay special attention to forbidden phrases and what NOT to write
- Include historical/religious references in forbiddenPhrases if mentioned
- For categories, set "detected": true ONLY if explicitly mentioned
- Return ONLY valid JSON, no additional commentary`;
    } else {
      // Extract brand voice/vocabulary only (no visual standards detected)
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
    if (hasVisualStandards && parsedKnowledge.visual_standards) {
      console.log('Visual standards detected:', parsedKnowledge.visual_standards.golden_rule);
      return new Response(
        JSON.stringify({
          success: true,
          isVisualStandards: true,
          visualStandards: parsedKnowledge.visual_standards,
          voice: parsedKnowledge.voice,
          vocabulary: parsedKnowledge.vocabulary,
          examples: parsedKnowledge.examples,
          structure: parsedKnowledge.structure,
          categories: parsedKnowledge.categories || {}
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
