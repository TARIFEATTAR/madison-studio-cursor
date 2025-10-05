/**
 * Blog Post Content Guidelines for Scriptorium
 * Implements three-act structure and brand voice validation
 */

export const BLOG_POST_TYPES = {
  philosophy: {
    label: 'Philosophy Post',
    description: 'Establish thought leadership through contemplative exploration',
    wordCountRange: [1200, 1800],
    structure: 'Philosophical exploration with 3 perspectives',
    pillars: ['Identity', 'Remembrance'],
  },
  origin: {
    label: 'Origin Story',
    description: 'Build brand mythology through narrative journey',
    wordCountRange: [1000, 1500],
    structure: 'Journey from discovery to present understanding',
    pillars: ['Memory', 'Remembrance'],
  },
  craft: {
    label: 'Craft Deep-Dive',
    description: 'Demonstrate expertise through technical reverence',
    wordCountRange: [1500, 2000],
    structure: 'Technical detail made poetic',
    pillars: ['Remembrance'],
  },
  commentary: {
    label: 'Cultural Commentary',
    description: 'Position against Trophy Perfume culture',
    wordCountRange: [800, 1200],
    structure: 'Cultural critique with empathy',
    pillars: ['Identity', 'Memory'],
  },
  guide: {
    label: 'Practical Guide',
    description: 'Provide genuine utility with thoughtful approach',
    wordCountRange: [1000, 1500],
    structure: 'Step-by-step thoughtful approach',
    pillars: ['Identity'],
  },
} as const;

export type BlogPostType = keyof typeof BLOG_POST_TYPES;

export const APPROVED_VOCABULARY = {
  always: [
    'presence', 'movement', 'cadence',
    'intimate', 'close', 'personal',
    'companion', 'anchor', 'vessel',
    'ritual', 'practice', 'intention',
    'gather', 'unfold', 'persist',
    'contemplative', 'quiet', 'restrained',
  ],
  forbidden: [
    'amazing', 'incredible', 'awesome',
    'game-changer', 'revolutionary',
    'must-have', "can't live without",
    'trending', 'viral', 'hot',
    'hacks', 'tips & tricks', 'secrets',
    'click here', 'check out', "don't miss",
  ],
};

export const BLOG_STRUCTURE_TEMPLATE = `
ACT I: THE HOOK (15% of word count)
• Opening scene or question
• Establishes emotional context
• Makes reader lean in

ACT II: THE EXPLORATION (70% of word count)
• Core argument or narrative
• Evidence, examples, stories
• Multiple perspectives or sections

ACT III: THE RESOLUTION (15% of word count)
• Synthesis and key takeaway
• Gentle call to reflection or action
• Leaves reader changed
`;

export const BLOG_REPURPOSE_TARGETS = [
  { value: 'email', label: 'Email Newsletter (300 words)', description: 'Condensed with subject lines' },
  { value: 'instagram', label: 'Instagram Carousel (5-7 slides)', description: 'Visual slides + caption' },
  { value: 'twitter', label: 'Twitter Thread (8-12 tweets)', description: 'Progressive narrative flow' },
  { value: 'linkedin', label: 'LinkedIn Post (500 words)', description: 'Professional tone variant' },
  { value: 'sms', label: 'SMS Teaser (140 chars)', description: 'Single concept extraction' },
];

/**
 * Validate blog post content against brand voice rules
 */
export function validateBlogVoice(content: string): {
  forbiddenWords: string[];
  approvedCount: number;
  hasEmoji: boolean;
  sentenceVariety: number;
} {
  const lowerContent = content.toLowerCase();
  
  // Check forbidden words
  const forbiddenWords = APPROVED_VOCABULARY.forbidden.filter(word => 
    lowerContent.includes(word.toLowerCase())
  );
  
  // Count approved vocabulary usage
  const approvedCount = APPROVED_VOCABULARY.always.filter(word =>
    lowerContent.includes(word.toLowerCase())
  ).length;
  
  // Check for emojis (simple regex)
  const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content);
  
  // Calculate sentence variety (basic heuristic)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  const variance = sentences.map(s => {
    const len = s.split(' ').length;
    return Math.abs(len - avgLength);
  }).reduce((sum, v) => sum + v, 0) / sentences.length;
  
  const sentenceVariety = Math.min(100, Math.round((variance / avgLength) * 100));
  
  return {
    forbiddenWords,
    approvedCount,
    hasEmoji,
    sentenceVariety,
  };
}

/**
 * Generate blog post prompt based on user inputs
 */
export function generateBlogPrompt(params: {
  postType: BlogPostType;
  pillar: string;
  wordCount: number;
  dipWeek?: number;
  subject: string;
  themes: string[];
  takeaway: string;
  productConnection?: string;
}): string {
  const typeInfo = BLOG_POST_TYPES[params.postType];
  
  return `BLOG POST GENERATION REQUEST

Post Type: ${typeInfo.label}
Target Pillar: ${params.pillar}
Word Count: ${params.wordCount}
${params.dipWeek ? `DIP Week: Week ${params.dipWeek}` : ''}

SUBJECT/TOPIC:
${params.subject}

KEY THEMES:
${params.themes.map((t, i) => `${i + 1}. ${t}`).join('\n')}

DESIRED TAKEAWAY:
${params.takeaway}

${params.productConnection ? `PRODUCT CONNECTION:\n${params.productConnection}\n` : ''}

---

STRUCTURE INSTRUCTIONS:

ACT I - THE HOOK (150-300 words):
- Opening line must ${params.postType === 'philosophy' ? 'question assumption' : params.postType === 'origin' ? 'paint vivid scene' : 'make unexpected observation'}
- Establish emotional stakes
- Promise transformation of understanding

ACT II - THE EXPLORATION (${Math.round(params.wordCount * 0.7)} words approx):
- Use ${typeInfo.structure} approach
- Include 2-3 main sections with H2 subheadings
- Draw metaphors from craftsmanship, ritual, nature, architecture
- Maintain "Confident Whisper" tone throughout

ACT III - THE RESOLUTION (150-250 words):
- Synthesize key insights
- Gentle CTA connecting to ${params.productConnection || 'brand philosophy'}
- Memorable closing line that echoes opening

TONE REQUIREMENTS:
- Sophisticated, contemplative, editorial
- No superlatives, no sales language
- Vary sentence length deliberately
- Use present tense for immediacy

VOCABULARY MANDATE:
- Always use: presence, intimate, companion, ritual, cadence
- Never use: amazing, game-changer, must-have, click here

IMPORTANT: Return output as clean text with proper paragraph breaks. Use H2 headers (##) for main sections. No excessive formatting.

GENERATE THE BLOG POST NOW.`;
}
