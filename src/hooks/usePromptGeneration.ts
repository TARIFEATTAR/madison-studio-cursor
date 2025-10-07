import { IMAGE_PROMPT_TEMPLATES, type ImagePromptType } from "@/config/imagePromptGuidelines";
import { generateBlogPrompt, type BlogPostType } from "@/config/blogPostGuidelines";

export interface FormData {
  title: string;
  contentType: string;
  collection: string;
  dipWeek: string;
  scentFamily: string;
  pillar: string;
  customInstructions: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  imageTemplate: ImagePromptType;
}

export interface BlogData {
  blogPostType: BlogPostType;
  blogWordCount: number;
  blogSubject: string;
  blogThemes: string[];
  blogTakeaway: string;
  blogProductConnection: string;
}

export function generatePromptText(formData: FormData, blogData?: BlogData): string {
  const parts = [];
  
  // For blog posts, use specialized blog prompt generator
  if (formData.contentType === 'blog' && blogData) {
    return generateBlogPrompt({
      postType: blogData.blogPostType,
      pillar: formData.pillar || 'Identity',
      wordCount: blogData.blogWordCount,
      dipWeek: formData.dipWeek ? parseInt(formData.dipWeek) : undefined,
      subject: blogData.blogSubject,
      themes: blogData.blogThemes.filter(t => t.trim().length > 0),
      takeaway: blogData.blogTakeaway,
      productConnection: blogData.blogProductConnection || undefined,
    });
  }
  
  // For visual assets, use standardized image prompt templates
  if (formData.contentType === 'visual') {
    const template = IMAGE_PROMPT_TEMPLATES[formData.imageTemplate];
    
    // Start with the base template prompt
    let visualPrompt = template.prompt;
    
    // Replace generic "attar bottle" with specific product name
    if (formData.title) {
      visualPrompt = visualPrompt.replace(/attar bottle/gi, `${formData.title} attar bottle`);
    }
    
    // Add product context
    parts.push(visualPrompt);
    
    // Add technical specifications
    parts.push(`\n--- Technical Specifications ---`);
    parts.push(`Aspect Ratio: ${template.aspectRatio}`);
    parts.push(`Use Case: ${template.useCase}`);
    parts.push(`Lighting: ${template.lighting}`);
    parts.push(`Composition: ${template.composition}`);
    parts.push(`Style: ${template.style}`);
    
    // Add fragrance context to enhance image generation
    if (formData.scentFamily) {
      parts.push(`\nScent Family Context: ${formData.scentFamily}`);
    }
    
    // Add custom visual instructions if provided
    if (formData.customInstructions) {
      parts.push(`\nAdditional Direction: ${formData.customInstructions}`);
    }
    
    return parts.join('\n');
  }
  
  // Standard prompt generation for other content types
  if (formData.title) {
    parts.push(`Product: ${formData.title}`);
  }
  
  if (formData.contentType) {
    const contentTypes: Record<string, string> = {
      product: "Product Description",
      email: "Email Campaign",
      social: "Social Media",
      visual: "Visual Asset",
      blog: "Blog Post",
    };
    parts.push(`Content Type: ${contentTypes[formData.contentType] || formData.contentType}`);
  }
  
  if (formData.collection) {
    parts.push(`Collection: ${formData.collection}`);
  }
  
  if (formData.scentFamily) {
    parts.push(`Scent Family: ${formData.scentFamily}`);
  }
  
  if (formData.pillar) {
    parts.push(`Focus on the ${formData.pillar} pillar.`);
  }

  if (formData.customInstructions) {
    parts.push(`\n\n${formData.customInstructions}`);
  }

  parts.push(`\n\nIMPORTANT: Return output as plain text only. Do not use any Markdown formatting (no asterisks, bold, italics, headers, etc.). Output should be clean copy-paste ready text.`);

  return parts.join(" ");
}