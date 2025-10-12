import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Bookmark, Sparkles, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { contentTypeMapping, getContentTypeDisplayName } from "@/utils/contentTypeMapping";
import { getAllCategories } from "@/config/categoryTemplates";
import { getCollectionTemplatesForIndustry } from "@/config/collectionTemplates";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isTemplate, setIsTemplate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState(promptText);
  const [showPlaceholderSuggestions, setShowPlaceholderSuggestions] = useState(false);

  const [availableCollections, setAvailableCollections] = useState<any[]>([]);

  // Common placeholder suggestions
  const placeholderSuggestions = [
    { label: "Product Name", value: "{{PRODUCT_NAME}}" },
    { label: "Content Type", value: "{{CONTENT_TYPE}}" },
    { label: "Tone", value: "{{TONE}}" },
    { label: "Purpose", value: "{{PURPOSE}}" },
    { label: "Key Elements", value: "{{KEY_ELEMENTS}}" },
    { label: "Target Audience", value: "{{TARGET_AUDIENCE}}" },
    { label: "Word Count", value: "{{WORD_COUNT}}" },
    { label: "Custom Instructions", value: "{{CUSTOM_INSTRUCTIONS}}" },
  ];

  // Update edited prompt text when promptText prop changes
  useEffect(() => {
    setEditedPromptText(promptText);
  }, [promptText]);

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
      setSelectedContentType("");
      setSelectedCollection("");
      setTags([]);
      setTagInput("");
      setIsTemplate(true);
      setEditedPromptText(promptText);
      setShowPlaceholderSuggestions(false);
    }
  }, [open, promptText]);

  const handleInsertPlaceholder = (placeholder: string) => {
    setEditedPromptText(prev => prev + " " + placeholder);
    setShowPlaceholderSuggestions(false);
  };

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
        title: "Error",
        description: "Please enter a title for your prompt",
        variant: "destructive",
      });
      return;
    }

    if (!editedPromptText.trim()) {
      toast({
        title: "Error",
        description: "Prompt text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!selectedContentType) {
      toast({
        title: "Error",
        description: "Please select a content type",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCollection) {
      toast({
        title: "Error",
        description: "Please select a collection",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("prompts").insert({
        title: title.trim(),
        description: description.trim() || null,
        prompt_text: editedPromptText,
        content_type: selectedContentType as any,
        collection: selectedCollection as any,
        tags: tags.length > 0 ? tags : null,
        is_template: isTemplate,
        meta_instructions: {
          category: selectedCategory,
        },
        organization_id: currentOrganizationId,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prompt template saved successfully",
      });

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to save prompt template",
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
          {/* Prompt Preview with Edit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-ink-black">
                Prompt Text
              </Label>
              <Popover open={showPlaceholderSuggestions} onOpenChange={setShowPlaceholderSuggestions}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs border-[#B8956A] text-[#B8956A] hover:bg-[#B8956A]/10"
                  >
                    <Plus className="w-3 h-3" />
                    Add Placeholder
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-[#FFFCF5]" align="end">
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B6560] px-2 py-1 font-medium">
                      Click to insert:
                    </p>
                    {placeholderSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.value}
                        onClick={() => handleInsertPlaceholder(suggestion.value)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-[#B8956A]/10 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-[#2F2A26]">{suggestion.label}</span>
                        <code className="text-xs text-[#B8956A] opacity-60 group-hover:opacity-100">
                          {suggestion.value}
                        </code>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              value={editedPromptText}
              onChange={(e) => setEditedPromptText(e.target.value)}
              className="bg-parchment-white border-warm-gray/20 min-h-[120px] font-mono text-sm"
              placeholder="Enter your prompt text here. Use {{PLACEHOLDER}} syntax for dynamic values."
            />
            <p className="text-xs text-[#6B6560] mt-1">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Tip: Add placeholders like <code className="bg-[#B8956A]/10 px-1 rounded">{"{{PRODUCT_NAME}}"}</code> to make this template reusable
            </p>
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

          {/* Category Selection */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-ink-black mb-2 block">
              Category *
            </Label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedContentType(""); // Reset content type when category changes
              }}
            >
              <SelectTrigger className="bg-parchment-white border-warm-gray/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {contentTypeMapping.map((type) => (
                  <SelectItem key={type.name} value={type.name.toLowerCase()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Type Selection (Sub-type) */}
          {selectedCategory && (
            <div>
              <Label htmlFor="contentType" className="text-sm font-medium text-ink-black mb-2 block">
                Content Type *
              </Label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="bg-parchment-white border-warm-gray/20">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeMapping
                    .find((type) => type.name.toLowerCase() === selectedCategory)
                    ?.keys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {getContentTypeDisplayName(key)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
