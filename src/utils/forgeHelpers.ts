// Helpers to map display labels to database enum values
export const toEnum = (v?: string | null) => (v ? v.toLowerCase().replace(/\s+/g, '_') : null);

export const mapCollectionToEnum = (label?: string | null) => {
  if (!label) return null;
  if (label.includes('Humanities')) return 'humanities';
  if (label.includes('Cadence')) return 'humanities'; // Legacy support
  if (label.includes('Reserve')) return 'reserve';
  if (label.includes('Purity')) return 'purity';
  if (label.includes('Elemental')) return 'elemental';
  if (label.includes('Sacred')) return 'elemental'; // Legacy support
  return toEnum(label);
};

export const mapScentFamilyToEnum = (label?: string | null) => {
  if (!label) return null;
  const v = label.toLowerCase();
  if (['warm', 'fresh', 'woody', 'floral'].includes(v)) return v as 'warm' | 'fresh' | 'woody' | 'floral';
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

export const convertTextToHTML = (text: string): string => {
  if (!text) return '';

  // Split into lines and process
  const lines = text.split('\n');
  const output: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join('<br>\n').trim();
      if (content) {
        output.push(`<p>${content}</p>`);
      }
      paragraphBuffer = [];
    }
  };

  const closeLists = () => {
    if (inBulletList) {
      output.push('</ul>');
      inBulletList = false;
    }
    if (inNumberedList) {
      output.push('</ol>');
      inNumberedList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line = paragraph break
    if (!trimmed) {
      closeLists();
      flushParagraph();
      continue;
    }

    // Bullet point (- or * at start)
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (inNumberedList) {
        output.push('</ol>');
        inNumberedList = false;
      }
      if (!inBulletList) {
        output.push('<ul>');
        inBulletList = true;
      }
      const content = trimmed.replace(/^[-*]\s+/, '');
      output.push(`<li>${content}</li>`);
      continue;
    }

    // Numbered list (1. 2. etc at start)
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      if (inBulletList) {
        output.push('</ul>');
        inBulletList = false;
      }
      if (!inNumberedList) {
        output.push('<ol>');
        inNumberedList = true;
      }
      const content = trimmed.replace(/^\d+\.\s+/, '');
      output.push(`<li>${content}</li>`);
      continue;
    }

    // Regular text line
    closeLists();
    paragraphBuffer.push(trimmed);
  }

  // Flush any remaining content
  closeLists();
  flushParagraph();

  return output.join('\n');
};