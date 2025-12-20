import { useNavigate } from "react-router-dom";
import { Flame, Zap, Calendar, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 18) return "✨";
  return "🌙";
}

export function DashboardHero() {
  const navigate = useNavigate();
  const { userName, isLoading: profileLoading } = useUserProfile();
  const { organization, isLoading: orgLoading } = useOrganization();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = profileLoading || orgLoading || statsLoading;

  // Get AI suggestion from stats
  const aiSuggestion = stats?.aiSuggestion;

  // Generate encouraging subtitle based on state
  const getSubtitle = () => {
    if (stats?.onBrandScore && stats.onBrandScore >= 85) {
      return "Your brand is strong. Let's create something today.";
    }
    if (stats?.piecesCreatedThisWeek && stats.piecesCreatedThisWeek > 0) {
      return `You've created ${stats.piecesCreatedThisWeek} piece${stats.piecesCreatedThisWeek > 1 ? 's' : ''} this week. Keep the momentum going!`;
    }
    return "Ready to create content that connects?";
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 md:p-6">
        {/* Greeting skeleton */}
        <div className="mb-4">
          <Skeleton className="h-6 w-56 mb-1 skeleton-shimmer" />
          <Skeleton className="h-4 w-40 skeleton-shimmer" />
        </div>
        {/* CTAs skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Skeleton className="h-9 w-32 skeleton-shimmer" />
          <Skeleton className="h-9 w-24 skeleton-shimmer" />
          <Skeleton className="h-9 w-24 skeleton-shimmer" />
        </div>
        {/* Suggestion skeleton */}
        <Skeleton className="h-16 w-full rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 md:p-6 hover-lift transition-all duration-200 h-full flex flex-col">
        {/* Greeting Section */}
        <div className="mb-4">
          <h1 className="font-cormorant text-xl md:text-2xl text-[#1C150D] mb-1">
            Good {getTimeOfDay()}, {userName || "there"} {getGreetingEmoji()}
          </h1>
          <p className="font-lato text-sm text-[#1C150D]/60">
            {getSubtitle()}
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            size="default"
            onClick={() => navigate("/create")}
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white flex items-center gap-2 shadow-sm flex-1 sm:flex-none"
          >
            <Flame className="w-4 h-4" />
            Create Content
          </Button>
          
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              // If we have a recent master, go to multiply with it
              if (stats?.recentMaster?.id) {
                navigate(`/multiply?master=${stats.recentMaster.id}`);
              } else {
                navigate("/multiply");
              }
            }}
            className="border-[#B8956A]/30 text-[#1C150D] hover:bg-[#B8956A]/10 flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Zap className="w-4 h-4 text-[#B8956A]" />
            Multiply
          </Button>
          
          <Button
            variant="ghost"
            size="default"
            onClick={() => navigate("/calendar")}
            className="text-[#1C150D]/70 hover:text-[#1C150D] hover:bg-[#FAFAFA] flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="flex items-start gap-3 bg-[#FAFAFA] border border-[#E0E0E0] p-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-[#B8956A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#1C150D]/50 mb-0.5">
                Madison suggests:
              </p>
              <p className="text-sm text-[#1C150D] mb-1">
                {aiSuggestion.text}
              </p>
              <button
                onClick={() => navigate(aiSuggestion.route)}
                className="text-xs text-[#B8956A] hover:text-[#A3865A] font-medium flex items-center gap-1 transition-colors"
              >
                {aiSuggestion.cta}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

