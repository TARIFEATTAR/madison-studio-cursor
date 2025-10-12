import { Loader2, Archive, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import QualityRating from "@/components/QualityRating";
import { ContentEditor } from "@/components/ContentEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentOutputProps {
  contentType: string;
  generatedOutput: string;
  imageUrls: string;
  qualityRating: number;
  saving: boolean;
  savingTemplate: boolean;
  voiceValidation: null;
  onOutputChange: (value: string) => void;
  onImageUrlsChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onArchive: () => void;
  onSaveAsTemplate: () => void;
}

export function ContentOutput({
  contentType,
  generatedOutput,
  imageUrls,
  qualityRating,
  saving,
  savingTemplate,
  voiceValidation,
  onOutputChange,
  onImageUrlsChange,
  onRatingChange,
  onArchive,
  onSaveAsTemplate,
}: ContentOutputProps) {
  return (
    <>
      {generatedOutput && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-serif mb-3">Generated Output</h3>
          <ContentEditor
            content={generatedOutput}
            onChange={onOutputChange}
            placeholder="Generated content will appear here..."
          />
          
          
          <div className="pt-4 border-t border-border/40">
            <QualityRating rating={qualityRating} onRatingChange={onRatingChange} />
          </div>
        </div>
      )}

      {contentType === 'visual' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-serif">Generated Image URLs</h3>
              <p className="text-xs text-muted-foreground mt-1">
                After generating images in Google AI Studio with Nano Banana, paste the image URLs here (one per line)
              </p>
            </div>
          </div>
          <Textarea
            value={imageUrls}
            onChange={(e) => {
              const target = e.target;
              const cursorPosition = target.selectionStart;
              const value = target.value;
              onImageUrlsChange(value);
              requestAnimationFrame(() => {
                if (target) {
                  target.setSelectionRange(cursorPosition, cursorPosition);
                }
              });
            }}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            className="bg-background/50 min-h-[120px] font-mono text-sm"
          />
          {imageUrls && (
            <div className="pt-4 border-t border-border/40">
              <QualityRating rating={qualityRating} onRatingChange={onRatingChange} />
            </div>
          )}
        </div>
      )}

      {((generatedOutput && qualityRating > 0) || (imageUrls && qualityRating > 0)) && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={onArchive}
                disabled={saving || savingTemplate}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Save to Library
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save this generated content</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default"
                className="gap-2"
                onClick={onSaveAsTemplate}
                disabled={saving || savingTemplate}
              >
                {savingTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Save as Template
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save the prompt to reuse later</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}