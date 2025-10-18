import { FileText, Image, Video, Calendar, FileOutput, Boxes, Clock, CheckCircle2, Edit3, Eye } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const getIconForType = (type: string) => {
  if (type.includes('blog') || type.includes('article')) return FileText;
  if (type.includes('image') || type.includes('visual')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('social') || type.includes('post')) return Calendar;
  if (type === 'output') return FileOutput;
  if (type === 'derivative') return Boxes;
  return FileText;
};

const getStatusBadge = (action: string, type: string) => {
  if (action === "Published") {
    return { text: "Live", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
  }
  if (action === "Approved") {
    return { text: "Approved", color: "bg-aged-brass/10 text-aged-brass border-aged-brass/20", icon: CheckCircle2 };
  }
  if (action === "Created" || action === "Generated") {
    return { text: "Draft", color: "bg-charcoal/10 text-charcoal border-charcoal/20", icon: Edit3 };
  }
  return { text: action, color: "bg-warm-gray/10 text-warm-gray border-warm-gray/20", icon: Clock };
};

export function DashboardRecentActivity() {
  const { data: stats } = useDashboardStats();
  const recentActivity = stats?.recentActivity || [];
  const navigate = useNavigate();

  const handleContentClick = (activity: any) => {
    // Navigate to Library with the content selected
    navigate(`/library?contentId=${activity.id}`);
  };

  if (recentActivity.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-vellum-cream border border-charcoal/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-charcoal/30" />
        </div>
        <p className="text-sm font-medium text-ink-black mb-1">No content yet</p>
        <p className="text-xs text-charcoal/60 mb-4">
          Start creating content to see your activity here
        </p>
        <button
          onClick={() => navigate("/create")}
          className="text-xs px-4 py-2 bg-ink-black text-parchment-white hover:bg-charcoal transition-colors"
        >
          Create Your First Piece
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentActivity.map((activity) => {
        const Icon = getIconForType(activity.type);
        const statusBadge = getStatusBadge(activity.action, activity.type);
        const StatusIcon = statusBadge.icon;
        
        return (
          <div
            key={activity.id}
            onClick={() => handleContentClick(activity)}
            className="group p-4 border border-charcoal/10 hover:border-aged-brass/40 transition-all cursor-pointer bg-parchment-white hover:bg-vellum-cream/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-aged-brass/40 transition-colors">
                <Icon className="w-5 h-5 text-charcoal group-hover:text-aged-brass transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-ink-black truncate group-hover:text-aged-brass transition-colors">
                    {activity.title}
                  </p>
                  <Badge variant="outline" className={`shrink-0 ${statusBadge.color} text-[10px] px-2`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusBadge.text}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-charcoal/60">
                  <span className="capitalize">{activity.type.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </span>
                </div>
                
                {/* Action hint */}
                <div className="mt-2 flex items-center gap-1 text-[10px] text-aged-brass opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3" />
                  <span>Click to view details</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {recentActivity.length >= 5 && (
        <button
          onClick={() => navigate("/library")}
          className="w-full py-2 text-xs text-charcoal hover:text-aged-brass transition-colors border-t border-charcoal/10 mt-2 pt-4"
        >
          View All Activity →
        </button>
      )}
    </div>
  );
}
