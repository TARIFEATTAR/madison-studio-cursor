import { LucideIcon, Sparkles, Crown, Droplet, Home } from "lucide-react";

export const collectionIcons: Record<string, LucideIcon> = {
  cadence: Sparkles,
  reserve: Crown,
  purity: Droplet,
  "sacred space": Home,
  "sacred_space": Home,
};

export function getCollectionIcon(collection: string | null | undefined): LucideIcon | null {
  if (!collection) return null;
  const normalized = collection.toLowerCase().replace(/ /g, "_");
  return collectionIcons[normalized] || collectionIcons[collection.toLowerCase()] || null;
}

export function normalizeCollectionName(name: string | null | undefined): string {
  if (!name) return 'cadence';
  return name.toLowerCase().replace(/ /g, '_');
}

export function formatCollectionDisplay(name: string | null | undefined): string {
  if (!name) return 'Cadence';
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
