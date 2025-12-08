import { cn } from "@/lib/utils";
import { USE_CASES, type UseCaseKey, getUseCaseByKey } from "@/data/imageCategories";
import type { LucideIcon } from "lucide-react";

interface UseCaseSelectorProps {
  value: UseCaseKey;
  onSelect: (useCase: UseCaseKey) => void;
  className?: string;
}

export default function UseCaseSelector({
  value,
  onSelect,
  className,
}: UseCaseSelectorProps) {
  const selectedUseCase = getUseCaseByKey(value);

  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value as UseCaseKey)}
      className={cn(
        "bg-studio-charcoal text-studio-text-primary border border-studio-border",
        "rounded-md px-3 py-2 text-sm font-medium",
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
      {USE_CASES.map((useCase) => (
        <option
          key={useCase.key}
          value={useCase.key}
          className="bg-studio-charcoal text-studio-text-primary"
        >
          {useCase.label}
        </option>
      ))}
    </select>
  );
}


















