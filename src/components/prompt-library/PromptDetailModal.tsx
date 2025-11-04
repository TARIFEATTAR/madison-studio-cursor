import { Sparkles, Copy, Check, Star, TrendingUp, Clock, Tag, Calendar, Edit2, Image as ImageIcon, Settings, Folder, BarChart3, ChevronUp, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCollections } from "@/hooks/useCollections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCollectionIcon } from "@/utils/collectionIcons";
import { CategoryBadge } from "./CategoryBadge";
import type { Prompt } from "@/pages/Templates";

// Category mapping between UI keys and database values
const CATEGORY_MAPPING = {
  'product': 'product_photography',
  'lifestyle': 'lifestyle',
  'ecommerce': 'e-commerce',
  'social': 'social_media',
  'editorial': 'editorial',
  'creative': 'creative',
  'flat_lay': 'flat_lay',
} as const;

const REVERSE_CATEGORY_MAPPING: Record<string, string> = {
  'product_photography': 'product',
  'lifestyle': 'lifestyle',
  'e-commerce': 'ecommerce',
  'social_media': 'social',
  'editorial': 'editorial',
  'creative': 'creative',
  'flat_lay': 'flat_lay',
};

const IMAGE_CATEGORIES = [
  { key: "product", label: "Product Photography" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "ecommerce", label: "E-commerce" },
  { key: "social", label: "Social Media" },
  { key: "editorial", label: "Editorial" },
  { key: "creative", label: "Creative & Artistic" },
  { key: "flat_lay", label: "Flat Lay" },
] as const;

interface PromptDetailModalProps {
  prompt: Prompt;
  open: boolean;
  onClose: () => void;
  onUse: () => void;
  onUpdate?: () => void;
  imageUrl?: string | null;
}

const collectionColors: Record<string, string> = {
  humanities: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30",
  cadence: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30", // Legacy
  reserve: "bg-golden-brown/20 text-golden-brown border-golden-brown/30",
  purity: "bg-soft-ivory/80 text-deep-charcoal border-sandstone",
  elemental: "bg-stone-beige/60 text-deep-charcoal border-sandstone",
  sacred_space: "bg-stone-beige/60 text-deep-charcoal border-sandstone", // Legacy
};

const PromptDetailModal = ({
  prompt,
  open,
  onClose,
  onUse,
  onUpdate,
  imageUrl,
}: PromptDetailModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collections } = useCollections();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt.prompt_text);

  // Reset form when prompt changes or modal opens/closes
  useEffect(() => {
    if (open) {
      setEditedPrompt(prompt.prompt_text);
      setIsEditing(false);
    }
  }, [prompt.id, open]);

  // Extract generation settings from additional_context
  const additionalContext = prompt.additional_context as any;
  const modelRaw = additionalContext?.model || "nano-banana";
  // Format model name for display (nano-banana -> Nano Banana, dall-e-3 -> DALL-E 3, etc.)
  const model = modelRaw === "nano-banana" ? "Nano Banana" : 
                modelRaw === "dall-e-3" || modelRaw === "DALL-E 3" ? "DALL-E 3" : 
                modelRaw.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const style = additionalContext?.style || additionalContext?.photorealistic ? "Photorealistic" : "Natural";
  const ratio = additionalContext?.aspect_ratio || "1:1";

  const handleLoadInImageStudio = () => {
    navigate("/image-editor", {
      state: { 
        loadedPrompt: prompt.prompt_text,
        aspectRatio: prompt.additional_context?.aspect_ratio,
        outputFormat: prompt.additional_context?.output_format
      }
    });
    onClose();
    toast({
      title: "Loaded in Image Studio",
      description: "Your image recipe is ready to use",
    });
  };

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
      year: 'numeric'
    });
  };

  const handleSaveMetadata = async () => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({
          prompt_text: editedPrompt,
        })
        .eq("id", prompt.id);

      if (error) throw error;

      toast({
        title: "Prompt updated",
        description: "Prompt text has been saved successfully.",
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
    }
  };

  const CollectionIcon = getCollectionIcon(prompt.collection);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Section - Image */}
          <div className="w-full md:w-1/2 p-6 bg-muted/30 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={prompt.title || "Generated image"}
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
              />
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center bg-muted/50 rounded-lg border border-border/40">
                <div className="text-center space-y-2">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Metadata Cards */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Prompt Card */}
                <Card className="p-4 border-border/40">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold">Prompt</h3>
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyPrompt}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        title="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      placeholder="Enter prompt text..."
                      className="min-h-[120px] resize-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {prompt.prompt_text}
                    </p>
                  )}
                </Card>

                {/* Generation Settings Card */}
                <Card className="p-4 border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Generation Settings</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style:</span>
                      <span className="font-medium">{style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ratio:</span>
                      <span className="font-medium">{ratio}</span>
                    </div>
                  </div>
                </Card>

                {/* Usage Statistics Card */}
                <Card className="p-4 border-border/40">
                  <h3 className="text-sm font-semibold mb-3">Usage Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-semibold">{prompt.times_used || 0}</div>
                      <div className="text-xs text-muted-foreground">Uses</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Star className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {prompt.avg_quality_rating?.toFixed(1) || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {prompt.effectiveness_score ? `${prompt.effectiveness_score}%` : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Effective</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-semibold">v{prompt.version || 1}</div>
                      <div className="text-xs text-muted-foreground">Version</div>
                    </div>
                  </div>
                </Card>

                {/* Category Card */}
                <Card className="p-4 border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Category</h3>
                  </div>
                  <div>
                    <CategoryBadge prompt={prompt} className="static" />
                  </div>
                </Card>

                {/* Created Card */}
                <Card className="p-4 border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Created</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(prompt.created_at)}
                  </p>
                </Card>

              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              {isEditing ? (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedPrompt(prompt.prompt_text);
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveMetadata}
                    className="flex-1 gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </Button>
                  <Button
                    onClick={handleLoadInImageStudio}
                    className="flex-1 gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Load in Image Studio
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailModal;
