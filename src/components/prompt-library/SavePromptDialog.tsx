import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { getAllCategories } from "@/config/categoryTemplates";
import { getCollectionTemplatesForIndustry } from "@/config/collectionTemplates";

interface SavePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptText: string;
  suggestedTitle?: string;
  onSaved?: () => void;
}

export function SavePromptDialog({
  open,
  onOpenChange,
  promptText,
  suggestedTitle = "",
  onSaved,
}: SavePromptDialogProps) {
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isTemplate, setIsTemplate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const categories = getAllCategories();
  const [availableCollections, setAvailableCollections] = useState<any[]>([]);

  // Load collections from database
  useEffect(() => {
    if (currentOrganizationId && open) {
      loadCollections();
    }
  }, [currentOrganizationId, open]);

  const loadCollections = async () => {
    const { data, error } = await supabase
      .from("brand_collections")
      .select("*")
      .eq("organization_id", currentOrganizationId)
      .order("sort_order", { ascending: true });

    if (data && !error) {
      setAvailableCollections(data);
    }
  };

  // Set suggested title when dialog opens
  useEffect(() => {
    if (open && suggestedTitle) {
      setTitle(suggestedTitle);
    }
  }, [open, suggestedTitle]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setSelectedCollection("");
      setTags([]);
      setTagInput("");
      setIsTemplate(true);
    }
  }, [open]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your prompt template",
        variant: "destructive",
      });
      return;
    }

    if (!currentOrganizationId) {
      toast({
        title: "Organization required",
        description: "Please complete onboarding first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Determine content type from category
      const contentType = selectedCategory || "product";

      // Store title in the title column and description in meta_instructions
      const promptData: any = {
        title: title.trim(),
        prompt_text: promptText,
        content_type: contentType,
        collection: selectedCollection || "cadence",
        organization_id: currentOrganizationId,
        created_by: userData.user.id,
        is_template: isTemplate,
        tags: tags.length > 0 ? tags : null,
        meta_instructions: {
          description: description.trim() || null,
          user_created: true,
          saved_from: "manual",
        },
        times_used: 0,
      };

      const { error } = await supabase.from("prompts").insert(promptData);

      if (error) throw error;

      toast({
        title: "Prompt saved!",
        description: `"${title}" has been added to your Prompt Library`,
      });

      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-ink-black">
            <Bookmark className="w-5 h-5 text-brass" />
            Save as Prompt Template
          </DialogTitle>
          <DialogDescription className="text-warm-gray">
            Create a reusable template from this prompt for future use
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt Preview */}
          <div>
            <Label className="text-sm font-medium text-ink-black mb-2 block">
              Prompt Preview
            </Label>
            <div className="bg-vellum-cream border border-warm-gray/20 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-sm text-warm-gray whitespace-pre-wrap font-mono">
                {promptText}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="prompt-title" className="text-sm font-medium text-ink-black mb-2 block">
              Title *
            </Label>
            <Input
              id="prompt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product Description - Luxury Fragrance"
              className="bg-parchment-white border-warm-gray/20"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="prompt-description" className="text-sm font-medium text-ink-black mb-2 block">
              Description (Optional)
            </Label>
            <Textarea
              id="prompt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when and how to use this prompt template..."
              className="bg-parchment-white border-warm-gray/20 min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="prompt-category" className="text-sm font-medium text-ink-black mb-2 block">
              Category
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-parchment-white border-warm-gray/20">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product Description</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="visual">Visual Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collection */}
          <div>
            <Label htmlFor="prompt-collection" className="text-sm font-medium text-ink-black mb-2 block">
              Collection
            </Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="bg-parchment-white border-warm-gray/20">
                <SelectValue placeholder="Select collection..." />
              </SelectTrigger>
              <SelectContent>
                {availableCollections.length === 0 ? (
                  <SelectItem value="cadence">Default Collection</SelectItem>
                ) : (
                  availableCollections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.name.toLowerCase().replace(/\s+/g, '_')}>
                      {collection.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="prompt-tags" className="text-sm font-medium text-ink-black mb-2 block">
              Tags
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="prompt-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags (press Enter)"
                  className="bg-parchment-white border-warm-gray/20"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  className="border-brass text-brass hover:bg-brass/10"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-brass/10 text-brass hover:bg-brass/20 pl-3 pr-1 py-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-brass-glow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save as Template Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-template"
              checked={isTemplate}
              onCheckedChange={(checked) => setIsTemplate(checked as boolean)}
              className="border-brass data-[state=checked]:bg-brass data-[state=checked]:border-brass"
            />
            <Label
              htmlFor="is-template"
              className="text-sm font-medium text-ink-black cursor-pointer"
            >
              Save as reusable template
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-warm-gray/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-warm-gray/20 text-warm-gray hover:bg-warm-gray/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-gradient-to-r from-brass to-brass-glow hover:from-brass-glow hover:to-brass text-white"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
