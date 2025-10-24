import { formatDistanceToNow } from 'date-fns';

/**
 * Format a timestamp as a relative time string
 * Examples: "Today", "Yesterday", "3 days ago", "2 weeks ago"
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  // For older dates, use date-fns
  return formatDistanceToNow(date, { addSuffix: true });
}
