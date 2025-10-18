import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📷",
  x: "🐦",
  linkedin: "💼",
  pinterest: "📌",
  tiktok: "🎵",
  blog: "📝",
  email: "📧",
  youtube: "📹",
  other: "🌐",
};

interface PublishingStatusProps {
  publishedTo?: string[];
  externalUrls?: Record<string, string>;
  publishedAt?: string;
  compact?: boolean;
}

export function PublishingStatus({
  publishedTo = [],
  externalUrls = {},
  publishedAt,
  compact = false,
}: PublishingStatusProps) {
  if (publishedTo.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              {publishedTo.slice(0, 3).map((platform) => (
                <span key={platform} className="text-sm">
                  {PLATFORM_ICONS[platform] || "🌐"}
                </span>
              ))}
              {publishedTo.length > 3 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  +{publishedTo.length - 3}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Published to:</p>
              {publishedTo.map((platform) => (
                <p key={platform} className="text-sm capitalize">
                  {PLATFORM_ICONS[platform] || "🌐"} {platform}
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {publishedTo.map((platform) => {
          const url = externalUrls[platform];
          const icon = PLATFORM_ICONS[platform] || "🌐";
          
          if (url) {
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm hover:bg-primary/20 transition-colors"
              >
                <span>{icon}</span>
                <span className="capitalize">{platform}</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            );
          }

          return (
            <Badge key={platform} variant="secondary" className="capitalize">
              <span className="mr-1">{icon}</span>
              {platform}
            </Badge>
          );
        })}
      </div>
      {publishedAt && (
        <p className="text-xs text-muted-foreground">
          Published on {new Date(publishedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
