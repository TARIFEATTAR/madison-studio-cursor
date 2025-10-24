import { cn } from "@/lib/utils";

interface ContentDotProps {
  type: string;
  time?: string | null;
  onClick?: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  master: "bg-blue-500",
  output: "bg-purple-500",
  derivative: "bg-orange-500",
  Email: "bg-blue-500",
  "Instagram Post": "bg-purple-500",
  "Instagram Caption": "bg-purple-500",
  "Blog Post": "bg-orange-500",
  "LinkedIn Post": "bg-blue-600",
  "Product Description": "bg-amber-500",
  "Newsletter": "bg-blue-500",
  "Social Media": "bg-purple-500",
};

export function ContentDot({ type, time, onClick }: ContentDotProps) {
  const color = PLATFORM_COLORS[type] || "bg-charcoal";

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={cn(
          "w-3 h-3 rounded-full transition-transform hover:scale-125",
          color
        )}
        title={type}
      />
      {time && (
        <span className="text-[10px] text-charcoal/60 whitespace-nowrap">
          {time}
        </span>
      )}
    </div>
  );
}
