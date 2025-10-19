import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "x", label: "X (Twitter)", icon: "🐦" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "pinterest", label: "Pinterest", icon: "📌" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "blog", label: "Blog/Website", icon: "📝" },
  { id: "email", label: "Email Newsletter", icon: "📧" },
  { id: "youtube", label: "YouTube", icon: "📹" },
  { id: "other", label: "Other", icon: "🌐" },
];

interface PublishingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentTitle: string;
  sourceTable: "master_content" | "derivative_assets" | "outputs";
  onSuccess?: () => void;
}

export function PublishingDrawer({
  open,
  onOpenChange,
  contentId,
  contentTitle,
  sourceTable,
  onSuccess,
}: PublishingDrawerProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformUrls, setPlatformUrls] = useState<Record<string, string>>({});
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleUrlChange = (platformId: string, url: string) => {
    setPlatformUrls((prev) => ({
      ...prev,
      [platformId]: url,
    }));
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform where you published this content.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        published_to: selectedPlatforms,
        external_urls: platformUrls,
        publish_notes: notes,
        published_at: publishDate.toISOString(),
        status: "published",
      };

      const { error } = await supabase
        .from(sourceTable)
        .update(updateData)
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "Content marked as published",
        description: `Successfully published to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}.`,
      });

      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setSelectedPlatforms([]);
      setPlatformUrls({});
      setNotes("");
      setPublishDate(new Date());
    } catch (error) {
      console.error("Error publishing content:", error);
      toast({
        title: "Error",
        description: "Failed to mark content as published. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[540px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Mark as Published</SheetTitle>
          <SheetDescription>
            Track where "{contentTitle}" has been published
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Publish Date */}
          <div className="space-y-2">
            <Label>Publish Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !publishDate && "text-muted-foreground"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                <Calendar
                  mode="single"
                  selected={publishDate}
                  onSelect={(date) => date && setPublishDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label>Publishing Platforms</Label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer",
                    selectedPlatforms.includes(platform.id)
                      ? "bg-primary/5 border-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlatformToggle(platform.id);
                  }}
                >
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={(checked) => {
                      handlePlatformToggle(platform.id);
                    }}
                  />
                  <label
                    htmlFor={platform.id}
                    className="flex-1 text-sm font-medium cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {platform.icon} {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Platform URLs */}
          {selectedPlatforms.length > 0 && (
            <div className="space-y-3">
              <Label>External URLs (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Add links to where your content is live
              </p>
              {selectedPlatforms.map((platformId) => {
                const platform = PLATFORMS.find((p) => p.id === platformId);
                return (
                  <div key={platformId} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {platform?.icon} {platform?.label}
                    </Label>
                    <Input
                      type="url"
                      placeholder={`https://...`}
                      value={platformUrls[platformId] || ""}
                      onChange={(e) => handleUrlChange(platformId, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Publishing Notes (Optional)</Label>
            <Textarea
              placeholder="Add notes about performance, engagement, or publishing context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChange(false);
              }}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handlePublish();
              }} 
              className="flex-1" 
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Published
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
