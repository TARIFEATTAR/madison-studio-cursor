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
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-vellum-cream/50 border border-charcoal/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-charcoal/20" />
        </div>
        <h3 className="font-serif text-xl font-medium text-ink-black mb-2">No Activity Yet</h3>
        <p className="text-sm text-charcoal/60 mb-6 font-light">
          Your creative journey begins here
        </p>
        <button
          onClick={() => navigate("/create")}
          className="px-6 py-3 bg-ink-black text-parchment-white hover:bg-charcoal transition-colors font-sans text-sm uppercase tracking-wider"
        >
          Start Creating
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-aged-brass/40 via-aged-brass/20 to-transparent" />

      <div className="space-y-6">
        {recentActivity.map((activity, index) => {
          const Icon = getIconForType(activity.type);
          const statusInfo = getStatusInfo(activity.action);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline node */}
              <div className="absolute left-6 top-8 -translate-x-1/2 w-3 h-3 rounded-full bg-aged-brass border-2 border-parchment-white z-10" />

              {/* Timeline card */}
              <div 
                onClick={() => handleContentClick(activity)}
                className="ml-16 group cursor-pointer"
              >
                <div className="bg-parchment-white border border-charcoal/10 p-6 hover:border-aged-brass/40 hover:shadow-lg transition-all relative">
                  {/* Time marker */}
                  <div className="absolute -left-14 top-8 text-xs text-charcoal/50 font-sans w-12 text-right">
                    {activity.time}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-aged-brass/40 transition-colors">
                      <Icon className="w-6 h-6 text-charcoal group-hover:text-aged-brass transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-serif text-lg font-medium text-ink-black group-hover:text-aged-brass transition-colors">
                          {activity.title}
                        </h4>
                        
                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-1 px-3 py-1 shrink-0 ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                          <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                          <span className={`text-[10px] font-sans uppercase tracking-wider ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs uppercase tracking-wider text-charcoal/60 mb-3 font-sans">
                        {activity.type.replace(/_/g, ' ')}
                      </p>

                      {/* Brass accent line on hover */}
                      <div className="w-0 group-hover:w-16 h-[1px] bg-aged-brass transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recentActivity.length >= 5 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/library")}
            className="font-sans text-xs uppercase tracking-wider text-charcoal hover:text-aged-brass transition-colors inline-flex items-center gap-2"
          >
            View Complete Timeline
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
