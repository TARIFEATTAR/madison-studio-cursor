import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BrandQuickViewTrigger } from "@/components/brand";

export function BrandHealthNav() {
  const navigate = useNavigate();
  const { brandHealth, isLoading } = useBrandHealth();
  const [isOpen, setIsOpen] = useState(false);

  const brandScore = brandHealth?.completeness_score || 94;

  const getBrandHealthColor = (score: number) => {
    if (score >= 90) return "text-[#A3C98D]";
    if (score >= 70) return "text-[#F5C16C]";
    return "text-[#E67E73]";
  };

  const getRating = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Attention";
  };

  if (isLoading) {
    return (
      <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-8 px-3"
        >
          <div className="relative w-6 h-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#E5DFD1"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="var(--aged-brass-hex)"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${(brandScore / 100) * 18.85} 18.85`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-foreground">{brandScore}</span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            Brand Health
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#E5DFD1"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="var(--aged-brass-hex)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(brandScore / 100) * 113.1} 113.1`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">{brandScore}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Brand Health</h3>
              <p className={`text-sm font-semibold ${getBrandHealthColor(brandScore)}`}>
                {getRating(brandScore)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <BrandQuickViewTrigger variant="minimal" className="flex-1 text-xs" />
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                navigate("/brand-health");
                setIsOpen(false);
              }}
            >
              Full Report
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
