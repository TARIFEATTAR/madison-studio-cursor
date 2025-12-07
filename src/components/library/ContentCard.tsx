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

  // Smart title extraction - if title looks like a slug/filename, extract from content
  const displayTitle = useMemo(() => {
    // Check if title looks like a generated slug (e.g., "blog_article - Dec 7...")
    const isGeneratedTitle = /^[a-z_]+\s*-\s*[A-Z][a-z]{2}\s+\d/i.test(content.title);
    
    if (isGeneratedTitle && content.content) {
      // Try to extract first meaningful sentence/heading from content
      const firstLine = content.content.split(/[.\n]/)[0]?.trim();
      if (firstLine && firstLine.length > 10 && firstLine.length < 100) {
        return firstLine;
      }
      // Fallback: just use content type as title
      const category = getContentCategoryLabel(content.contentType);
      return category || content.title;
    }
    
    return content.title;
  }, [content.title, content.content, content.contentType]);

  // Smart content type badge - combines category + subtype for sequences
  const contentTypeBadge = useMemo(() => {
    const type = content.contentType?.toLowerCase() || '';
    
    // Email sequences - combined badge with specific labels
    if (type.includes('email_3part') || type === '3-part sequence') {
      return { label: '3-Part Email', icon: Mail };
    }
    if (type.includes('email_5part') || type === '5-part sequence') {
      return { label: '5-Part Email', icon: Mail };
    }
    if (type.includes('email_7part') || type === '7-part sequence') {
      return { label: '7-Part Email', icon: Mail };
    }
    
    // Email newsletter
    if (type.includes('newsletter')) {
      return { label: 'Newsletter', icon: Mail };
    }
    
    // Email subject lines
    if (type.includes('subject_lines')) {
      return { label: 'Subject Lines', icon: Mail };
    }
    
    // Single email (catch-all for other email types)
    if (type.includes('email')) {
      return { label: 'Email', icon: Mail };
    }
    
    // Blog/Article
    if (type.includes('blog') || type === 'blog_post' || type === 'blog_article') {
      return { label: 'Blog', icon: null };
    }
    
    // Video/Podcast Scripts
    if (type.includes('video_script')) {
      return { label: 'Video Script', icon: null };
    }
    if (type.includes('podcast_script')) {
      return { label: 'Podcast', icon: null };
    }
    
    // Social media
    if (type.includes('social_media_post') || type === 'social') {
      return { label: 'Social Post', icon: null };
    }
    if (type.includes('carousel')) {
      return { label: 'Carousel', icon: null };
    }
    if (type.includes('short_form_video')) {
      return { label: 'Short Video', icon: null };
    }
    if (['instagram', 'linkedin', 'facebook', 'twitter', 'youtube'].some(s => type.includes(s))) {
      return { label: 'Social', icon: null };
    }
    
    // Product content
    if (type.includes('product_description')) {
      return { label: 'Product', icon: null };
    }
    if (type.includes('product_story')) {
      return { label: 'Product Story', icon: null };
    }
    if (type.includes('collection_page')) {
      return { label: 'Collection', icon: null };
    }

    // Brand content
    if (type.includes('brand_story')) {
      return { label: 'Brand Story', icon: null };
    }
    if (type.includes('faq_page')) {
      return { label: 'FAQ', icon: null };
    }

    // Conversion content
    if (type.includes('ad_creative')) {
      return { label: 'Ad Creative', icon: null };
    }
    if (type.includes('ad_copy')) {
      return { label: 'Ad Copy', icon: null };
    }
    if (type.includes('landing_page')) {
      return { label: 'Landing Page', icon: null };
    }
    if (type.includes('website_hero') || type.includes('hero_copy')) {
      return { label: 'Hero Copy', icon: null };
    }

    // Social extras
    if (type.includes('testimonial')) {
      return { label: 'Testimonial', icon: null };
    }
    if (type.includes('quote') || type.includes('hook')) {
      return { label: 'Quote/Hook', icon: null };
    }

    // Announcements
    if (type.includes('launch_announcement')) {
      return { label: 'Launch', icon: null };
    }
    if (type.includes('press_release')) {
      return { label: 'Press Release', icon: null };
    }
    if (type.includes('sms')) {
      return { label: 'SMS', icon: null };
    }

    // Visual content
    if (type.includes('visual') || type.includes('image') || type.includes('graphic') || type.includes('campaign_concept')) {
      return { label: 'Visual', icon: null };
    }
    
    // Fallback to category label
    const category = getContentCategoryLabel(content.contentType);
    return category ? { label: category, icon: null } : null;
  }, [content.contentType]);

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
        "cursor-pointer transition-all duration-300 bg-card border border-border/30",
        "hover:border-brand-brass hover:shadow-level-2 relative group",
        viewMode === "list" && "flex flex-row items-start gap-6",
        content.archived && "opacity-60",
        selected && "ring-2 ring-brand-brass border-brand-brass"
      )}
    >
      {/* Action buttons - top right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Action Buttons */}
        <div className="flex items-center bg-card/90 backdrop-blur-sm rounded-lg border border-border/30 p-1 gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPublishDrawerOpen(true);
            }}
            className="h-7 w-7 p-0 hover:bg-brand-brass/10 rounded-md"
            title={content.status === "published" ? "Update Publishing" : "Mark as Published"}
          >
            <Send className="w-3.5 h-3.5 text-muted-foreground hover:text-brand-brass transition-colors" />
          </Button>
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="h-7 w-7 p-0 hover:bg-brand-brass/10 rounded-md"
              title={content.archived ? "Unarchive" : "Archive"}
            >
              {content.archived ? (
                <ArchiveRestore className="w-3.5 h-3.5 text-muted-foreground hover:text-brand-brass transition-colors" />
              ) : (
                <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-brand-brass transition-colors" />
              )}
            </Button>
          )}
        </div>
        
        {/* Checkbox - separate from action buttons */}
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className="w-5 h-5 rounded border-2 border-border/60 bg-card text-brand-brass focus:ring-brand-brass focus:ring-offset-0 cursor-pointer appearance-none checked:bg-brand-brass checked:border-brand-brass ml-1"
            style={{
              backgroundImage: selected 
                ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                : 'none'
            }}
          />
        )}
      </div>

      <div className="p-6 flex flex-col">
        {/* Header Section: Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Primary Badge: Source Type */}
          {isEmailComposer && (
            <Badge 
              variant="default"
              className="text-xs font-semibold bg-gradient-to-r from-brass to-[#9B8A6F] text-white border-0 flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Email Composer
            </Badge>
          )}
          {content.sourceTable === "master_content" && !isEmailComposer && (
            <Badge 
              variant="default"
              className="text-xs font-semibold bg-brand-brass hover:bg-brand-brass/90 text-brand-parchment border-0"
            >
              Master Content
            </Badge>
          )}
          {content.sourceTable === "derivative_assets" && (
            <Badge 
              variant="secondary"
              className="text-xs font-medium"
            >
              Derivative Asset
            </Badge>
          )}
          {content.sourceTable === "generated_images" && (
            <Badge 
              variant="secondary"
              className="text-xs font-medium"
            >
              Generated Image
            </Badge>
          )}

          {/* Secondary Badge: Content Type (smart combined label) */}
          {contentTypeBadge && (
            <Badge 
              variant="outline"
              className="text-xs border-border/50 font-medium flex items-center gap-1"
            >
              {contentTypeBadge.icon && <contentTypeBadge.icon className="w-3 h-3" />}
              {contentTypeBadge.label}
            </Badge>
          )}

          {/* Archived indicator - subtle */}
          {content.archived && (
            <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">
              Archived
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 mb-3" />

        {/* Title Section */}
        <h3 className="font-serif text-xl text-foreground group-hover:text-brand-brass transition-colors duration-200 line-clamp-2 mb-3">
          {displayTitle}
        </h3>

        {/* Divider */}
        <div className="h-px bg-border/20 mb-3" />

        {/* Content Preview - Flex grow for consistent card heights */}
        <div className="flex-1 min-h-[60px]">
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
        </div>

        {/* Publishing Status - Only show if published */}
        {content.publishedTo && content.publishedTo.length > 0 && (
          <div className="py-2">
            <PublishingStatus
              publishedTo={content.publishedTo}
              externalUrls={content.externalUrls}
              publishedAt={content.publishedAt}
              compact
            />
          </div>
        )}

        {/* Metadata Footer - Always at bottom */}
        <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
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
                    i < content.rating! ? "fill-brand-brass text-brand-brass" : "text-muted-foreground/20"
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
