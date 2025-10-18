import { 
  BookOpen, 
  Mail, 
  ShoppingBag, 
  Instagram, 
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
    keys: ["blog_post", "blog"],
    icon: BookOpen,
  },
  {
    name: "Email",
    keys: ["email_newsletter", "email", "email_3part", "email_5part", "email_7part"],
    icon: Mail,
  },
  {
    name: "Product",
    keys: ["product"],
    icon: ShoppingBag,
  },
  {
    name: "Social",
    keys: ["instagram", "linkedin", "facebook", "social", "youtube"],
    icon: Instagram,
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
