import { useMemo } from "react";
import DOMPurify from "dompurify";

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * SafeHTML – small wrapper to sanitize user-provided HTML before injecting it.
 *
 * Always use this instead of `dangerouslySetInnerHTML` directly in components.
 */
export function SafeHTML({ html, className }: SafeHTMLProps) {
  const clean = useMemo(() => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }), [html]);

  // eslint-disable-next-line react/no-danger
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
