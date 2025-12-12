import { ALL_DELIVERABLES, DeliverableFormat } from "./deliverableFormats";
import { LucideIcon, Mail, BookOpen, Instagram, Quote } from "lucide-react";

export interface LibraryContentType {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  isGroup?: boolean;
  groupKeys?: string[];
}

/**
 * Content type groups for grouped filtering (e.g., "All Emails" matches email, email_3part, etc.)
 * 
 * IMPORTANT: Keep in sync with:
 * - src/config/deliverableFormats.ts (source of truth for deliverable values)
 * - src/utils/contentSubtypeLabels.ts (display labels)
 */
export const CONTENT_TYPE_GROUPS: Record<string, string[]> = {
  "all_emails": [
    "email", 
    "email_newsletter", 
    "email_3part", 
    "email_5part", 
    "email_7part", 
    "email_campaign",
    "email_subject_lines"
  ],
  "all_social": [
    // Instagram
    "instagram_post",
    "instagram_carousel", 
    "instagram_reel_script",
    // Facebook
    "facebook_post",
    // LinkedIn
    "linkedin_post",
    "linkedin_article",
    // Twitter/X
    "twitter_thread",
    "twitter_post",
    // TikTok
    "tiktok_script",
    // YouTube
    "youtube_description",
    // Pinterest
    "pinterest_pin",
    // Legacy values
    "social_media_post", 
    "instagram", 
    "linkedin", 
    "facebook", 
    "twitter", 
    "youtube", 
    "carousel_copy",
    "short_form_video_script",
  ],
  "all_blog": [
    "blog_article", 
    "blog_post", 
    "blog",
    "video_script",
    "podcast_script",
    "long_form_sales_letter"
  ],
  "all_micro": [
    "quote_hook_generator",
    "customer_testimonial_story",
    "tagline_generator"
  ],
};

/**
 * Grouped filter options shown at the top of the filter dropdown
 */
const groupedFilterOptions: LibraryContentType[] = [
  {
    id: "all_emails",
    name: "All Emails",
    icon: Mail,
    category: "All email types including sequences",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_emails,
  },
  {
    id: "all_social",
    name: "All Social Media",
    icon: Instagram,
    category: "Instagram, Facebook, LinkedIn, Twitter, TikTok, YouTube, Pinterest",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_social,
  },
  {
    id: "all_blog",
    name: "All Long-Form",
    icon: BookOpen,
    category: "Blog, articles, video scripts, sales letters",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_blog,
  },
  {
    id: "all_micro",
    name: "All Micro Content",
    icon: Quote,
    category: "Hooks, quotes, taglines, testimonials",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_micro,
  },
];

/**
 * Generate library content types dynamically from deliverable formats
 * This ensures the Library page filters match what users can create on /create
 */
const individualTypes: LibraryContentType[] = ALL_DELIVERABLES.map(
  (deliverable: DeliverableFormat) => ({
    id: deliverable.value,
    name: deliverable.label,
    icon: deliverable.icon,
    category: deliverable.description,
  })
);

// Combine grouped options first, then individual types
export const libraryContentTypes: LibraryContentType[] = [
  ...groupedFilterOptions,
  ...individualTypes,
];

/**
 * Get content type by ID for lookup purposes
 */
export function getLibraryContentType(id: string): LibraryContentType | undefined {
  return libraryContentTypes.find((type) => type.id === id);
}

/**
 * Check if a content type matches a filter (handles both individual and grouped filters)
 */
export function contentTypeMatchesFilter(contentType: string, filterValue: string): boolean {
  if (filterValue === "all") return true;
  
  // Check if filter is a group
  const groupKeys = CONTENT_TYPE_GROUPS[filterValue];
  if (groupKeys) {
    return groupKeys.includes(contentType);
  }
  
  // Direct match
  return contentType === filterValue;
}
