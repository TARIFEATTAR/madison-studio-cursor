import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageLibraryPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageLibraryPicker({ value, onChange }: ImageLibraryPickerProps) {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; id: string; source: string }>>([]);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    if (open && organizationId) {
      loadImages();
    }
  }, [open, organizationId]);

  const loadImages = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const allImages: Array<{ url: string; id: string; source: string }> = [];

      // Load from generated_images table
      const { data: generatedImages } = await supabase
        .from("generated_images")
        .select("id, image_url")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (generatedImages) {
        allImages.push(...generatedImages.map(img => ({
          id: img.id,
          url: img.image_url,
          source: 'Image Studio'
        })));
      }

      // Load from storage buckets
      const buckets = ['brand-assets', 'generated-images'];
      
      for (const bucketName of buckets) {
        const { data: files } = await supabase.storage
          .from(bucketName)
          .list(organizationId, {
            limit: 30,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (files) {
          for (const file of files) {
            const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${organizationId}/${file.name}`);
            
            allImages.push({
              id: file.id,
              url: publicUrl,
              source: bucketName === 'brand-assets' ? 'Brand Assets' : 'Storage'
            });
          }
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organizationId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setOpen(false);
      toast.success("Image uploaded successfully");
      
      // Reload images
      loadImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      new URL(urlInput);
      onChange(urlInput);
      setUrlInput("");
      setOpen(false);
      toast.success("Image URL added");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      
      <div className="flex gap-2">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Browse
        </Button>
      </div>

      {value && (
        <div className="mt-2 border border-border rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Upload a new image, select from library, or paste a URL
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="library" className="flex-1">Library</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
              <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-4">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No images in library</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your first image or use Image Studio
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pr-4">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => {
                          onChange(image.url);
                          setOpen(false);
                          toast.success("Image selected");
                        }}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all"
                      >
                        <img
                          src={image.url}
                          alt="Library image"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <span className="text-white font-medium text-sm">Select</span>
                          <span className="text-white/70 text-xs mt-1">{image.source}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Upload an image from your computer</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="max-w-xs"
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 10MB
                </p>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="flex flex-col items-center justify-center h-[400px]">
                <LinkIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Paste an image URL</p>
                <div className="w-full max-w-md space-y-3">
                  <Input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlSubmit();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    className="w-full"
                  >
                    Add Image
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
