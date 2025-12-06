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
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 md:p-8 h-full">
        {/* Greeting skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2 skeleton-shimmer" />
          <Skeleton className="h-4 w-48 skeleton-shimmer" />
        </div>
        {/* CTAs skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Skeleton className="h-11 w-36 skeleton-shimmer" />
          <Skeleton className="h-11 w-40 skeleton-shimmer" />
          <Skeleton className="h-11 w-28 skeleton-shimmer" />
        </div>
        {/* Suggestion skeleton */}
        <Skeleton className="h-20 w-full rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 md:p-8 hover-lift transition-all duration-200 h-full">
        {/* Greeting Section */}
        <div className="mb-6">
          <h1 className="font-cormorant text-2xl md:text-3xl text-[#1C150D] mb-2">
            Good {getTimeOfDay()}, {userName || "there"} {getGreetingEmoji()}
          </h1>
          <p className="font-lato text-sm md:text-base text-[#1C150D]/60">
            {getSubtitle()}
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            size="lg"
            onClick={() => navigate("/create")}
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white flex items-center gap-2 shadow-sm flex-1 sm:flex-none"
          >
            <Flame className="w-4 h-4" />
            Create Content
          </Button>
          
          <Button
            variant="outline"
            size="lg"
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
            Multiply Last Piece
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/calendar")}
            className="text-[#1C150D]/70 hover:text-[#1C150D] hover:bg-[#FAFAFA] flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="flex items-start gap-3 bg-[#FAFAFA] border border-[#E0E0E0] p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-[#B8956A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#1C150D]/50 mb-1">
                Madison suggests:
              </p>
              <p className="text-sm md:text-base text-[#1C150D] mb-2">
                {aiSuggestion.text}
              </p>
              <button
                onClick={() => navigate(aiSuggestion.route)}
                className="text-sm text-[#B8956A] hover:text-[#A3865A] font-medium flex items-center gap-1 transition-colors"
              >
                {aiSuggestion.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

