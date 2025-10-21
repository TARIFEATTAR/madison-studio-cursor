import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Archive, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ImageSessionModalProps {
  sessionId: string;
  sessionName: string;
  images: Array<{
    id: string;
    imageUrl: string;
    finalPrompt: string;
    createdAt: Date;
    isHero: boolean;
  }>;
  archived: boolean;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ImageSessionModal({
  sessionId,
  sessionName,
  images,
  archived,
  open,
  onClose,
  onUpdate
}: ImageSessionModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handleDownloadSingle = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await handleDownloadSingle(img.imageUrl, `${sessionName}-${i + 1}.png`);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Downloaded ${images.length} images`);
    } catch (error) {
      toast.error('Failed to download all images');
    } finally {
      setDownloading(false);
    }
  };

  const handleArchiveToggle = async () => {
    setArchiving(true);
    try {
      const imageIds = images.map(img => img.id);
      
      const { error } = await supabase
        .from('generated_images')
        .update({ is_archived: !archived })
        .in('id', imageIds);

      if (error) throw error;

      toast.success(archived ? 'Session restored' : 'Session archived');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Archive toggle failed:', error);
      toast.error('Failed to update archive status');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{sessionName}</DialogTitle>
          <p className="text-sm text-warm-gray">
            {images.length} {images.length === 1 ? 'image' : 'images'} • Created {formatDistanceToNow(images[0]?.createdAt || new Date(), { addSuffix: true })}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            {images.map((img, index) => (
              <div key={img.id} className="relative group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#252220] border border-charcoal/20">
                  <img
                    src={img.imageUrl}
                    alt={`${sessionName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isHero && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-aged-brass text-ink-black px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Hero
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(img.imageUrl, `${sessionName}-${index + 1}.png`);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {img.finalPrompt && (
                  <p className="text-xs text-warm-gray mt-2 line-clamp-2">
                    {img.finalPrompt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleArchiveToggle}
            disabled={archiving}
          >
            <Archive className="w-4 h-4 mr-2" />
            {archived ? 'Restore' : 'Archive'} Session
          </Button>
          <Button
            variant="brass"
            onClick={handleDownloadAll}
            disabled={downloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download All'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
