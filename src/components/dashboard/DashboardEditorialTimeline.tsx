import { FileText, Image, Video, Calendar, FileOutput, Boxes, CheckCircle2, Edit3, Clock } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";

const getIconForType = (type: string) => {
  if (type.includes('blog') || type.includes('article')) return FileText;
  if (type.includes('image') || type.includes('visual')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('social') || type.includes('post')) return Calendar;
  if (type === 'output') return FileOutput;
  if (type === 'derivative') return Boxes;
  return FileText;
};

const getStatusInfo = (action: string) => {
  if (action === "Published") {
    return { text: "Live", color: "text-emerald-600", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-200", icon: CheckCircle2 };
  }
  if (action === "Approved") {
    return { text: "Approved", color: "text-aged-brass", bgColor: "bg-aged-brass/10", borderColor: "border-aged-brass/20", icon: CheckCircle2 };
  }
  if (action === "Created" || action === "Generated") {
    return { text: "Draft", color: "text-charcoal", bgColor: "bg-charcoal/5", borderColor: "border-charcoal/10", icon: Edit3 };
  }
  return { text: action, color: "text-charcoal/60", bgColor: "bg-warm-gray/5", borderColor: "border-warm-gray/10", icon: Clock };
};

export function DashboardEditorialTimeline() {
  const { data: stats } = useDashboardStats();
  const recentActivity = stats?.recentActivity || [];
  const navigate = useNavigate();

  const handleContentClick = (activity: any) => {
    navigate(`/library?contentId=${activity.id}`);
  };

  if (recentActivity.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-vellum-cream/50 border border-charcoal/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-charcoal/20" />
        </div>
        <h3 className="font-serif text-lg font-medium text-ink-black mb-1">No Activity Yet</h3>
        <p className="text-xs text-charcoal/60 mb-4 font-light">
          Your creative journey begins here
        </p>
        <button
          onClick={() => navigate("/create")}
          className="px-4 py-2 bg-ink-black text-parchment-white hover:bg-charcoal transition-colors font-sans text-xs uppercase tracking-wider"
        >
          Start Creating
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-aged-brass/40 via-aged-brass/20 to-transparent" />

      <div className="space-y-4">
        {recentActivity.map((activity, index) => {
          const Icon = getIconForType(activity.type);
          const statusInfo = getStatusInfo(activity.action);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline node */}
              <div className="absolute left-4 top-5 -translate-x-1/2 w-2 h-2 rounded-full bg-aged-brass border-2 border-parchment-white z-10" />

              {/* Timeline card */}
              <div 
                onClick={() => handleContentClick(activity)}
                className="ml-10 group cursor-pointer"
              >
                <div className="bg-parchment-white border border-charcoal/10 p-3 hover:border-aged-brass/40 hover:shadow-md transition-all relative">
                  {/* Time marker */}
                  <div className="absolute -left-9 top-5 text-[10px] text-charcoal/50 font-sans w-8 text-right">
                    {activity.time}
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-9 h-9 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-aged-brass/40 transition-colors">
                      <Icon className="w-4 h-4 text-charcoal group-hover:text-aged-brass transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-serif text-sm font-medium text-ink-black group-hover:text-aged-brass transition-colors leading-tight">
                          {activity.title}
                        </h4>
                        
                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 shrink-0 ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                          <StatusIcon className={`w-2.5 h-2.5 ${statusInfo.color}`} />
                          <span className={`text-[9px] font-sans uppercase tracking-wider ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] uppercase tracking-wider text-charcoal/60 mb-1.5 font-sans">
                        {activity.type.replace(/_/g, ' ')}
                      </p>

                      {/* Brass accent line on hover */}
                      <div className="w-0 group-hover:w-12 h-[1px] bg-aged-brass transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recentActivity.length >= 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/library")}
            className="font-sans text-[10px] uppercase tracking-wider text-charcoal hover:text-aged-brass transition-colors inline-flex items-center gap-1.5"
          >
            View Complete Timeline
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
