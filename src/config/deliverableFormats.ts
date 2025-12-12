import { 
  BookOpen, 
  Video, 
  Podcast, 
  Mail, 
  Lightbulb, 
  MousePointerClick,
  Globe,
  ShoppingBag,
  Package,
  Layers,
  HelpCircle,
  Instagram,
  Image as ImageIcon,
  Sparkles,
  Megaphone,
  FileText,
  MessageSquare,
  Quote,
  Camera,
  Palette,
  Bell,
  Newspaper,
  Smartphone,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  Music2,
  PenTool,
  ScrollText,
  LucideIcon
} from "lucide-react";

export interface DeliverableFormat {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface DeliverableCategory {
  name: string;
  icon: LucideIcon;
  deliverables: DeliverableFormat[];
}

export const DELIVERABLE_CATEGORIES: DeliverableCategory[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // HERO / ANCHOR CONTENT (Long-Form)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Hero / Anchor Content",
    icon: BookOpen,
    deliverables: [
      {
        value: "blog_article",
        label: "Blog / Article",
        description: "Long-form editorial content (800-2000 words)",
        icon: BookOpen,
      },
      {
        value: "video_script",
        label: "Video Script (Long)",
        description: "YouTube, brand video screenplay (3-10 min)",
        icon: Video,
      },
      {
        value: "podcast_script",
        label: "Podcast Script",
        description: "Episodic audio content script",
        icon: Podcast,
      },
      {
        value: "long_form_sales_letter",
        label: "Long-Form Sales Letter",
        description: "Classic direct response sales copy (Halbert/Ogilvy style)",
        icon: ScrollText,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // CONVERSION CONTENT (Sales & Email)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Conversion Content",
    icon: MousePointerClick,
    deliverables: [
      {
        value: "email",
        label: "Email (Single)",
        description: "Single promotional or nurture email",
        icon: Mail,
      },
      {
        value: "email_3part",
        label: "3-Part Email Sequence",
        description: "Welcome/Value/Invitation sequence",
        icon: Mail,
      },
      {
        value: "email_5part",
        label: "5-Part Email Sequence",
        description: "Extended nurture sequence",
        icon: Mail,
      },
      {
        value: "email_7part",
        label: "7-Part Email Sequence",
        description: "Deep dive journey sequence",
        icon: Mail,
      },
      {
        value: "email_newsletter",
        label: "Email Newsletter",
        description: "Regular subscriber newsletter",
        icon: Mail,
      },
      {
        value: "email_subject_lines",
        label: "Email Subject Lines",
        description: "Attention-grabbing subject lines (10 variations)",
        icon: Lightbulb,
      },
      {
        value: "ad_copy",
        label: "Ad Copy (General)",
        description: "Paid advertising copy (Meta, Google)",
        icon: MousePointerClick,
      },
      {
        value: "landing_page_copy",
        label: "Landing Page Copy",
        description: "Conversion-focused sales page",
        icon: Globe,
      },
      {
        value: "website_hero_copy",
        label: "Website Hero Copy",
        description: "Homepage headline & subheadline",
        icon: Sparkles,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRODUCT & BRAND CONTENT
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Product & Brand Content",
    icon: ShoppingBag,
    deliverables: [
      {
        value: "product_description",
        label: "Product Description",
        description: "E-commerce product copy (features + benefits)",
        icon: ShoppingBag,
      },
      {
        value: "product_story",
        label: "Product Story",
        description: "Narrative-driven product origin story",
        icon: FileText,
      },
      {
        value: "collection_page_copy",
        label: "Collection Page Copy",
        description: "Category or collection overview",
        icon: Layers,
      },
      {
        value: "brand_story_page",
        label: "Brand Story / About Page",
        description: "Company origin and mission narrative",
        icon: Package,
      },
      {
        value: "faq_page_copy",
        label: "FAQ Page Copy",
        description: "Frequently asked questions (10-20 Q&As)",
        icon: HelpCircle,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // SOCIAL MEDIA — PLATFORM SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Social Media",
    icon: Instagram,
    deliverables: [
      {
        value: "instagram_post",
        label: "Instagram Post",
        description: "Feed post with caption (lifestyle, visual-first)",
        icon: Instagram,
      },
      {
        value: "instagram_carousel",
        label: "Instagram Carousel",
        description: "Multi-slide educational or story carousel",
        icon: Layers,
      },
      {
        value: "instagram_reel_script",
        label: "Instagram Reel Script",
        description: "Short-form video script (15-60 sec)",
        icon: Video,
      },
      {
        value: "facebook_post",
        label: "Facebook Post",
        description: "Community-focused, longer captions OK",
        icon: Facebook,
      },
      {
        value: "linkedin_post",
        label: "LinkedIn Post",
        description: "Professional thought leadership (long-form OK)",
        icon: Linkedin,
      },
      {
        value: "linkedin_article",
        label: "LinkedIn Article",
        description: "Published article on LinkedIn (800-1500 words)",
        icon: PenTool,
      },
      {
        value: "twitter_thread",
        label: "Twitter/X Thread",
        description: "Multi-tweet thread (8-15 tweets)",
        icon: Twitter,
      },
      {
        value: "twitter_post",
        label: "Twitter/X Post",
        description: "Single tweet (280 chars max)",
        icon: Twitter,
      },
      {
        value: "tiktok_script",
        label: "TikTok Script",
        description: "Hook-first short video (15-60 sec)",
        icon: Music2,
      },
      {
        value: "youtube_description",
        label: "YouTube Description",
        description: "SEO-optimized video description + timestamps",
        icon: Youtube,
      },
      {
        value: "pinterest_pin",
        label: "Pinterest Pin",
        description: "Visual-first pin description (SEO keywords)",
        icon: ImageIcon,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // MICRO CONTENT (Hooks, Quotes, Testimonials)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Micro Content",
    icon: Quote,
    deliverables: [
      {
        value: "quote_hook_generator",
        label: "Quote / Hook Generator",
        description: "Standalone impactful quotes (10 variations)",
        icon: Quote,
      },
      {
        value: "customer_testimonial_story",
        label: "Customer Testimonial Story",
        description: "User success story narrative",
        icon: MessageSquare,
      },
      {
        value: "tagline_generator",
        label: "Tagline Generator",
        description: "Brand or product taglines (10 variations)",
        icon: Sparkles,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // VISUALS & CREATIVE
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Visuals & Creative",
    icon: Camera,
    deliverables: [
      {
        value: "visual-asset",
        label: "Visual Asset",
        description: "AI-generated images and graphics",
        icon: ImageIcon,
      },
      {
        value: "image_prompt",
        label: "Image Recipe",
        description: "Saved AI image prompt for reuse",
        icon: ImageIcon,
      },
      {
        value: "campaign_concept_visual",
        label: "Campaign Concept",
        description: "Visual campaign direction brief",
        icon: Palette,
      },
      {
        value: "ad_creative_prompt",
        label: "Ad Creative Brief",
        description: "Visual concept for paid ads",
        icon: Sparkles,
      },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // ANNOUNCEMENTS & PR
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    name: "Announcements & PR",
    icon: Megaphone,
    deliverables: [
      {
        value: "launch_announcement",
        label: "Launch Announcement",
        description: "Product/feature launch copy",
        icon: Bell,
      },
      {
        value: "press_release",
        label: "Press Release",
        description: "Media announcement (AP style)",
        icon: Newspaper,
      },
      {
        value: "sms_campaign_copy",
        label: "SMS Campaign",
        description: "Text message marketing (160 chars)",
        icon: Smartphone,
      },
    ],
  },
];

// Flat list for easy lookup
export const ALL_DELIVERABLES = DELIVERABLE_CATEGORIES.flatMap(
  (category) => category.deliverables
);

export function getDeliverableByValue(value: string): DeliverableFormat | undefined {
  return ALL_DELIVERABLES.find((d) => d.value === value);
}
