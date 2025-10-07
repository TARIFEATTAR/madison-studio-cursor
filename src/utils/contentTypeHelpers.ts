/**
 * Content Type Naming System
 * 
 * This app uses two types of content:
 * 
 * 1. MASTER CONTENT (created in Composer):
 *    - blog_post: Long-form narrative content (500-1000+ words)
 *    - email_newsletter: Single email newsletter piece
 *    - product_story: Narrative about a product (100-300 words)
 *    - brand_announcement: Important brand updates
 * 
 * 2. DERIVATIVE ASSETS (generated in Amplify):
 *    Created FROM master content and formatted for specific platforms:
 *    - email: Single email piece
 *    - email_3part/5part/7part: Multi-part email sequences
 *    - instagram: Instagram carousel posts
 *    - twitter: Twitter thread
 *    - product: Product description (short, sales-focused)
 *    - sms: SMS message
 *    - linkedin: LinkedIn post
 * 
 * KEY DISTINCTIONS:
 * - "Email Newsletter" (master) = Original long newsletter content
 * - "Email" (derivative) = Shorter adapted email from any master content
 * - "Product Story" (master) = Narrative storytelling about a product
 * - "Product Description" (derivative) = Short, sales-focused product copy
 */

export const MASTER_CONTENT_TYPE_LABELS: Record<string, string> = {
  blog_post: "Blog Post",
  email_newsletter: "Email Newsletter",
  product_story: "Product Story",
  brand_announcement: "Brand Announcement",
};

export const MASTER_CONTENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  blog_post: "Long-form narrative content (500-1000+ words)",
  email_newsletter: "Original newsletter content piece",
  product_story: "Narrative storytelling about a product (100-300 words)",
  brand_announcement: "Important brand updates and announcements",
};

export const DERIVATIVE_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  email_3part: "3-Part Email Sequence",
  email_5part: "5-Part Email Sequence",
  email_7part: "7-Part Email Sequence",
  instagram: "Instagram Carousel",
  twitter: "Twitter Thread",
  product: "Product Description",
  sms: "SMS Message",
  linkedin: "LinkedIn Post",
};

export const DERIVATIVE_TYPE_DESCRIPTIONS: Record<string, string> = {
  email: "Single adapted email piece from master content",
  email_3part: "3-part email nurture sequence",
  email_5part: "5-part email nurture sequence",
  email_7part: "7-part email nurture sequence",
  instagram: "Multi-slide Instagram carousel post",
  twitter: "Multi-tweet Twitter thread",
  product: "Short, sales-focused product description",
  sms: "SMS text message (160 characters)",
  linkedin: "Professional LinkedIn post",
};

// Map derivative types to folder categories
export const DERIVATIVE_CATEGORY_MAPPING: Record<string, string> = {
  email: "email",
  email_3part: "email",
  email_5part: "email",
  email_7part: "email",
  instagram: "instagram",
  twitter: "twitter",
  product: "product",
  sms: "sms",
  linkedin: "linkedin",
};

export function getContentTypeLabel(type: string, isDerivative: boolean = false): string {
  if (isDerivative) {
    return DERIVATIVE_TYPE_LABELS[type] || type.replace(/_/g, " ");
  }
  return MASTER_CONTENT_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

export function getContentTypeDescription(type: string, isDerivative: boolean = false): string {
  if (isDerivative) {
    return DERIVATIVE_TYPE_DESCRIPTIONS[type] || "";
  }
  return MASTER_CONTENT_TYPE_DESCRIPTIONS[type] || "";
}
