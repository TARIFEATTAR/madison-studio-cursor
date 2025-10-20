import { Card } from '@/components/ui/card';
import { Loader2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: Array<{ url: string; description: string }>;
  isGenerating: boolean;
  referenceImage: string | null;
}

export function ImagePreview({ images, isGenerating, referenceImage }: ImagePreviewProps) {
  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `madison-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="bg-parchment-white border border-charcoal/10 shadow-level-1 p-6 min-h-[600px] flex flex-col">
      <h3 className="font-serif text-xl text-ink-black mb-4">Preview</h3>

      {isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-brass animate-spin mb-4" />
          <p className="font-sans text-sm text-charcoal/60">Generating your image...</p>
        </div>
      )}

      {!isGenerating && images.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-muted-foreground mb-2">No images generated yet</p>
            <p className="text-sm text-muted-foreground">Select a goal and prompt to begin</p>
          </div>
        </div>
      )}

      {!isGenerating && images.length > 0 && (
        <div className="space-y-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img.url}
                alt={img.description}
                className="w-full rounded-sm shadow-level-2"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(img.url)}
                  className="bg-parchment-white/95 backdrop-blur-sm hover:bg-brass/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="bg-parchment-white/95 backdrop-blur-sm hover:bg-brass/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Library
                </Button>
              </div>
              {img.description && (
                <p className="text-xs text-muted-foreground mt-2">{img.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
