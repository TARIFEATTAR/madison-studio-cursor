import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  LayoutGrid,
  X,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Camera,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ImageEditorModal, type ImageEditorImage } from "@/components/image-editor/ImageEditorModal";

interface GeneratedImage {
  id: string;
  image_url: string;
  session_id: string | null;
  session_name: string | null;
  goal_type: string | null;
  aspect_ratio: string | null;
  final_prompt: string | null;
  library_category: string | null;
  is_hero_image: boolean;
  created_at: string;
  is_archived: boolean;
}

type CategoryFilter = "all" | "product" | "lifestyle" | "ecommerce" | "social" | "editorial";
type SortOption = "recent" | "oldest" | "category";

export default function ImageLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Image editor modal
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageEditorImage | null>(null);

  // Fetch images from generated_images table
  const { data: images = [], isLoading, refetch } = useQuery({
    queryKey: ["image-library", currentOrganizationId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("📸 Image Library fetching...", { 
        organizationId: currentOrganizationId,
        userId: user.id 
      });

      // First try with organization_id if available
      if (currentOrganizationId) {
        const { data, error } = await supabase
          .from("generated_images")
          .select("*")
          .eq("organization_id", currentOrganizationId)
          .eq("is_archived", false)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          console.log(`✅ Image Library loaded ${data.length} images by org`);
          return data as GeneratedImage[];
        }
        
        if (error) {
          console.error("❌ Error fetching by org:", error);
        }
      }

      // Fallback: fetch by user_id
      console.log("📸 Trying fallback query by user_id...");
      const { data: userData, error: userError } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (userError) {
        console.error("❌ Error fetching by user:", userError);
        return [];
      }

      console.log(`✅ Image Library loaded ${userData?.length || 0} images by user`);
      return userData as GeneratedImage[];
    },
    enabled: !!user,
  });

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let result = [...images];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.session_name?.toLowerCase().includes(query) ||
          img.final_prompt?.toLowerCase().includes(query) ||
          img.library_category?.toLowerCase().includes(query)
      );
    }

    // Filter by category (use goal_type for detailed categorization)
    if (categoryFilter !== "all") {
      result = result.filter((img) =>
        img.goal_type?.toLowerCase().includes(categoryFilter)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "category":
          return (a.library_category || "").localeCompare(b.library_category || "");
        default:
          return 0;
      }
    });

    return result;
  }, [images, searchQuery, categoryFilter, sortBy]);

  // Handlers
  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage({
      id: image.id,
      imageUrl: image.image_url,
      prompt: image.final_prompt || "",
      isSaved: true,
      // Pass additional metadata
      goalType: image.goal_type || undefined,
      aspectRatio: image.aspect_ratio || undefined,
      createdAt: image.created_at,
      sessionName: image.session_name || undefined,
    });
    setImageEditorOpen(true);
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${image.session_name || "image"}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Image saved to your device" });
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleArchive = async (imageId: string) => {
    const { error } = await supabase
      .from("generated_images")
      .update({ is_archived: true })
      .eq("id", imageId);

    if (error) {
      toast({ title: "Archive failed", variant: "destructive" });
    } else {
      toast({ title: "Image archived" });
      refetch();
    }
  };

  const handleBulkArchive = async () => {
    if (selectedImages.size === 0) return;

    const { error } = await supabase
      .from("generated_images")
      .update({ is_archived: true })
      .in("id", Array.from(selectedImages));

    if (error) {
      toast({ title: "Archive failed", variant: "destructive" });
    } else {
      toast({ title: `${selectedImages.size} images archived` });
      setSelectedImages(new Set());
      refetch();
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const getCategoryBadgeColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case "product":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "lifestyle":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "ecommerce":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "social":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "editorial":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0908]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0908]/95 backdrop-blur-sm border-b border-[#2F2A26]">
        <div className="container mx-auto px-6 py-6 space-y-5">
          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl text-[#F5F1E8]">Image Library</h1>
              <p className="text-sm text-[#F5F1E8]/60 mt-1">
                {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"}
              </p>
            </div>
            <Button
              onClick={() => navigate("/darkroom")}
              className="bg-[#B8956A] hover:bg-[#C9A67B] text-[#0A0908]"
            >
              <Camera className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>

          {/* Search Bar - Full Width */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F5F1E8]/40 transition-colors group-focus-within:text-[#B8956A]" />
            <Input
              placeholder="Search images by name, prompt, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-2.5 bg-[#1A1816] border-[#2F2A26] text-[#F5F1E8] placeholder:text-[#F5F1E8]/40 focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/20"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Category + Sort */}
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
                <SelectTrigger className="w-[150px] bg-[#1A1816] border-[#2F2A26] text-[#F5F1E8] text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1816] border-[#2F2A26]">
                  <SelectItem value="all" className="text-[#F5F1E8]">All Categories</SelectItem>
                  <SelectItem value="product" className="text-[#F5F1E8]">Product</SelectItem>
                  <SelectItem value="lifestyle" className="text-[#F5F1E8]">Lifestyle</SelectItem>
                  <SelectItem value="ecommerce" className="text-[#F5F1E8]">E-commerce</SelectItem>
                  <SelectItem value="social" className="text-[#F5F1E8]">Social</SelectItem>
                  <SelectItem value="editorial" className="text-[#F5F1E8]">Editorial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[130px] bg-[#1A1816] border-[#2F2A26] text-[#F5F1E8] text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1816] border-[#2F2A26]">
                  <SelectItem value="recent" className="text-[#F5F1E8]">Most Recent</SelectItem>
                  <SelectItem value="oldest" className="text-[#F5F1E8]">Oldest First</SelectItem>
                  <SelectItem value="category" className="text-[#F5F1E8]">By Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right: View Mode + Bulk Actions */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#1A1816] border border-[#2F2A26] rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-[#B8956A]/20 text-[#B8956A]"
                      : "text-[#F5F1E8]/60 hover:text-[#F5F1E8]"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                    viewMode === "masonry"
                      ? "bg-[#B8956A]/20 text-[#B8956A]"
                      : "text-[#F5F1E8]/60 hover:text-[#F5F1E8]"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedImages.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#B8956A] text-[#B8956A]">
                    {selectedImages.size} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImages(new Set())}
                    className="border-[#2F2A26] text-[#F5F1E8]/60"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkArchive}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Sparkles className="w-8 h-8 text-[#B8956A] animate-pulse" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Camera className="w-16 h-16 text-[#F5F1E8]/20 mb-4" />
            <h3 className="text-xl font-serif text-[#F5F1E8] mb-2">No images yet</h3>
            <p className="text-[#F5F1E8]/60 mb-6 max-w-md">
              {searchQuery || categoryFilter !== "all"
                ? "No images match your filters. Try adjusting your search."
                : "Start creating stunning product images in the Dark Room."}
            </p>
            <Button
              onClick={() => navigate("/darkroom")}
              className="bg-[#B8956A] hover:bg-[#C9A67B] text-[#0A0908]"
            >
              <Camera className="w-4 h-4 mr-2" />
              Go to Dark Room
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "columns-2 md:columns-3 lg:columns-4 xl:columns-5 space-y-4"
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "group relative rounded-lg overflow-hidden bg-[#1A1816] border border-[#2F2A26]",
                    "hover:border-[#B8956A]/50 transition-all cursor-pointer",
                    selectedImages.has(image.id) && "ring-2 ring-[#B8956A]",
                    viewMode === "masonry" && "break-inside-avoid mb-4"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  {/* Image */}
                  <div className={cn(
                    "relative",
                    viewMode === "grid" && "aspect-square"
                  )}>
                    <img
                      src={image.image_url}
                      alt={image.session_name || "Generated image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Selection Checkbox */}
                    <div
                      className={cn(
                        "absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                        selectedImages.has(image.id)
                          ? "bg-[#B8956A] border-[#B8956A]"
                          : "bg-black/40 border-white/40 opacity-0 group-hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImageSelection(image.id);
                      }}
                    >
                      {selectedImages.has(image.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-black/40 hover:bg-black/60"
                          >
                            <MoreVertical className="w-4 h-4 text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1816] border-[#2F2A26]">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(image);
                            }}
                            className="text-[#F5F1E8] focus:bg-[#2F2A26]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View & Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            className="text-[#F5F1E8] focus:bg-[#2F2A26]"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(image.id);
                            }}
                            className="text-red-400 focus:bg-[#2F2A26]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Category Badge - use goal_type for display */}
                    {image.goal_type && (
                      <div className="absolute bottom-2 left-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            getCategoryBadgeColor(image.goal_type)
                          )}
                        >
                          {image.goal_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      <ImageEditorModal
        isOpen={imageEditorOpen}
        onClose={() => {
          setImageEditorOpen(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
        onSave={() => refetch()}
        onImageGenerated={(newImage) => {
          refetch();
          setSelectedImage(newImage);
        }}
        source="library"
      />
    </div>
  );
}
