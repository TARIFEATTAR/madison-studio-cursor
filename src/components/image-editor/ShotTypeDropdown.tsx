import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_IMAGE_CATEGORY_KEY,
  imageCategories,
  type ImageCategoryDefinition,
  type UseCaseKey,
  isStyleRecommended,
} from "@/data/imageCategories";

interface ShotTypeDropdownProps {
  useCase: UseCaseKey;
  onSelect: (shotType: ImageCategoryDefinition) => void;
  className?: string;
}

export default function ShotTypeDropdown({
  useCase,
  onSelect,
  className,
}: ShotTypeDropdownProps) {
  const [selected, setSelected] = useState(DEFAULT_IMAGE_CATEGORY_KEY);

  // Auto-select first recommended style when use case changes
  useEffect(() => {
    const recommended = imageCategories.find((style) =>
      isStyleRecommended(style.key, useCase)
    );
    if (recommended) {
      setSelected(recommended.key);
      onSelect(recommended);
    }
  }, [useCase]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = imageCategories.find(
      (st) => st.key === e.target.value
    );
    if (selectedType) {
      setSelected(selectedType.key);
      onSelect(selectedType);
    }
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      className={cn(
        "bg-studio-charcoal text-studio-text-primary border border-studio-border",
        "rounded-md px-3 py-2 text-sm",
        "focus:border-aged-brass focus:outline-none focus:ring-1 focus:ring-aged-brass/50",
        "hover:bg-studio-card hover:border-studio-border transition-colors",
        "cursor-pointer appearance-none",
        "h-10",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4CFC8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "12px",
        paddingRight: "2.5rem",
      }}
    >
      {imageCategories.map((category) => {
        const isRecommended = isStyleRecommended(category.key, useCase);
        return (
          <option
            key={category.key}
            value={category.key}
            className={cn(
              "bg-studio-charcoal text-studio-text-primary",
              isRecommended && "font-semibold"
            )}
          >
            {isRecommended ? "⭐ " : ""}
            {category.label}
            {isRecommended ? " (Recommended)" : ""}
          </option>
        );
      })}
    </select>
  );
}
