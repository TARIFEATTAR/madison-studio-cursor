import { PenTool, Archive, Calendar, Globe, HelpCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardWorkflowMap() {
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();

  const stations = [
    {
      id: "create",
      title: "Create",
      description: "Studio",
      icon: PenTool,
      route: "/create",
      count: stats?.piecesCreatedThisWeek || 0,
      label: "this week",
      microCopy: "Pieces drafted this week",
      isNextStep: (stats?.totalContent || 0) === 0,
    },
    {
      id: "library",
      title: "Library",
      description: "Archive",
      icon: Archive,
      route: "/library",
      count: stats?.totalContent || 0,
      label: "pieces",
      microCopy: "Total content in archive",
      isNextStep: (stats?.totalContent || 0) > 0 && (stats?.piecesScheduled || 0) === 0,
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Calendar",
      icon: Calendar,
      route: "/schedule",
      count: stats?.piecesScheduled || 0,
      label: "scheduled",
      microCopy: "Queued for publishing",
      isNextStep: (stats?.piecesScheduled || 0) === 0 && (stats?.totalContent || 0) > 0,
    },
    {
      id: "publish",
      title: "Published",
      description: "Live",
      icon: Globe,
      route: "/library?filter=published",
      count: stats?.piecesPublished || 0,
      label: "published",
      microCopy: "Live on your channels",
      isNextStep: false,
    },
  ];

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-br from-[#F5F1E8] to-[#FAF8F3] border border-charcoal/10 p-3 md:p-5">
        <div className="text-center mb-4 md:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="font-serif text-lg md:text-xl font-light text-ink-black">
              Content Workflow Status
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-charcoal/40 hover:text-aged-brass transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-ink-black text-parchment-white border-charcoal/20">
                <p className="text-xs leading-relaxed">
                  <strong>Your content journey:</strong> Track pieces from creation to publication. 
                  Click any station to jump to that stage and manage your content workflow.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-charcoal/60 italic font-serif">
            Track your content through each stage
          </p>
        </div>

        {/* Workflow stations */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting lines */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-aged-brass/20 via-aged-brass/40 to-aged-brass/20 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative z-10">
            {stations.map((station, index) => (
              <button
                key={station.id}
                onClick={() => navigate(station.route)}
                className="group relative"
              >
                {/* Next Step Indicator */}
                {station.isNextStep && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-aged-brass text-parchment-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans whitespace-nowrap shadow-md">
                      Next Step
                    </div>
                  </div>
                )}

                {/* Station card */}
                <div className="bg-parchment-white border-2 border-charcoal/10 p-3 md:p-4 hover:border-aged-brass/60 hover:shadow-lg transition-all">
                  {/* Count badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-aged-brass/90 border-2 border-parchment-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <span className="font-serif text-sm md:text-base font-semibold text-parchment-white">
                      {station.count}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-3 md:mb-4 flex justify-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 border border-aged-brass/30 flex items-center justify-center group-hover:border-aged-brass transition-colors">
                      <station.icon className="w-5 h-5 md:w-6 md:h-6 text-aged-brass group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-base md:text-lg font-medium text-ink-black mb-0.5 group-hover:text-aged-brass transition-colors">
                    {station.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-charcoal/60 mb-1.5 font-sans">
                    {station.description}
                  </p>

                  {/* Micro-copy explaining what the number means */}
                  <p className="text-[9px] md:text-[10px] text-charcoal/50 font-light italic leading-tight">
                    {station.microCopy}
                  </p>

                  {/* Decorative line */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-[1px] bg-aged-brass transition-all duration-300" />
                </div>

                {/* Arrow indicator (not on last item) */}
                {index < stations.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 translate-x-full items-center justify-center z-20">
                    <ArrowRight className="w-5 h-5 text-aged-brass/40" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-4 md:mt-6 flex items-center justify-center">
          <div className="w-24 h-[1px] bg-aged-brass/30" />
        </div>
      </div>
    </TooltipProvider>
  );
}
