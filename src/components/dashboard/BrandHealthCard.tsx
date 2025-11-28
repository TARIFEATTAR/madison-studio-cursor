import { useNavigate } from "react-router-dom";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandHealthCard() {
  const navigate = useNavigate();
  const { brandHealth, isLoading: healthLoading } = useBrandHealth();

  const brandScore = brandHealth?.completeness_score || 94;

  const getBrandHealthColor = (score: number) => {
    if (score >= 90) return "text-[#A3C98D]";
    if (score >= 70) return "text-[#F5C16C]";
    return "text-[#E67E73]";
  };

  if (healthLoading) {
    return (
      <Skeleton className="col-span-1 md:col-span-4 h-[140px] rounded-xl" />
    );
  }

  return (
    <button 
      className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 rounded-xl min-h-[180px] md:min-h-[200px] text-left w-full touch-manipulation"
      onClick={() => navigate("/brand-health")}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Brand Health</h3>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#F0F0F0"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="var(--aged-brass-hex)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(brandScore / 100) * 226.2} 226.2`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-semibold text-[#1C150D]">{brandScore}</span>
            </div>
          </div>
          <div>
            <p className={`text-base md:text-lg font-semibold mb-1 ${getBrandHealthColor(brandScore)}`}>
              {brandScore >= 90 ? "Excellent" : brandScore >= 70 ? "Good" : "Needs Attention"}
            </p>
            <div className="hidden md:flex gap-3 text-xs text-[#1C150D]/60">
              <span>Voice +4%</span>
              <span>·</span>
              <span>Cadence Stable</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
