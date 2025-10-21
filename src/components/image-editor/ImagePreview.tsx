import { Card } from '@/components/ui/card';
import { Loader2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: Array<{ url: string; description: string }>;
  isGenerating: boolean;
  referenceImage: string | null;
}

export function ImagePreview({ images, isGenerating, referenceImage }: ImagePreviewProps) {
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `madison-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
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
                  variant="brass"
                  onClick={() => handleDownload(img.url)}
                  className="shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="brass"
                  className="shadow-lg"
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
