import { useState } from "react";
import { Maximize2, Minimize2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
}

export const ContentEditor = ({ 
  content, 
  onChange, 
  onSave,
  placeholder = "Generated content will appear here...",
  className 
}: ContentEditorProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSave = () => {
    onSave?.();
    if (isFullScreen) {
      setIsFullScreen(false);
    }
  };

  return (
    <>
      {/* Normal Editor View */}
      {!isFullScreen && (
        <div className={cn("relative", className)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Click to edit content
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFullScreen}
              className="gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Full Screen
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] bg-background/50 leading-relaxed font-serif"
          />
        </div>
      )}

      {/* Full Screen Editor */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
            <h2 className="text-lg font-serif">Edit Content</h2>
            <div className="flex gap-2">
              {onSave && (
                <Button
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Exit
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleToggleFullScreen}
                className="gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Full Screen
              </Button>
            </div>
          </div>

          {/* Full Screen Editor Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
              <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[calc(100vh-200px)] bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed font-serif resize-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
