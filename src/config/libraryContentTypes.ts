import { ALL_DELIVERABLES, DeliverableFormat } from "./deliverableFormats";
import { LucideIcon, Mail, BookOpen, Instagram, ShoppingBag, Layers } from "lucide-react";

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
    "social_media_post", 
    "instagram", 
    "linkedin", 
    "facebook", 
    "twitter", 
    "youtube", 
    "carousel_copy",
    "short_form_video_script",
    "customer_testimonial_story",
    "quote_hook_generator"
  ],
  "all_blog": [
    "blog_article", 
    "blog_post", 
    "blog",
    "video_script",
    "podcast_script"
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
    name: "All Social",
    icon: Instagram,
    category: "All social media content",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_social,
  },
  {
    id: "all_blog",
    name: "All Blog/Articles",
    icon: BookOpen,
    category: "All blog and article content",
    isGroup: true,
    groupKeys: CONTENT_TYPE_GROUPS.all_blog,
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
