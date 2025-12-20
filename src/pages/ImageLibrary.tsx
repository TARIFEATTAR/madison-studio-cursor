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
    <div className="min-h-screen bg-[var(--darkroom-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--darkroom-bg)]/95 backdrop-blur-sm border-b border-[var(--darkroom-border)]">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl md:text-3xl text-[var(--darkroom-text)]">Image Library</h1>
              <p className="text-xs md:text-sm text-[var(--darkroom-text)]/60 mt-1">
                {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"}
              </p>
            </div>
            <Button
              onClick={() => navigate("/darkroom")}
              className="bg-[var(--darkroom-accent)] hover:bg-[var(--darkroom-accent-hover)] text-[var(--darkroom-bg)] flex-shrink-0"
              size="sm"
            >
              <Camera className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Create New</span>
            </Button>
          </div>

          {/* Search Bar - Full Width */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--darkroom-text)]/40 transition-colors group-focus-within:text-[var(--darkroom-accent)]" />
              <Input
              placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 py-2 md:py-2.5 text-sm md:text-base bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] placeholder:text-[var(--darkroom-text)]/40 focus:border-[var(--darkroom-accent)] focus:ring-2 focus:ring-[var(--darkroom-accent)]/20"
              />
            </div>

          {/* Filters Row - Mobile: Stack, Desktop: Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            {/* Left: Category + Sort */}
            <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
                <SelectTrigger className="w-full md:w-[150px] bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                <SelectItem value="all" className="text-[var(--darkroom-text)]">All Categories</SelectItem>
                <SelectItem value="product" className="text-[var(--darkroom-text)]">Product</SelectItem>
                <SelectItem value="lifestyle" className="text-[var(--darkroom-text)]">Lifestyle</SelectItem>
                <SelectItem value="ecommerce" className="text-[var(--darkroom-text)]">E-commerce</SelectItem>
                <SelectItem value="social" className="text-[var(--darkroom-text)]">Social</SelectItem>
                <SelectItem value="editorial" className="text-[var(--darkroom-text)]">Editorial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full md:w-[130px] bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                <SelectItem value="recent" className="text-[var(--darkroom-text)]">Most Recent</SelectItem>
                <SelectItem value="oldest" className="text-[var(--darkroom-text)]">Oldest First</SelectItem>
                <SelectItem value="category" className="text-[var(--darkroom-text)]">By Category</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Right: View Mode + Bulk Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-[var(--darkroom-surface)] border border-[var(--darkroom-border)] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-accent)]"
                    : "text-[var(--darkroom-text)]/60 hover:text-[var(--darkroom-text)]"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                  viewMode === "masonry"
                    ? "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-accent)]"
                    : "text-[var(--darkroom-text)]/60 hover:text-[var(--darkroom-text)]"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedImages.size > 0 && (
                <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[var(--darkroom-accent)] text-[var(--darkroom-accent)] text-xs">
                  {selectedImages.size}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages(new Set())}
                  className="border-[var(--darkroom-border)] text-[var(--darkroom-text)]/60 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkArchive}
                  className="h-8 text-xs"
                >
                  <Trash2 className="w-3 h-3 md:mr-1" />
                  <span className="hidden md:inline">Archive</span>
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 md:py-20">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[var(--darkroom-accent)] animate-pulse" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
            <Camera className="w-12 h-12 md:w-16 md:h-16 text-[var(--darkroom-text)]/20 mb-4" />
            <h3 className="text-lg md:text-xl font-serif text-[var(--darkroom-text)] mb-2">No images yet</h3>
            <p className="text-sm md:text-base text-[var(--darkroom-text)]/60 mb-6 max-w-md">
              {searchQuery || categoryFilter !== "all"
                ? "No images match your filters. Try adjusting your search."
                : "Start creating stunning product images in the Dark Room."}
            </p>
            <Button
              onClick={() => navigate("/darkroom")}
              className="bg-[var(--darkroom-accent)] hover:bg-[var(--darkroom-accent-hover)] text-[var(--darkroom-bg)]"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Go to Dark Room
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-3 md:gap-4",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 space-y-3 md:space-y-4"
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
                    "group relative rounded-lg overflow-hidden bg-[var(--darkroom-surface)] border border-[var(--darkroom-border)]",
                    "hover:border-[var(--darkroom-accent)]/50 transition-all cursor-pointer",
                    selectedImages.has(image.id) && "ring-2 ring-[var(--darkroom-accent)]",
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
                        "absolute top-2 left-2 w-6 h-6 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-all touch-manipulation z-10",
                        selectedImages.has(image.id)
                          ? "bg-[var(--darkroom-accent)] border-[var(--darkroom-accent)] opacity-100"
                          : "bg-black/40 border-white/40 opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
                    <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
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
                        <DropdownMenuContent align="end" className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(image);
                            }}
                            className="text-[var(--darkroom-text)] focus:bg-[var(--darkroom-border)]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View & Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            className="text-[var(--darkroom-text)] focus:bg-[var(--darkroom-border)]"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(image.id);
                            }}
                            className="text-red-400 focus:bg-[var(--darkroom-border)]"
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
