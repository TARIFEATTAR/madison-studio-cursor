// Helpers to map display labels to database enum values
export const toEnum = (v?: string | null) => (v ? v.toLowerCase().replace(/\s+/g, '_') : null);

export const mapCollectionToEnum = (label?: string | null) => {
  if (!label) return null;
  if (label.includes('Cadence')) return 'cadence';
  if (label.includes('Reserve')) return 'reserve';
  if (label.includes('Purity')) return 'purity';
  if (label.includes('Sacred')) return 'sacred_space';
  return toEnum(label);
};

export const mapScentFamilyToEnum = (label?: string | null) => {
  if (!label) return null;
  const v = label.toLowerCase();
  if (['warm', 'fresh', 'woody', 'floral'].includes(v)) return v as 'warm' | 'fresh' | 'woody' | 'floral';
  return toEnum(label) as any;
};

export const mapPillarToEnum = (label?: string | null) => {
  if (!label) return null;
  const v = label.toLowerCase();
  if (['identity', 'memory', 'remembrance', 'cadence'].includes(v)) return v as any;
  return toEnum(label) as any;
};

export const stripMarkdown = (text: string): string => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/#{1,6}\s?/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^[\s-]*[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^\>\s/gm, '')
    .trim();
};