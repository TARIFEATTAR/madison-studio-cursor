/**
 * Generates smart, hierarchical names for auto-saved prompts
 * Priority: Format + Product > Format + Style > Format + Goal > Format + Timestamp
 */
export function generateSmartName(brief: {
  deliverable_format: string;
  product_name?: string;
  style_overlay?: string;
  goal?: string;
}): string {
  const format = brief.deliverable_format || 'Content';

  // Priority 1: Format + Product (most specific)
  if (brief.product_name?.trim()) {
    return `${format} - ${brief.product_name}`;
  }

  // Priority 2: Format + Style (if not default)
  if (brief.style_overlay && 
      brief.style_overlay !== 'tarife-native' && 
      brief.style_overlay !== 'default') {
    // Clean up style name (remove hyphens, capitalize)
    const styleName = brief.style_overlay
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `${format} - ${styleName}`;
  }

  // Priority 3: Format + Goal (truncated and cleaned)
  if (brief.goal?.trim()) {
    // Remove special chars, trim whitespace
    const cleaned = brief.goal
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    
    const shortGoal = cleaned.substring(0, 35);
    const needsEllipsis = cleaned.length > 35;
    
    return `${format} - ${shortGoal}${needsEllipsis ? '...' : ''}`;
  }

  // Priority 4: Format + Timestamp (fallback)
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const date = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${format} - ${date} at ${time}`;
}

/**
 * Formats a prompt name for display (truncate if needed)
 */
export function formatPromptName(
  autoName: string, 
  customName?: string | null,
  maxLength: number = 50
): string {
  const name = customName || autoName;
  
  if (name.length <= maxLength) {
    return name;
  }
  
  return name.substring(0, maxLength - 3) + '...';
}
