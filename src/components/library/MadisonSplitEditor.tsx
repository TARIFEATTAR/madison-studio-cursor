import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";

interface MadisonSplitEditorProps {
  open: boolean;
  title?: string;
  initialContent: string;
  onSave: (newContent: string) => Promise<void> | void;
  onClose: () => void;
}

export function MadisonSplitEditor({ open, title, initialContent, onSave, onClose }: MadisonSplitEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      // Small delay to ensure element is mounted before focusing
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  }, [open, initialContent]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="min-w-0">
          <h2 className="font-serif text-base sm:text-lg truncate">{title || "Edit with Madison"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(content)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor */}
        <div className="w-1/2 min-w-[320px] border-r p-3 sm:p-4 overflow-auto" style={{ borderColor: "hsl(var(--border))" }}>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[calc(100vh-10rem)] text-sm"
            placeholder="Edit your content here..."
          />
        </div>

        {/* Right: Madison */}
        <div className="flex-1 min-w-[320px]">
          <EditorialAssistantPanel
            onClose={onClose}
            initialContent={content}
          />
        </div>
      </div>
    </div>
  );
}
