/**
 * Content-to-Visual Prompts Generator
 * 
 * Analyzes master content (blogs, articles, etc.) and generates
 * visual prompts that capture the same thematic DNA:
 * - Image Pack: Hero, Social, Email image prompts
 * - Video Script: Hero, Reel, Story video prompts
 * - Product Backgrounds: Scene prompts for product photography
 * 
 * @module contentToVisualPrompts
 */

import Anthropic from '@anthropic-ai/sdk';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentAnalysis {
  themes: string[];           // "luxury", "intimacy", "transformation"
  mood: string;               // "contemplative", "energetic", "serene"
  visualElements: string[];   // "golden light", "marble surfaces"
  colorPalette: string[];     // extracted or inferred colors
  actions: string[];          // movement/transformation cues for video
  surfaces: string[];         // materials/textures for backgrounds
  atmosphere: string;         // overall feeling
  suggestedVisualMaster: string;
}

export interface ImagePrompt {
  prompt: string;
  aspectRatio: string;
  purpose: string;
  negativePrompt?: string;
}

export interface VideoPrompt {
  prompt: string;
  duration: string;
  purpose: string;
  cameraMovement?: string;
}

export interface BackgroundPrompt {
  prompt: string;
  aspectRatio: string;
  purpose: string;
  surface: string;
  lighting: string;
}

export interface ImagePackOutput {
  hero: ImagePrompt;
  social: ImagePrompt;
  emailHeader: ImagePrompt;
}

export interface VideoScriptOutput {
  hero: VideoPrompt;
  reel: VideoPrompt;
  story: VideoPrompt;
}

export interface ProductBackgroundOutput {
  productHero: BackgroundPrompt;
  lifestyle: BackgroundPrompt;
  detail: BackgroundPrompt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

const ANALYSIS_SYSTEM_PROMPT = `You are Madison's Visual Intelligence module. Your job is to analyze written content and extract its visual DNA - the themes, mood, colors, textures, and atmosphere that would translate into compelling imagery.

You have a deep understanding of:
- Visual storytelling and composition
- Color psychology and mood
- Photography styles (Avedon's isolation, Leibovitz's environmental, Richardson's bold, Anderson's symmetry)
- Cinematic language and movement
- Product photography and styling

Extract the essence that makes this content unique and translate it into visual language.`;

export async function analyzeContent(content: string, title?: string): Promise<ContentAnalysis> {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const userPrompt = `Analyze this content and extract its visual DNA:

<CONTENT>
${title ? `Title: ${title}\n\n` : ''}${content}
</CONTENT>

Extract and return a JSON object with:
{
  "themes": ["array of 3-5 key themes"],
  "mood": "single word or short phrase describing the emotional tone",
  "visualElements": ["5-8 specific visual elements mentioned or implied"],
  "colorPalette": ["4-6 colors that match this content's feeling"],
  "actions": ["3-5 movements or transformations for video"],
  "surfaces": ["3-5 materials/textures for product backgrounds"],
  "atmosphere": "2-3 sentence description of the overall atmosphere",
  "suggestedVisualMaster": "AVEDON_ISOLATION | LEIBOVITZ_ENVIRONMENT | RICHARDSON_RAW | ANDERSON_SYMMETRY"
}

Return ONLY the JSON object, no other text.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ContentAnalysis;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('[ContentAnalyzer] Failed to parse analysis:', error);
    // Return default analysis
    return {
      themes: ['elegance', 'quality', 'craftsmanship'],
      mood: 'sophisticated',
      visualElements: ['soft lighting', 'clean lines', 'premium materials'],
      colorPalette: ['#1A1816', '#B8956A', '#F5F1E8', '#2F2A26'],
      actions: ['slow reveal', 'gentle movement', 'light play'],
      surfaces: ['marble', 'wood', 'linen'],
      atmosphere: 'A refined, contemplative atmosphere with attention to detail and quiet luxury.',
      suggestedVisualMaster: 'LEIBOVITZ_ENVIRONMENT',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE PACK GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const IMAGE_PACK_SYSTEM_PROMPT = `You are Madison's Image Prompt specialist. You create prompts for AI image generation that capture the soul of written content.

Your prompts follow this structure:
- Subject: What is the main focus
- Setting: Environment and context
- Lighting: Quality, direction, mood
- Style: Photography reference or aesthetic
- Technical: Resolution, aspect ratio hints

You know how to optimize prompts for different platforms:
- Hero images: Editorial quality, can be complex and layered
- Social: Bold, scroll-stopping, centered subject, high contrast
- Email headers: Clean, minimal, horizontal, draws eye to content below

Never include text or logos in prompts. Focus on visual storytelling.`;

export async function generateImagePack(
  content: string,
  analysis: ContentAnalysis,
  brandColors?: string[]
): Promise<ImagePackOutput> {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const colorContext = brandColors?.length 
    ? `Brand colors to incorporate: ${brandColors.join(', ')}`
    : `Suggested palette: ${analysis.colorPalette.join(', ')}`;

  const userPrompt = `Based on this content analysis, generate 3 image prompts:

<ANALYSIS>
Themes: ${analysis.themes.join(', ')}
Mood: ${analysis.mood}
Visual Elements: ${analysis.visualElements.join(', ')}
${colorContext}
Atmosphere: ${analysis.atmosphere}
Suggested Style: ${analysis.suggestedVisualMaster}
</ANALYSIS>

Generate prompts for:
1. HERO (16:9) - Editorial quality for website/blog headers
2. SOCIAL (1:1) - Bold, scroll-stopping for Instagram
3. EMAIL (3:1) - Clean, minimal for email headers

Return JSON:
{
  "hero": {
    "prompt": "detailed prompt for hero image",
    "aspectRatio": "16:9",
    "purpose": "Blog/website header",
    "negativePrompt": "things to avoid"
  },
  "social": {
    "prompt": "detailed prompt for social image",
    "aspectRatio": "1:1",
    "purpose": "Instagram/social media",
    "negativePrompt": "things to avoid"
  },
  "emailHeader": {
    "prompt": "detailed prompt for email header",
    "aspectRatio": "3:1",
    "purpose": "Email newsletter header",
    "negativePrompt": "things to avoid"
  }
}

Return ONLY the JSON object.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: IMAGE_PACK_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ImagePackOutput;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('[ImagePack] Failed to parse prompts:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO SCRIPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const VIDEO_SCRIPT_SYSTEM_PROMPT = `You are Madison's Video Prompt specialist. You create prompts for AI video generation that bring written content to life.

Your video prompts follow best practices:
- Subject: Clear description of what/who is in frame
- Action: What is happening (movement, transformation)
- Setting: Environment and context
- Camera: Shot type, movement, angle
- Mood/Lighting: Atmosphere and visual tone
- Duration hint: Pacing guidance

You optimize for different formats:
- Hero (10-15s): Cinematic, can have multiple shots, editorial quality
- Reel (5-8s): Single compelling action, vertical-friendly, attention-grabbing
- Story (3-5s): Quick, punchy, one clear moment

Focus on movement and transformation. AI video excels at: slow motion, time-lapse, gentle movements, atmospheric effects.`;

export async function generateVideoScript(
  content: string,
  analysis: ContentAnalysis
): Promise<VideoScriptOutput> {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const userPrompt = `Based on this content analysis, generate 3 video prompts:

<ANALYSIS>
Themes: ${analysis.themes.join(', ')}
Mood: ${analysis.mood}
Visual Elements: ${analysis.visualElements.join(', ')}
Actions/Movements: ${analysis.actions.join(', ')}
Atmosphere: ${analysis.atmosphere}
</ANALYSIS>

Generate prompts for:
1. HERO (10-15s) - Cinematic for website/landing page
2. REEL (5-8s) - Vertical-friendly for Instagram/TikTok
3. STORY (3-5s) - Quick attention grab

Return JSON:
{
  "hero": {
    "prompt": "detailed video prompt with subject, action, setting, camera, lighting",
    "duration": "10-15s",
    "purpose": "Website/landing page hero",
    "cameraMovement": "slow dolly in / static / pan / etc"
  },
  "reel": {
    "prompt": "detailed video prompt optimized for vertical",
    "duration": "5-8s",
    "purpose": "Instagram Reels/TikTok",
    "cameraMovement": "camera movement description"
  },
  "story": {
    "prompt": "short punchy video prompt",
    "duration": "3-5s",
    "purpose": "Stories/quick attention",
    "cameraMovement": "camera movement description"
  }
}

Return ONLY the JSON object.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: VIDEO_SCRIPT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as VideoScriptOutput;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('[VideoScript] Failed to parse prompts:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT BACKGROUND GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const BACKGROUND_SYSTEM_PROMPT = `You are Madison's Product Background specialist. You create scene/background prompts for product photography that capture the mood of written content WITHOUT including the product itself.

These backgrounds are designed for:
- Composite product shots (product added digitally later)
- AI background removal/replacement
- Lifestyle context scenes

Your prompts focus on:
- Surface/Material: What the product would sit on
- Environment: Surrounding context (studio, nature, interior)
- Props/Elements: Complementary objects that enhance the story (NOT the product)
- Lighting: Direction, quality, color temperature
- Mood: Atmosphere that matches the content

CRITICAL: Never include the actual product. These are BACKGROUNDS ONLY.
Always end prompts with "--no product --no bottle --no package" or similar.`;

export async function generateProductBackgrounds(
  content: string,
  analysis: ContentAnalysis,
  productType?: string
): Promise<ProductBackgroundOutput> {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const productContext = productType 
    ? `Product type (for context only, DO NOT include in background): ${productType}`
    : 'General luxury product';

  const userPrompt = `Based on this content analysis, generate 3 product background prompts:

<ANALYSIS>
Themes: ${analysis.themes.join(', ')}
Mood: ${analysis.mood}
Visual Elements: ${analysis.visualElements.join(', ')}
Surfaces/Materials: ${analysis.surfaces.join(', ')}
Colors: ${analysis.colorPalette.join(', ')}
Atmosphere: ${analysis.atmosphere}
${productContext}
</ANALYSIS>

Generate BACKGROUND-ONLY prompts for:
1. PRODUCT HERO (1:1) - Clean, centered space for main product shot
2. LIFESTYLE (16:9) - Wider environmental context
3. DETAIL (4:5) - Textured close-up for Pinterest/editorial

Return JSON:
{
  "productHero": {
    "prompt": "detailed background prompt with surface, lighting, atmosphere --no product",
    "aspectRatio": "1:1",
    "purpose": "E-commerce main image background",
    "surface": "primary surface material",
    "lighting": "lighting description"
  },
  "lifestyle": {
    "prompt": "wider environmental background prompt --no product",
    "aspectRatio": "16:9",
    "purpose": "Website banner background",
    "surface": "primary surface material",
    "lighting": "lighting description"
  },
  "detail": {
    "prompt": "textured detail background prompt --no product",
    "aspectRatio": "4:5",
    "purpose": "Pinterest/editorial background",
    "surface": "primary surface material",
    "lighting": "lighting description"
  }
}

IMPORTANT: All prompts must end with "--no product --no bottle --no package --no item"

Return ONLY the JSON object.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: BACKGROUND_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ProductBackgroundOutput;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('[ProductBackground] Failed to parse prompts:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete Image Pack from master content
 */
export async function generateImagePackFromContent(
  content: string,
  title?: string,
  brandColors?: string[]
): Promise<{ analysis: ContentAnalysis; images: ImagePackOutput }> {
  console.log('[VisualPrompts] Generating Image Pack...');
  
  const analysis = await analyzeContent(content, title);
  console.log('[VisualPrompts] Content analyzed:', analysis.mood, analysis.themes);
  
  const images = await generateImagePack(content, analysis, brandColors);
  console.log('[VisualPrompts] Image Pack generated');
  
  return { analysis, images };
}

/**
 * Generate Video Scripts from master content
 */
export async function generateVideoScriptFromContent(
  content: string,
  title?: string
): Promise<{ analysis: ContentAnalysis; videos: VideoScriptOutput }> {
  console.log('[VisualPrompts] Generating Video Scripts...');
  
  const analysis = await analyzeContent(content, title);
  console.log('[VisualPrompts] Content analyzed:', analysis.mood, analysis.actions);
  
  const videos = await generateVideoScript(content, analysis);
  console.log('[VisualPrompts] Video Scripts generated');
  
  return { analysis, videos };
}

/**
 * Generate Product Backgrounds from master content
 */
export async function generateProductBackgroundsFromContent(
  content: string,
  title?: string,
  productType?: string
): Promise<{ analysis: ContentAnalysis; backgrounds: ProductBackgroundOutput }> {
  console.log('[VisualPrompts] Generating Product Backgrounds...');
  
  const analysis = await analyzeContent(content, title);
  console.log('[VisualPrompts] Content analyzed:', analysis.mood, analysis.surfaces);
  
  const backgrounds = await generateProductBackgrounds(content, analysis, productType);
  console.log('[VisualPrompts] Product Backgrounds generated');
  
  return { analysis, backgrounds };
}
