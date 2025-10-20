import { useState, useEffect } from 'react';
import { useCurrentOrganizationId } from './useIndustryConfig';
import { supabase } from '@/integrations/supabase/client';
import { 
  IMAGE_PROMPT_TEMPLATES, 
  getTemplatesForGoal, 
  type ImagePromptType 
} from '@/config/imagePromptGuidelines';

interface BrandStyleContext {
  colors: string[];
  styleKeywords: string[];
  voiceTone?: string;
}

export function useImagePromptBuilder(goalType: string, productName?: string) {
  const { orgId } = useCurrentOrganizationId();
  const [brandContext, setBrandContext] = useState<BrandStyleContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    const loadBrandContext = async () => {
      try {
        // Fetch brand_config for color palette
        const { data: orgData } = await supabase
          .from('organizations')
          .select('brand_config')
          .eq('id', orgId)
          .single();

        const brandConfig = orgData?.brand_config as any;
        
        // Fetch brand_knowledge for voice/tone/style keywords
        const { data: knowledgeData } = await supabase
          .from('brand_knowledge')
          .select('knowledge_type, content')
          .eq('organization_id', orgId)
          .eq('is_active', true);

        const colors = brandConfig?.color_palette || [];
        const voiceKnowledge = knowledgeData?.find(k => k.knowledge_type === 'voice_tone');
        const voiceTone = (voiceKnowledge?.content as any)?.brand_voice?.overall_voice;

        // Extract style keywords from content preferences
        const styleKeywords: string[] = [];
        knowledgeData?.forEach(k => {
          const content = k.content as any;
          if (content?.content_preferences?.preferred_vocabulary) {
            styleKeywords.push(...content.content_preferences.preferred_vocabulary.split(',').map((s: string) => s.trim()));
          }
        });

        setBrandContext({ colors, styleKeywords, voiceTone });
      } catch (error) {
        console.error('Error loading brand context:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandContext();
  }, [orgId]);

  const buildPromptOptions = (referenceDescription?: string): Array<{
    label: string;
    prompt: string;
    templateKey: ImagePromptType;
  }> => {
    const templateKeys = getTemplatesForGoal(goalType);
    
    return templateKeys.slice(0, 3).map((key, idx) => {
      const template = IMAGE_PROMPT_TEMPLATES[key];
      let prompt = template.prompt;

      // Replace product placeholder
      if (productName) {
        prompt = prompt.replace(/\{\{PRODUCT_NAME\}\}/g, productName);
      }

      // Inject brand colors if available
      if (brandContext?.colors.length) {
        const colorHints = brandContext.colors.slice(0, 2).join(' and ');
        prompt += ` Color palette emphasizes ${colorHints}.`;
      }

      // Inject brand style keywords
      if (brandContext?.styleKeywords.length) {
        const styleHint = brandContext.styleKeywords.slice(0, 3).join(', ');
        prompt += ` Brand aesthetic: ${styleHint}.`;
      }

      // Add reference description if provided
      if (referenceDescription) {
        prompt += ` Reference: ${referenceDescription}`;
      }

      // Add technical specs
      prompt += `\n\nAspect Ratio: ${template.aspectRatio}`;
      prompt += `\nLighting: ${template.lighting}`;
      prompt += `\nComposition: ${template.composition}`;
      prompt += `\nStyle: ${template.style}`;

      return {
        label: `Option ${String.fromCharCode(65 + idx)}: ${template.useCase}`,
        prompt,
        templateKey: key
      };
    });
  };

  const refinePrompt = (basePrompt: string, userRefinement: string): string => {
    // Simple refinement logic
    const refinements: Record<string, string> = {
      'brighter': 'Increase brightness by 20%, add more fill light',
      'darker': 'Reduce exposure, add dramatic shadows',
      'more shadows': 'Increase shadow depth and contrast',
      'desert backdrop': 'Set against sand dunes and desert landscape',
      'cleaner': 'Minimize props, increase negative space, ultra-minimal',
      'lifestyle': 'Add hands in frame, natural home setting, authentic moment'
    };

    const lowerRefinement = userRefinement.toLowerCase();
    for (const [key, value] of Object.entries(refinements)) {
      if (lowerRefinement.includes(key)) {
        return `${basePrompt}\n\nRefinement: ${value}`;
      }
    }

    // Fallback: append user's words directly
    return `${basePrompt}\n\nUser direction: ${userRefinement}`;
  };

  return {
    brandContext,
    loading,
    buildPromptOptions,
    refinePrompt
  };
}
