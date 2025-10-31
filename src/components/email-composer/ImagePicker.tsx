import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; id: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPicker && user) {
      loadImages();
    }
  }, [showPicker, user]);

  const loadImages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get organization
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!memberData?.organization_id) {
        setLoading(false);
        return;
      }

      // Get generated images from image studio
      const { data: imageData, error } = await supabase
        .from("generated_images")
        .select("id, image_url")
        .eq("organization_id", memberData.organization_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (imageData) {
        setImages(imageData.map(img => ({ id: img.id, url: img.image_url })));
      }
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="header-image" className="text-sm">Header Image</Label>
      
      <div className="flex gap-2">
        <Input
          id="header-image"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg or paste URL"
          className="flex-1 bg-background"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(true)}
          className="shrink-0"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Browse
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="mt-2 border border-border rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Header preview"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-3xl bg-popover border-border">
          <DialogHeader>
            <DialogTitle>Select Image from Studio</DialogTitle>
            <DialogDescription>
              Choose an image from your Image Studio library
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No images found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create images in Image Studio first
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      onChange(image.url);
                      setShowPicker(false);
                      toast.success("Image selected");
                    }}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                  >
                    <img
                      src={image.url}
                      alt="Studio image"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium text-sm">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
