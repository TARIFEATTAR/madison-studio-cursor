import { 
  BookOpen, 
  Mail, 
  FileText, 
  Megaphone, 
  Instagram, 
  ShoppingBag, 
  MessageSquare,
  Image,
  LucideIcon 
} from "lucide-react";

export interface ContentTypeMapping {
  name: string;
  keys: string[];
  icon: LucideIcon;
}

export const contentTypeMapping: ContentTypeMapping[] = [
  {
    name: "Blog",
    keys: ["blog_post"],
    icon: BookOpen,
  },
  {
    name: "Email",
    keys: ["email_newsletter", "email", "email_3part", "email_5part", "email_7part"],
    icon: Mail,
  },
  {
    name: "Product Stories",
    keys: ["product_story"],
    icon: FileText,
  },
  {
    name: "Brand Announcements",
    keys: ["brand_announcement"],
    icon: Megaphone,
  },
  {
    name: "Social",
    keys: ["instagram", "twitter", "linkedin", "facebook"],
    icon: Instagram,
  },
  {
    name: "SMS",
    keys: ["sms"],
    icon: MessageSquare,
  },
  {
    name: "Visual",
    keys: ["image", "visual", "graphic"],
    icon: Image,
  },
];

export function getContentTypeKeys(displayName: string): string[] {
  const mapping = contentTypeMapping.find(m => m.name === displayName);
  return mapping?.keys || [];
}

export function getContentTypeDisplayName(key: string): string {
  const mapping = contentTypeMapping.find(m => m.keys.includes(key));
  return mapping?.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
