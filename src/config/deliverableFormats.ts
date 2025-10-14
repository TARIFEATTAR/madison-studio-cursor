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
  {
    name: "Hero / Anchor Content",
    icon: BookOpen,
    deliverables: [
      {
        value: "blog_article",
        label: "Blog / Article",
        description: "Long-form editorial content",
        icon: BookOpen,
      },
      {
        value: "video_script",
        label: "Video Script",
        description: "Screenplay for video content",
        icon: Video,
      },
      {
        value: "podcast_script",
        label: "Podcast Script",
        description: "Episodic audio content script",
        icon: Podcast,
      },
    ],
  },
  {
    name: "Conversion Content",
    icon: MousePointerClick,
    deliverables: [
      {
        value: "email_campaign",
        label: "Email Campaign",
        description: "Multi-touch email sequence",
        icon: Mail,
      },
      {
        value: "email_subject_lines",
        label: "Email Subject Lines",
        description: "Attention-grabbing subject lines",
        icon: Lightbulb,
      },
      {
        value: "ad_copy",
        label: "Ad Copy",
        description: "Paid advertising copy",
        icon: MousePointerClick,
      },
      {
        value: "landing_page_copy",
        label: "Landing Page Copy",
        description: "Conversion-focused page copy",
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
  {
    name: "Product & Brand Content",
    icon: ShoppingBag,
    deliverables: [
      {
        value: "product_description",
        label: "Product Description",
        description: "E-commerce product copy",
        icon: ShoppingBag,
      },
      {
        value: "product_story",
        label: "Product Story",
        description: "Narrative-driven product copy",
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
        label: "Brand Story Page",
        description: "About page / brand narrative",
        icon: Package,
      },
      {
        value: "faq_page_copy",
        label: "FAQ Page Copy",
        description: "Frequently asked questions",
        icon: HelpCircle,
      },
    ],
  },
  {
    name: "Micro & Social Content",
    icon: Instagram,
    deliverables: [
      {
        value: "social_media_post",
        label: "Social Media Post",
        description: "Instagram, Twitter, LinkedIn post",
        icon: Instagram,
      },
      {
        value: "carousel_copy",
        label: "Carousel Copy",
        description: "Multi-slide social carousel",
        icon: Layers,
      },
      {
        value: "short_form_video_script",
        label: "Short-Form Video Script",
        description: "Reels, TikTok, Shorts script",
        icon: Video,
      },
      {
        value: "customer_testimonial_story",
        label: "Customer Testimonial Story",
        description: "User success story narrative",
        icon: MessageSquare,
      },
      {
        value: "quote_hook_generator",
        label: "Quote / Hook Generator",
        description: "Standalone impactful quotes",
        icon: Quote,
      },
    ],
  },
  {
    name: "Visuals & Creative",
    icon: Camera,
    deliverables: [
      {
        value: "image_prompt",
        label: "Image Prompt",
        description: "AI image generation prompt",
        icon: ImageIcon,
      },
      {
        value: "campaign_concept_visual",
        label: "Campaign Concept Visual",
        description: "Visual campaign direction",
        icon: Palette,
      },
      {
        value: "ad_creative_prompt",
        label: "Ad Creative Prompt",
        description: "Ad visual concept brief",
        icon: Sparkles,
      },
    ],
  },
  {
    name: "Announcements & Outreach",
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
        description: "Media announcement",
        icon: Newspaper,
      },
      {
        value: "sms_campaign_copy",
        label: "SMS Campaign Copy",
        description: "Text message marketing",
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
