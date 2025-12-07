/**
 * Image Picker Dialog for Video Project
 * Allows selecting images from the library for video scenes
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  Loader2, 
  Search, 
  Check,
  Upload,
  Link as LinkIcon,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string, id: string) => void;
  currentImageUrl?: string | null;
}

interface LibraryImage {
  id: string;
  url: string;
  source: string;
  createdAt?: string;
}

export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelectImage,
  currentImageUrl,
}: ImagePickerDialogProps) {
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "url">("library");

  // Load images when dialog opens
  useEffect(() => {
    if (open && orgId) {
      loadImages();
    }
  }, [open, orgId]);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setSearchQuery("");
      setUrlInput("");
    }
  }, [open]);

  const loadImages = async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const allImages: LibraryImage[] = [];

      // Load from generated_images table (Dark Room images)
      const { data: generatedImages, error } = await supabase
        .from("generated_images")
        .select("id, image_url, created_at")
        .eq("organization_id", orgId)
        .eq("media_type", "image")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading images:", error);
      }

      if (generatedImages) {
        allImages.push(...generatedImages.map(img => ({
          id: img.id,
          url: img.image_url,
          source: "Dark Room",
          createdAt: img.created_at,
        })));
      }

      // Load from storage buckets
      const buckets = ["brand-assets", "generated-images"];
      
      for (const bucketName of buckets) {
        try {
          const { data: files } = await supabase.storage
            .from(bucketName)
            .list(orgId, {
              limit: 30,
              sortBy: { column: "created_at", order: "desc" }
            });

          if (files) {
            for (const file of files) {
              if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                const { data: { publicUrl } } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(`${orgId}/${file.name}`);
                
                allImages.push({
                  id: file.id || `${bucketName}-${file.name}`,
                  url: publicUrl,
                  source: bucketName === "brand-assets" ? "Brand Assets" : "Uploads",
                });
              }
            }
          }
        } catch (err) {
          console.warn(`Could not load from ${bucketName}:`, err);
        }
      }

      setImages(allImages);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (image: LibraryImage) => {
    setSelectedId(image.id);
    onSelectImage(image.url, image.id);
    onOpenChange(false);
    toast.success("Image selected");
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      new URL(urlInput);
      onSelectImage(urlInput, `url-${Date.now()}`);
      onOpenChange(false);
      toast.success("Image added from URL");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  // Filter images by search query (could search by source)
  const filteredImages = images.filter(img => 
    !searchQuery || img.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-[#1a1816] border-[#b8956a]/20">
        <DialogHeader>
          <DialogTitle className="text-[#f5f0e6] font-serif text-xl">
            Select Image for Scene
          </DialogTitle>
          <DialogDescription className="text-[#b8956a]/70">
            Choose an image from your library or add from URL
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex-1 h-10",
              activeTab === "library" 
                ? "bg-[#b8956a] text-[#1a1816] border-[#b8956a] hover:bg-[#b8956a]/90" 
                : "bg-transparent border-[#b8956a]/30 text-[#f5f0e6] hover:bg-[#b8956a]/10 hover:border-[#b8956a]/50"
            )}
          >
            <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Library</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("url")}
            className={cn(
              "flex-1 h-10",
              activeTab === "url" 
                ? "bg-[#b8956a] text-[#1a1816] border-[#b8956a] hover:bg-[#b8956a]/90" 
                : "bg-transparent border-[#b8956a]/30 text-[#f5f0e6] hover:bg-[#b8956a]/10 hover:border-[#b8956a]/50"
            )}
          >
            <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>URL</span>
          </Button>
        </div>

        {activeTab === "library" ? (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8956a]/50" />
              <Input
                placeholder="Filter by source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2f2a26] border-[#b8956a]/20 text-[#f5f0e6] placeholder:text-[#b8956a]/40"
              />
            </div>

            {/* Image Grid */}
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-[#b8956a]" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Camera className="w-12 h-12 text-[#b8956a]/40 mb-3" />
                  <p className="text-[#f5f0e6]/70 font-medium">No images yet</p>
                  <p className="text-sm text-[#b8956a]/60 mt-1">
                    Create images in the Dark Room first
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-[#b8956a]/30 text-[#b8956a]"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = "/darkroom";
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Go to Dark Room
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredImages.map((image, index) => (
                    <motion.button
                      key={image.id}
                      type="button"
                      onClick={() => handleSelectImage(image)}
                      className={cn(
                        "relative group aspect-square rounded-lg overflow-hidden",
                        "border-2 transition-all duration-150",
                        selectedId === image.id || currentImageUrl === image.url
                          ? "border-[#b8956a] ring-2 ring-[#b8956a]/30"
                          : "border-[#b8956a]/20 hover:border-[#b8956a]/50"
                      )}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={image.url}
                        alt="Library image"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <Check className="w-6 h-6 text-white mb-1" />
                        <span className="text-white font-medium text-xs">Select</span>
                        <span className="text-white/60 text-[10px] mt-0.5">{image.source}</span>
                      </div>

                      {/* Selected Indicator */}
                      {(selectedId === image.id || currentImageUrl === image.url) && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#b8956a] flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#1a1816]" />
                        </div>
                      )}

                      {/* Source Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/80">
                        {image.source}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          /* URL Tab */
          <div className="flex flex-col items-center justify-center h-[400px]">
            <LinkIcon className="w-12 h-12 text-[#b8956a]/40 mb-4" />
            <p className="text-[#f5f0e6]/70 mb-4">Paste an image URL</p>
            <div className="w-full max-w-md space-y-3">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-[#2f2a26] border-[#b8956a]/20 text-[#f5f0e6] placeholder:text-[#b8956a]/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUrlSubmit();
                  }
                }}
              />
              <Button 
                onClick={handleUrlSubmit}
                className="w-full bg-[#b8956a] text-[#1a1816] hover:bg-[#b8956a]/90"
              >
                Add Image
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
