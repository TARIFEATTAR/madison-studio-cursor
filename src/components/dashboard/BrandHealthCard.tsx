import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BrandQuickViewTrigger } from "@/components/brand";

interface BrandHealthCardProps {
  compact?: boolean;
}

export function BrandHealthCard({ compact = false }: BrandHealthCardProps) {
  const navigate = useNavigate();
  const { brandHealth, isLoading: healthLoading } = useBrandHealth();

  // Collapse state - default collapsed for returning users
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasVisited = localStorage.getItem('dashboard-visited');
    return !hasVisited; // Expand on first visit, collapse after
  });

  // Mark dashboard as visited
  useEffect(() => {
    localStorage.setItem('dashboard-visited', 'true');
  }, []);

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

  // Mock categories - in production these would come from useBrandHealth
  const categories = [
    { name: "Brand Voice", score: Math.min(100, brandScore + 5), action: "Refine voice" },
    { name: "Visual Identity", score: Math.max(0, brandScore - 8), action: "Add visuals" },
    { name: "Content Guidelines", score: brandScore, action: "Review guidelines" },
    { name: "Audience Clarity", score: Math.min(100, brandScore + 2), action: "Define audience" },
  ];

  if (healthLoading) {
    return (
      <div className={`bg-white border border-[#E0E0E0] rounded-xl ${compact ? 'h-full' : ''}`}>
        <Skeleton className="h-full min-h-[200px] rounded-xl skeleton-shimmer" />
      </div>
    );
  }

  // Compact mode - vertical layout for sidebar position
  if (compact) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col hover-lift">
        {/* Header - Always Visible & Clickable */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 md:p-5 text-left flex flex-col items-center hover:bg-[#FAFAFA] transition-colors touch-manipulation"
        >
          {/* Circular Progress - Centered */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#F0F0F0"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="var(--aged-brass-hex)"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${(brandScore / 100) * 226.2} 226.2`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-semibold text-[#1C150D]">{brandScore}</span>
            </div>
          </div>

          {/* Title & Rating - Centered */}
          <div className="text-center">
            <h3 className="text-xs font-medium text-[#1C150D]/60 mb-1">Brand Health</h3>
            <p className={`text-sm md:text-base font-semibold ${getBrandHealthColor(brandScore)}`}>
              {getRating(brandScore)}
            </p>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronDown 
            className={`w-4 h-4 text-[#1C150D]/40 transition-transform duration-200 mt-2 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expanded Section - Category Breakdown */}
        {isExpanded && (
          <div className="flex-1 px-4 pb-4 space-y-3 border-t border-[#E0E0E0] pt-3 animate-in slide-in-from-top-2 duration-200 overflow-auto">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-[#1C150D]">{category.name}</p>
                  <p className="text-xs text-[#1C150D]/60">{category.score}%</p>
                </div>
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#B8956A] transition-all duration-500 rounded-full"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Quick View & View Report Buttons */}
            <div className="flex gap-2 mt-2">
              <BrandQuickViewTrigger variant="minimal" className="flex-1 text-xs" />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/brand-health");
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Full Report
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed View - Show View Report Link */}
        {!isExpanded && (
          <div className="flex-1 flex items-end p-4 pt-0">
            <button
              onClick={() => navigate("/brand-health")}
              className="w-full text-xs text-[#B8956A] hover:text-[#A3865A] transition-colors text-center"
            >
              View Full Report →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full width mode - horizontal layout (original)
  return (
    <div className="col-span-1 md:col-span-4 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden transition-all duration-300 hover-lift">
      {/* Collapsed Header - Always Visible & Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 text-left flex items-center justify-between hover:bg-[#FAFAFA] transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-4 md:gap-6">
          {/* Circular Progress */}
          <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#F0F0F0"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="var(--aged-brass-hex)"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${(brandScore / 100) * 226.2} 226.2`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg md:text-xl font-semibold text-[#1C150D]">{brandScore}</span>
            </div>
          </div>

          {/* Title & Rating */}
          <div>
            <h3 className="text-sm font-medium text-[#1C150D]/60 mb-1">Brand Health</h3>
            <p className={`text-base md:text-lg font-semibold ${getBrandHealthColor(brandScore)}`}>
              {getRating(brandScore)}
            </p>
            <p className="text-xs text-[#1C150D]/50 hidden md:block">
              Voice +4% · Cadence Stable
            </p>
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <ChevronDown 
          className={`w-5 h-5 text-[#1C150D]/40 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Section - Category Breakdown */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 border-t border-[#E0E0E0] pt-4 animate-in slide-in-from-top-2 duration-200">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-[#1C150D]">{category.name}</p>
                <p className="text-sm text-[#1C150D]/60">{category.score}%</p>
              </div>
              <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#B8956A] transition-all duration-500 rounded-full"
                  style={{ width: `${category.score}%` }}
                />
              </div>
              {category.score < 85 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/brand-health");
                  }}
                  className="text-xs text-[#B8956A] hover:text-[#A3865A] mt-1 transition-colors"
                >
                  {category.action} →
                </button>
              )}
            </div>
          ))}

          {/* View Full Report Button */}
          <div className="pt-4 border-t border-[#E0E0E0]">
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/brand-health");
              }}
            >
              📄 View Living Brand Report →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
