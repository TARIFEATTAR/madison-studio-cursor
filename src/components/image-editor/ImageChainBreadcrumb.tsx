import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isHero?: boolean;
  approvalStatus: "pending" | "flagged" | "rejected";
  parentImageId?: string;
  chainDepth: number;
  isChainOrigin: boolean;
  refinementInstruction?: string;
}

interface ImageChainBreadcrumbProps {
  currentImage: GeneratedImage;
  allImages: GeneratedImage[];
  onImageClick: (imageId: string) => void;
}

function buildChainFromImage(
  image: GeneratedImage,
  allImages: GeneratedImage[]
): GeneratedImage[] {
  const chain: GeneratedImage[] = [];
  let current: GeneratedImage | undefined = image;

  // Walk backwards to find origin
  while (current) {
    chain.unshift(current);
    current = allImages.find((img) => img.id === current?.parentImageId);
  }

  return chain;
}

export function ImageChainBreadcrumb({
  currentImage,
  allImages,
  onImageClick,
}: ImageChainBreadcrumbProps) {
  const chain = buildChainFromImage(currentImage, allImages);

  if (chain.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm flex-wrap bg-accent/30 p-2 rounded-lg border border-border/50">
      <span className="text-muted-foreground text-xs font-medium">Chain:</span>
      {chain.map((img, idx) => (
        <React.Fragment key={img.id}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onImageClick(img.id)}
            className={cn(
              "h-7 px-2 hover:bg-accent text-xs",
              img.id === currentImage.id && "bg-accent font-medium"
            )}
          >
            {idx === 0
              ? "Original"
              : `+${img.refinementInstruction?.substring(0, 15) || "refinement"}${
                  (img.refinementInstruction?.length || 0) > 15 ? "..." : ""
                }`}
          </Button>
          {idx < chain.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
