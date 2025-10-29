import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

interface EmailPreviewProps {
  html: string;
}

export function EmailPreview({ html }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Preview Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <h3 className="font-semibold text-foreground">Live Preview</h3>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("desktop")}
            className="h-8"
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("mobile")}
            className="h-8"
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 p-4 bg-muted/30 overflow-auto">
        <div
          className={`mx-auto bg-white transition-all duration-300 ${
            viewMode === "desktop" ? "max-w-full" : "max-w-[375px]"
          }`}
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <iframe
            srcDoc={html}
            title="Email Preview"
            className="w-full border-0"
            style={{
              height: viewMode === "desktop" ? "800px" : "667px",
              minHeight: "400px",
            }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
