import { Play, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpVideo, categoryLabels } from "@/config/helpVideos";

interface VideoCardProps {
  video: HelpVideo;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <Card 
      className="group cursor-pointer bg-[#FFFCF5] border-[#E8DCC8] hover:border-[hsl(var(--aged-brass))] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_14px_rgba(184,149,106,0.2)]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-[hsl(var(--vellum-cream))] to-[hsl(var(--parchment-white))] border-b border-[#E8DCC8] overflow-hidden">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-[hsl(var(--aged-brass))]/40 mx-auto mb-2" />
                <p className="text-xs text-[hsl(var(--warm-gray))] font-serif">Video Preview</p>
              </div>
            </div>
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-[hsl(var(--ink-black))]/0 group-hover:bg-[hsl(var(--ink-black))]/40 transition-all duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--aged-brass))] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center transform scale-75 group-hover:scale-100">
              <Play className="w-6 h-6 text-[hsl(var(--ink-black))] ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute top-2 right-2 bg-[hsl(var(--ink-black))]/80 backdrop-blur-sm px-2 py-1 rounded-sm flex items-center gap-1">
            <Clock className="w-3 h-3 text-[hsl(var(--parchment-white))]" />
            <span className="text-xs font-mono text-[hsl(var(--parchment-white))]">{video.duration}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Badge 
            variant="outline" 
            className="mb-2 text-[10px] border-[hsl(var(--aged-brass))]/30 text-[hsl(var(--aged-brass))] bg-[hsl(var(--aged-brass))]/5"
          >
            {categoryLabels[video.category]}
          </Badge>
          
          <h3 className="font-serif text-base font-semibold text-[hsl(var(--charcoal))] mb-1 line-clamp-2 group-hover:text-[hsl(var(--aged-brass))] transition-colors">
            {video.title}
          </h3>
          
          <p className="text-xs text-[hsl(var(--warm-gray))] line-clamp-2">
            {video.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
