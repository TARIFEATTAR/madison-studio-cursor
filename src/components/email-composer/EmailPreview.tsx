import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";
import DOMPurify from "dompurify";

interface EmailPreviewProps {
  html: string;
}

export function EmailPreview({ html }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Sanitize HTML more permissively for email templates (keeping design intact)
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      // Allow full email document head so embedded styles are preserved
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ['html','head','meta','title','style','link'],
      ADD_ATTR: [
        // keep inline email design intact
        'style','class','id','href','src','width','height',
        'align','valign','border','cellpadding','cellspacing',
        'bgcolor','background','color','face','size','target','rel','type',
        'role','http-equiv','content','name','media'
      ],
      ALLOW_UNKNOWN_PROTOCOLS: false,
      FORBID_TAGS: ['script','iframe','object','embed','form','input','button'],
      FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onmouseout','onfocus','onblur']
    });
  }, [html]);

  // Trust our own generator output (full HTML docs) to keep rich styles intact
  const docToRender = useMemo(() => {
    const isFullDoc = /^\s*<!DOCTYPE html>/i.test(html) || /<html[\s>]/i.test(html);
    return isFullDoc ? html : sanitizedHtml;
  }, [html, sanitizedHtml]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Preview Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-card/50">
        <h3 className="font-semibold text-foreground text-sm sm:text-base">Live Preview</h3>
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("desktop")}
            className="h-7 sm:h-8"
          >
            <Monitor className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("mobile")}
            className="h-7 sm:h-8"
          >
            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 p-2 sm:p-4 bg-muted/30 overflow-auto">
        <div
          className={`mx-auto bg-white transition-all duration-300 ${
            viewMode === "desktop" ? "max-w-full" : "max-w-[375px]"
          }`}
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <iframe
            srcDoc={docToRender}
            title="Email Preview"
            className="w-full border-0"
            style={{
              height: viewMode === "desktop" ? "800px" : "667px",
              minHeight: "400px",
            }}
            sandbox="allow-same-origin allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
