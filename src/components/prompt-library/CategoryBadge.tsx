import { Badge } from "@/components/ui/badge";
import { Camera, Sun, ShoppingCart, Share2, FileText, Lightbulb, Image as ImageIcon } from "lucide-react";
import { getCategoryBadgeColor, getCategoryLabel, getCategoryIcon } from "@/utils/imageRecipeHelpers";
import type { Prompt } from "@/pages/Templates";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  prompt: Prompt;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Sun,
  ShoppingCart,
  Share2,
  FileText,
  Lightbulb,
  Image: ImageIcon,
};

export function CategoryBadge({ prompt, className }: CategoryBadgeProps) {
  const imageType = (prompt.additional_context as any)?.image_type || null;
  const categoryLabel = getCategoryLabel(imageType);
  const categoryColor = getCategoryBadgeColor(imageType);
  const iconName = getCategoryIcon(imageType);
  const Icon = iconMap[iconName] || ImageIcon;

  if (!imageType) {
    return null;
  }

  const isStatic = className?.includes("static");
  
  return (
    <Badge
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border backdrop-blur-sm",
        !isStatic && "absolute bottom-2 right-2",
        categoryColor,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{categoryLabel}</span>
    </Badge>
  );
}

