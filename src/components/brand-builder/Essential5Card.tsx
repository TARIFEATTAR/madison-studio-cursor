import { useState, useEffect } from "react";
import { Check, Edit2, Sparkles, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Essential5CardProps {
  title: string;
  subtitle: string;
  description: string;
  field: string;
  value?: string | string[];
  isCompleted: boolean;
  onApprove: (field: string, value: string | string[]) => void;
  organizationId: string | null;
  isSaving: boolean;
  isArray?: boolean;
  placeholder?: string;
}

export function Essential5Card({
  title,
  subtitle,
  description,
  field,
  value,
  isCompleted,
  onApprove,
  organizationId,
  isSaving,
  isArray = false,
  placeholder,
}: Essential5CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | string[]>(value || (isArray ? [] : ""));
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | string[] | null>(null);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (value) {
      setEditValue(value);
    } else if (!aiSuggestion && organizationId) {
      generateAISuggestion();
    }
  }, [value, organizationId]);

  const generateAISuggestion = async () => {
    if (!organizationId) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-brand-knowledge", {
        body: { knowledge_type: field, organizationId },
      });

      if (error) throw error;

      if (data?.suggestions) {
        let suggestion;
        switch (field) {
          case "target_audience":
            suggestion = data.suggestions.target_audience || data.suggestions.content;
            break;
          case "brand_voice":
            suggestion = data.suggestions.voice_guidelines || data.suggestions.content;
            break;
          case "mission":
            suggestion = data.suggestions.mission || data.suggestions.content;
            break;
          case "usp":
            suggestion = data.suggestions.differentiator || data.suggestions.content;
            break;
          case "key_messages":
            suggestion =
              data.suggestions.messages || data.suggestions.key_messages || [];
            break;
          default:
            suggestion = data.suggestions.content;
        }

        setAiSuggestion(suggestion);
        setEditValue(suggestion);
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      // Don't show error toast, just let user type manually
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (isArray) {
      const items = editValue as string[];
      if (items.length === 0) {
        toast.error("Please add at least one item");
        return;
      }
      onApprove(field, items);
    } else {
      const text = (editValue as string).trim();
      if (text.length < 20) {
        toast.error("Please provide more detail (at least 20 characters)");
        return;
      }
      onApprove(field, text);
    }
    setIsEditing(false);
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const items = editValue as string[];
    setEditValue([...items, newItem.trim()]);
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    const items = editValue as string[];
    setEditValue(items.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "bg-parchment-white border-2 transition-all",
        isCompleted
          ? "border-brass/40 shadow-sm"
          : "border-charcoal/10 hover:border-charcoal/20"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-6 border-b",
          isCompleted ? "bg-brass/5 border-brass/20" : "border-charcoal/10"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isCompleted ? (
                <div className="w-8 h-8 rounded-full bg-brass flex items-center justify-center">
                  <Check className="w-5 h-5 text-parchment-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-charcoal/20" />
              )}
              <div>
                <h3 className="font-serif text-2xl text-ink-black">{title}</h3>
                <p className="text-xs uppercase tracking-wider text-charcoal/60">{subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-charcoal/70 ml-11">{description}</p>
          </div>
          {isCompleted && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-charcoal/60 hover:text-ink-black"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-brass animate-pulse mx-auto mb-3" />
              <p className="text-sm text-charcoal/60">
                Madison is generating a suggestion based on your brand...
              </p>
            </div>
          </div>
        ) : isEditing || (!value && !isCompleted) ? (
          <div className="space-y-4">
            {isArray ? (
              <div className="space-y-3">
                {(editValue as string[]).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 bg-warm-cream/30 border border-charcoal/10 p-3 text-sm">
                      {item}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={placeholder || "Add a message..."}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                  />
                  <Button onClick={handleAddItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Textarea
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder || `Describe your ${subtitle.toLowerCase()}...`}
                rows={6}
                className="resize-none"
              />
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brass hover:bg-antique-gold text-ink"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(value || (isArray ? [] : ""));
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isArray ? (
              <ul className="space-y-2">
                {(value as string[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-brass mt-1">•</span>
                    <span className="text-charcoal/80">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-charcoal/80 leading-relaxed">{value as string}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
