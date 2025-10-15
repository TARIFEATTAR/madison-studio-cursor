import { LucideIcon, Sparkles, Crown, Droplet, Home } from "lucide-react";

export const collectionIcons: Record<string, LucideIcon> = {
  humanities: Sparkles,
  cadence: Sparkles, // Legacy support
  reserve: Crown,
  purity: Droplet,
  elemental: Home,
  "sacred space": Home, // Legacy support
  "sacred_space": Home, // Legacy support
};

export function getCollectionIcon(collection: string | null | undefined): LucideIcon | null {
  if (!collection) return null;
  const normalized = collection.toLowerCase().replace(/ /g, "_");
  return collectionIcons[normalized] || collectionIcons[collection.toLowerCase()] || null;
}

export function normalizeCollectionName(name: string | null | undefined): string {
  if (!name) return 'humanities';
  return name.toLowerCase().replace(/ /g, '_');
}

export function formatCollectionDisplay(name: string | null | undefined): string {
  if (!name) return 'Humanities';
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
