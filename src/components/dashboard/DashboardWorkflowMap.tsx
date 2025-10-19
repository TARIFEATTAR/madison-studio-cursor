import { PenTool, Archive, Calendar, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";

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
    },
    {
      id: "library",
      title: "Library",
      description: "Archive",
      icon: Archive,
      route: "/library",
      count: stats?.totalContent || 0,
      label: "pieces",
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Calendar",
      icon: Calendar,
      route: "/schedule",
      count: stats?.piecesScheduled || 0,
      label: "scheduled",
    },
    {
      id: "publish",
      title: "Published",
      description: "Live",
      icon: Globe,
      route: "/library?filter=published",
      count: stats?.piecesPublished || 0,
      label: "published",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#F5F1E8] to-[#FAF8F3] border border-charcoal/10 p-4 md:p-8 lg:p-12">
      <div className="text-center mb-6 md:mb-12">
        <h3 className="font-serif text-2xl md:text-3xl font-light text-ink-black mb-2">
          Content Workflow Status
        </h3>
        <p className="text-sm text-charcoal/60 italic font-serif">
          Track your content through each stage of production
        </p>
      </div>

      {/* Workflow stations */}
      <div className="relative max-w-5xl mx-auto">
        {/* Connecting lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-aged-brass/20 via-aged-brass/40 to-aged-brass/20 -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative z-10">
          {stations.map((station, index) => (
            <button
              key={station.id}
              onClick={() => navigate(station.route)}
              className="group relative"
            >
              {/* Station card */}
              <div className="bg-parchment-white border-2 border-charcoal/10 p-4 md:p-6 lg:p-8 hover:border-aged-brass/60 hover:shadow-xl transition-all">
                {/* Count badge */}
                <div className="absolute -top-3 md:-top-4 -right-3 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-aged-brass/90 border-2 border-parchment-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <span className="font-serif text-lg md:text-xl font-semibold text-parchment-white">
                    {station.count}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-4 md:mb-6 flex justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-aged-brass/30 flex items-center justify-center group-hover:border-aged-brass transition-colors">
                    <station.icon className="w-6 h-6 md:w-8 md:h-8 text-aged-brass group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-serif text-xl md:text-2xl font-medium text-ink-black mb-1 group-hover:text-aged-brass transition-colors">
                  {station.title}
                </h4>
                
                {/* Description */}
                <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-charcoal/60 mb-2 md:mb-3 font-sans">
                  {station.description}
                </p>

                {/* Label */}
                <p className="text-[10px] md:text-xs text-charcoal/50 font-light italic">
                  {station.label}
                </p>

                {/* Decorative line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-[2px] bg-aged-brass transition-all duration-300" />
              </div>

              {/* Arrow indicator (not on last item) */}
              {index < stations.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 translate-x-full items-center justify-center z-20">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-aged-brass text-2xl font-light">→</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="mt-8 md:mt-12 flex items-center justify-center">
        <div className="w-32 h-[1px] bg-aged-brass/30" />
      </div>
    </div>
  );
}
