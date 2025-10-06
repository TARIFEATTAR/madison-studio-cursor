import { Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import QualityRating from "@/components/QualityRating";
import { ContentEditor } from "@/components/ContentEditor";
import { validateBlogVoice } from "@/config/blogPostGuidelines";

interface ContentOutputProps {
  contentType: string;
  generatedOutput: string;
  imageUrls: string;
  qualityRating: number;
  saving: boolean;
  voiceValidation: ReturnType<typeof validateBlogVoice> | null;
  onOutputChange: (value: string) => void;
  onImageUrlsChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onArchive: () => void;
}

export function ContentOutput({
  contentType,
  generatedOutput,
  imageUrls,
  qualityRating,
  saving,
  voiceValidation,
  onOutputChange,
  onImageUrlsChange,
  onRatingChange,
  onArchive,
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
          
          {contentType === 'blog' && voiceValidation && (
            <div className="p-4 bg-background/30 rounded-md border border-border/40">
              <h4 className="text-sm font-medium mb-2">Voice Validation</h4>
              <div className="space-y-2 text-sm">
                {voiceValidation.forbiddenWords.length > 0 && (
                  <div className="text-destructive">
                    ❌ Forbidden words found: {voiceValidation.forbiddenWords.join(', ')}
                  </div>
                )}
                <div className="text-muted-foreground">
                  ✅ Approved vocabulary: {voiceValidation.approvedCount} instances
                </div>
                <div className="text-muted-foreground">
                  {voiceValidation.hasEmoji ? '❌ Contains emojis' : '✅ No emojis'}
                </div>
                <div className="text-muted-foreground">
                  Sentence variety score: {voiceValidation.sentenceVariety}%
                </div>
              </div>
            </div>
          )}
          
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
            onChange={(e) => onImageUrlsChange(e.target.value)}
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
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={onArchive}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Save to Portfolio
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}