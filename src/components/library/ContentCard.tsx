import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Star, Archive, ArchiveRestore, Send, Mail } from "lucide-react";
import { collections } from "@/data/mockLibraryContent";
import { getDeliverableByValue } from "@/config/deliverableFormats";
import { cn } from "@/lib/utils";
import { PublishingStatus } from "./PublishingStatus";
import { PublishingDrawer } from "./PublishingDrawer";
import { BrandAlignmentButton } from "./BrandAlignmentButton";
import { useState, useMemo } from "react";
import { getContentSubtypeLabel, getContentCategoryLabel } from "@/utils/contentSubtypeLabels";
import { deserializeEmailState } from "@/utils/emailStateSerializer";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    contentType: string;
    collection: string;
    product?: string;
    content: string;
    createdAt: Date;
    wordCount: number;
    dipWeek?: number;
    rating?: number;
    archived: boolean;
    status?: string;
    publishedTo?: string[];
    externalUrls?: Record<string, string>;
    publishedAt?: string;
    sourceTable?: "master_content" | "derivative_assets" | "outputs" | "generated_images";
    brandConsistencyScore?: number;
    lastBrandCheckAt?: string;
    imageUrl?: string;
    aspectRatio?: string;
    finalPrompt?: string;
  };
  onClick: () => void;
  viewMode?: "grid" | "list";
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onArchive?: () => void;
  onPublishSuccess?: () => void;
}

export function ContentCard({ 
  content, 
  onClick, 
  viewMode = "grid",
  selectable = false,
  selected = false,
  onToggleSelect,
  onArchive,
  onPublishSuccess
}: ContentCardProps) {
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const deliverableFormat = getDeliverableByValue(content.contentType);
  const collectionInfo = collections.find(c => c.id === content.collection);
  
  // Check if this is an Email Composer email (has serialized state with HTML)
  const emailComposerData = useMemo(() => {
    if (content.sourceTable === 'master_content' && content.contentType === 'Email') {
      try {
        const emailState = deserializeEmailState(content.content);
        if (emailState.generatedHtml) {
          return emailState;
        }
      } catch (e) {
        // Not a serialized email, treat as regular content
      }
    }
    return null;
  }, [content]);

  const isEmailComposer = !!emailComposerData;
  
  const previewText = isEmailComposer 
    ? (emailComposerData.content || emailComposerData.title || "").substring(0, 150) + "..."
    : content.content.substring(0, 150) + (content.content.length > 150 ? "..." : "");
  const timeAgo = formatDistanceToNow(content.createdAt, { addSuffix: true });

  return (
    <Card
      onClick={(e) => {
        // Prevent opening detail modal while publish drawer is open
        if (publishDrawerOpen) return;
        // Don't trigger card click if clicking checkbox
        if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-brass hover:shadow-lg bg-card/50 backdrop-blur-sm",
        "border-border/20 relative",
        viewMode === "list" && "flex flex-row items-start gap-6",
        content.archived && "opacity-60",
        selected && "ring-2 ring-brass border-brass"
      )}
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
        `
      }}
    >
      {/* Action buttons - top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setPublishDrawerOpen(true);
          }}
          className="h-8 px-2 hover:bg-brass/10"
          title={content.status === "published" ? "Update Publishing" : "Mark as Published"}
        >
          <Send className="w-4 h-4 text-muted-foreground hover:text-brass" />
        </Button>
        {onArchive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="h-8 px-2 hover:bg-brass/10"
            title={content.archived ? "Unarchive" : "Archive"}
          >
            {content.archived ? (
              <ArchiveRestore className="w-4 h-4 text-muted-foreground hover:text-brass" />
            ) : (
              <Archive className="w-4 h-4 text-muted-foreground hover:text-brass" />
            )}
          </Button>
        )}
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className="w-5 h-5 rounded border-border text-brass focus:ring-brass cursor-pointer"
          />
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="font-serif text-xl text-foreground group-hover:text-brass transition-colors line-clamp-2">
            {content.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {/* Email Composer Badge - Special indicator for emails created in Email Composer */}
            {isEmailComposer && (
              <Badge 
                variant="default"
                className="text-xs font-semibold bg-gradient-to-r from-brass to-[#9B8A6F] text-white border-0 flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                Email Composer
              </Badge>
            )}
            
            {/* Master Content Badge - Primary Indicator */}
            {content.sourceTable === "master_content" && !isEmailComposer && (
              <Badge 
                variant="default"
                className="text-xs font-semibold bg-brass/90 hover:bg-brass text-white border-0"
              >
                Master Content
              </Badge>
            )}
            
            {/* Derivative Asset Badge */}
            {content.sourceTable === "derivative_assets" && (
              <Badge 
                variant="secondary"
                className="text-xs font-medium"
              >
                Derivative Asset
              </Badge>
            )}

            {/* Generated Image Badge */}
            {content.sourceTable === "generated_images" && (
              <Badge 
                variant="secondary"
                className="text-xs font-medium"
              >
                Generated Image
              </Badge>
            )}

            {/* Two-tier badge system: Category + Subtype */}
            {(() => {
              const category = getContentCategoryLabel(content.contentType);
              const subtype = getContentSubtypeLabel(content.contentType);
              
              return (
                <>
                  {/* Category Badge (Email, Social, Blog, etc.) */}
                  {category && (
                    <Badge 
                      variant="outline"
                      className="text-xs border-border/40 font-medium"
                    >
                      {category}
                    </Badge>
                  )}
                  
                  {/* Subtype Badge (Newsletter, Instagram, etc.) */}
                  {subtype && (
                    <Badge 
                      variant="outline"
                      className="text-xs border-border/40"
                    >
                      {deliverableFormat && <deliverableFormat.icon className="w-3 h-3 mr-1" />}
                      {subtype}
                    </Badge>
                  )}
                </>
              );
            })()}
            
            {collectionInfo && (
              <Badge variant="outline" className="text-xs border-border/40">
                {collectionInfo.icon} {collectionInfo.name}
              </Badge>
            )}

            {content.archived && (
              <Badge variant="destructive" className="text-xs">
                Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Content Preview - Special handling for Email Composer emails */}
        {isEmailComposer && emailComposerData ? (
          <div className="space-y-3">
            {/* Header Image Preview */}
            {emailComposerData.headerImage && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={emailComposerData.headerImage}
                  alt="Email header"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Email Content Preview */}
            <div className="space-y-2">
              {emailComposerData.subtitle && (
                <p className="text-sm font-medium text-foreground/80">
                  {emailComposerData.subtitle}
                </p>
              )}
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {previewText}
              </p>
              
              {/* Template Info */}
              {emailComposerData.template && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {emailComposerData.template.replace(/-/g, ' ')}
                  </Badge>
                  {emailComposerData.ctaText && (
                    <Badge variant="secondary" className="text-xs">
                      CTA: {emailComposerData.ctaText}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : content.sourceTable === "generated_images" && content.imageUrl ? (
          /* Generated Images Preview */
          <div className="space-y-2">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#252220] border border-[#3D3935]">
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-full h-full object-contain"
              />
            </div>
            {content.finalPrompt && (
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                "{content.finalPrompt.substring(0, 120)}..."
              </p>
            )}
          </div>
        ) : (
          /* Regular Content Preview */
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {previewText}
          </p>
        )}

        {/* Publishing Status */}
        {content.publishedTo && content.publishedTo.length > 0 && (
          <div className="pt-3">
            <PublishingStatus
              publishedTo={content.publishedTo}
              externalUrls={content.externalUrls}
              publishedAt={content.publishedAt}
              compact
            />
          </div>
        )}

        {/* Brand Alignment Button */}
        {(content.sourceTable === 'master_content' || content.sourceTable === 'derivative_assets') && (
          <div className="pt-3" onClick={(e) => e.stopPropagation()}>
            <BrandAlignmentButton
              contentId={content.id}
              contentType={content.sourceTable === 'master_content' ? 'master' : 'derivative'}
              title={content.title}
              content={content.content}
              currentScore={content.brandConsistencyScore}
              lastCheckAt={content.lastBrandCheckAt}
            />
          </div>
        )}

        <div className="pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{timeAgo}</span>
            <span>• {content.wordCount} words</span>
            {content.dipWeek && (
              <span>• Week {content.dipWeek}</span>
            )}
          </div>
          
          {content.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < content.rating! ? "fill-brass text-brass" : "text-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Publishing Drawer */}
      {content.sourceTable && (
        <PublishingDrawer
          open={publishDrawerOpen}
          onOpenChange={setPublishDrawerOpen}
          contentId={content.id}
          contentTitle={content.title}
          sourceTable={content.sourceTable}
          onSuccess={() => {
            onPublishSuccess?.();
            window.location.reload();
          }}
        />
      )}
    </Card>
  );
}
