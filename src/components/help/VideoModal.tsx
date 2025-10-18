import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { HelpVideo, categoryLabels, helpVideos } from "@/config/helpVideos";

interface VideoModalProps {
  video: HelpVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect: (video: HelpVideo) => void;
}

export function VideoModal({ video, isOpen, onClose, onVideoSelect }: VideoModalProps) {
  if (!video) return null;

  // Find next video in sequence
  const nextVideo = helpVideos.find(v => v.order === video.order + 1);

  // Extract Loom video ID from URL for embed
  const getEmbedUrl = (url: string) => {
    // Loom URLs: https://www.loom.com/share/xxxxx or https://www.loom.com/embed/xxxxx
    const match = url.match(/loom\.com\/(share|embed)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://www.loom.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#FFFCF5] border-[#E8DCC8] p-0 gap-0">
        {/* Video Player */}
        <div className="relative aspect-video bg-[hsl(var(--ink-black))]">
          <iframe
            src={getEmbedUrl(video.videoUrl)}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <Badge 
                variant="outline" 
                className="text-xs border-[hsl(var(--aged-brass))]/30 text-[hsl(var(--aged-brass))] bg-[hsl(var(--aged-brass))]/5"
              >
                {categoryLabels[video.category]}
              </Badge>
            </div>
            <DialogTitle className="font-serif text-2xl text-[hsl(var(--charcoal))]">
              {video.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-[hsl(var(--warm-gray))] mt-2">
              {video.description}
            </DialogDescription>
          </DialogHeader>

          {/* Next Video Suggestion */}
          {nextVideo && (
            <div className="mt-6 pt-6 border-t border-[#E8DCC8]">
              <p className="text-xs font-semibold text-[hsl(var(--warm-gray))] uppercase tracking-wider mb-3">
                Up Next
              </p>
              <button
                onClick={() => {
                  onVideoSelect(nextVideo);
                }}
                className="w-full text-left p-4 rounded-md border border-[#E8DCC8] bg-[hsl(var(--vellum-cream))]/30 hover:border-[hsl(var(--aged-brass))] hover:bg-[hsl(var(--aged-brass))]/5 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-serif font-semibold text-sm text-[hsl(var(--charcoal))] mb-1 group-hover:text-[hsl(var(--aged-brass))] transition-colors">
                      {nextVideo.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--warm-gray))] line-clamp-1">
                      {nextVideo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-[hsl(var(--warm-gray))]">
                      {nextVideo.duration}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--aged-brass))] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
