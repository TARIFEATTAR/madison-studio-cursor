import { LucideIcon, Sparkles, Crown, Droplet, Home } from "lucide-react";

export const collectionIcons: Record<string, LucideIcon> = {
  cadence: Sparkles,
  reserve: Crown,
  purity: Droplet,
  "sacred space": Home,
  "sacred_space": Home,
};

export function getCollectionIcon(collection: string | null): LucideIcon | null {
  if (!collection) return null;
  const normalized = collection.toLowerCase().replace(/ /g, "_");
  return collectionIcons[normalized] || collectionIcons[collection.toLowerCase()] || null;
}
