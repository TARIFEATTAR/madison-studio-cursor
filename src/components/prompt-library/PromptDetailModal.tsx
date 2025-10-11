import { Sparkles, Copy, Check, Star, TrendingUp, Clock, Tag, Calendar } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getCollectionIcon } from "@/utils/collectionIcons";
import type { Prompt } from "@/pages/Templates";

interface PromptDetailModalProps {
  prompt: Prompt;
  open: boolean;
  onClose: () => void;
  onUse: () => void;
}

const collectionColors: Record<string, string> = {
  cadence: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30",
  reserve: "bg-golden-brown/20 text-golden-brown border-golden-brown/30",
  purity: "bg-soft-ivory/80 text-deep-charcoal border-sandstone",
  sacred_space: "bg-stone-beige/60 text-deep-charcoal border-sandstone",
};

const PromptDetailModal = ({
  prompt,
  open,
  onClose,
  onUse,
}: PromptDetailModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Prompt text has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CollectionIcon = getCollectionIcon(prompt.collection);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{prompt.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2">
                <Badge className={collectionColors[prompt.collection] || "bg-muted"}>
                  {CollectionIcon && <CollectionIcon className="w-3 h-3 mr-1" />}
                  {prompt.collection.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {prompt.content_type.replace("_", " ")}
                </Badge>
                {prompt.is_template && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <Star className="w-3 h-3 mr-1 fill-primary" />
                    Template
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold">{prompt.times_used || 0}</div>
                <div className="text-xs text-muted-foreground">Uses</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Star className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold">
                  {prompt.avg_quality_rating?.toFixed(1) || "—"}
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold">
                  {prompt.effectiveness_score ? `${prompt.effectiveness_score}%` : "—"}
                </div>
                <div className="text-xs text-muted-foreground">Effectiveness</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold">v{prompt.version || 1}</div>
                <div className="text-xs text-muted-foreground">Version</div>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {prompt.scent_family && (
                <div>
                  <div className="text-muted-foreground mb-1">Scent Family</div>
                  <div className="font-medium capitalize">{prompt.scent_family}</div>
                </div>
              )}
              <div>
                <div className="text-muted-foreground mb-1">Created</div>
                <div className="font-medium text-xs">{formatDate(prompt.created_at)}</div>
              </div>
              {prompt.last_used_at && (
                <div>
                  <div className="text-muted-foreground mb-1">Last Used</div>
                  <div className="font-medium text-xs">{formatDate(prompt.last_used_at)}</div>
                </div>
              )}
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Tag className="w-4 h-4" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-border/40 text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Prompt Text */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Prompt Text</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPrompt}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                {prompt.prompt_text}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button
            onClick={() => {
              onUse();
              onClose();
            }}
            className="flex-1 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailModal;
