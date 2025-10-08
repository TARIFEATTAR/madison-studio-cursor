/**
 * Blog Post Content Guidelines for Scriptora
 * Implements three-act structure and brand voice validation
 */

export const BLOG_POST_TYPES = {
  philosophy: {
    label: 'Philosophy Post',
    description: 'Establish thought leadership through contemplative exploration',
    wordCountRange: [1200, 1800],
    structure: 'Philosophical exploration with multiple perspectives',
    pillars: ['Identity', 'Remembrance'],
  },
  origin: {
    label: 'Origin Story',
    description: 'Build brand narrative through storytelling',
    wordCountRange: [1000, 1500],
    structure: 'Journey-based narrative structure',
    pillars: ['Memory', 'Remembrance'],
  },
  craft: {
    label: 'Craft Deep-Dive',
    description: 'Demonstrate expertise through detailed exploration',
    wordCountRange: [1500, 2000],
    structure: 'Technical detail with narrative flow',
    pillars: ['Remembrance'],
  },
  commentary: {
    label: 'Cultural Commentary',
    description: 'Position brand perspective on cultural topics',
    wordCountRange: [800, 1200],
    structure: 'Cultural analysis with brand perspective',
    pillars: ['Identity', 'Memory'],
  },
  guide: {
    label: 'Practical Guide',
    description: 'Provide actionable guidance and utility',
    wordCountRange: [1000, 1500],
    structure: 'Step-by-step approach with examples',
    pillars: ['Identity'],
  },
} as const;

export type BlogPostType = keyof typeof BLOG_POST_TYPES;

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
  { value: 'email_3part', label: '3-Part Email Sequence', description: 'Welcome/Value/Invitation flow (3 days)' },
  { value: 'email_5part', label: '5-Part Email Sequence', description: 'Extended nurture sequence (5 days)' },
  { value: 'email_7part', label: '7-Part Email Sequence', description: 'Deep dive journey (7 days)' },
];

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
- Opening line should ${params.postType === 'philosophy' ? 'question assumptions' : params.postType === 'origin' ? 'set the scene' : 'make an observation'}
- Establish context and relevance
- Promise value to the reader

ACT II - THE EXPLORATION (${Math.round(params.wordCount * 0.7)} words approx):
- Use ${typeInfo.structure} approach
- Include 2-3 main sections with H2 subheadings
- Provide concrete examples and insights
- Maintain consistent brand voice throughout

ACT III - THE RESOLUTION (150-250 words):
- Synthesize key insights
- Clear call to action connecting to ${params.productConnection || 'next steps'}
- Strong closing statement

STRUCTURE NOTES:
- Adapt to your brand's unique voice and tone
- Use formatting that enhances readability
- Include relevant examples and evidence
- Maintain consistency with brand guidelines

IMPORTANT: Return output as clean text with proper paragraph breaks. Use H2 headers (##) for main sections. No excessive formatting.

GENERATE THE BLOG POST NOW.`;
}
