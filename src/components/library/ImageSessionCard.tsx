import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Download, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ImageSessionCardProps {
  sessionId: string;
  sessionName: string;
  heroImageUrl: string;
  imageCount: number;
  createdAt: Date;
  archived: boolean;
  onClick: () => void;
}

export function ImageSessionCard({
  sessionId,
  sessionName,
  heroImageUrl,
  imageCount,
  createdAt,
  archived,
  onClick
}: ImageSessionCardProps) {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden border border-charcoal/20 hover:border-aged-brass hover:shadow-level-2 transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#252220]">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={sessionName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23252220" width="100" height="100"/%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-charcoal/10">
            <ImageIcon className="w-12 h-12 text-warm-gray/30" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className="bg-ink-black/90 text-aged-brass border border-aged-brass/30">
            Session
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          {archived && (
            <Badge variant="secondary" className="bg-charcoal/80 text-parchment-white">
              <Archive className="w-3 h-3 mr-1" />
              Archived
            </Badge>
          )}
          <Badge className="bg-aged-brass/90 text-ink-black">
            <ImageIcon className="w-3 h-3 mr-1" />
            {imageCount} {imageCount === 1 ? 'image' : 'images'}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-base text-ink-black line-clamp-1">
            {sessionName}
          </h3>
        </div>
        
        <div className="flex items-center justify-between text-xs text-warm-gray">
          <span>Image Session</span>
          <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </Card>
  );
}
