import { useState } from "react";
import { FileText, Image, Video, Calendar, FileOutput, Boxes, Clock, CheckCircle2, Edit3, Eye, ChevronDown } from "lucide-react";
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

interface DashboardRecentActivityProps {
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function DashboardRecentActivity({ 
  collapsible = true, 
  defaultExpanded = false 
}: DashboardRecentActivityProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { data: stats } = useDashboardStats();
  const recentActivity = stats?.recentActivity || [];
  const navigate = useNavigate();

  const handleContentClick = (activity: any) => {
    navigate(`/library?contentId=${activity.id}`);
  };

  // If not collapsible, always show content
  const showContent = !collapsible || isExpanded;

  if (recentActivity.length === 0) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6">
          <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Recent Activity</h3>
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1C150D]/30" />
            </div>
            <p className="text-sm font-medium text-[#1C150D] mb-1">No content yet</p>
            <p className="text-xs text-[#1C150D]/50 mb-3">
              Start creating to see your activity
            </p>
            <button
              onClick={() => navigate("/create")}
              className="text-xs px-4 py-2 bg-[#1C150D] text-white hover:bg-[#2C251D] transition-colors rounded-md"
            >
              Create Your First Piece
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden transition-all duration-300 h-full flex flex-col">
      {/* Collapsible Header */}
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 md:p-6 text-left flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
        >
          <div>
            <h3 className="text-sm font-medium text-[#1C150D]/60 mb-1">Recent Activity</h3>
            <p className="text-xs text-[#1C150D]/40">
              {recentActivity.length} recent item{recentActivity.length !== 1 ? 's' : ''} · Click to expand
            </p>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-[#1C150D]/40 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      ) : (
        <div className="p-4 md:p-6 pb-2">
          <h3 className="text-sm font-medium text-[#1C150D]/60">Recent Activity</h3>
        </div>
      )}

      {/* Content (Collapsible) */}
      {showContent && (
        <div className={`space-y-2 px-4 md:px-6 pb-4 md:pb-6 ${collapsible ? 'pt-0' : ''} animate-in slide-in-from-top-2 duration-200`}>
          {recentActivity.map((activity) => {
            const Icon = getIconForType(activity.type);
            const statusBadge = getStatusBadge(activity.action, activity.type);
            const StatusIcon = statusBadge.icon;
            
            return (
              <div
                key={activity.id}
                onClick={() => handleContentClick(activity)}
                className="group p-3 border border-[#E0E0E0] hover:border-[#B8956A]/40 transition-all cursor-pointer bg-white hover:bg-[#FAFAFA] rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#FAFAFA] border border-[#E0E0E0] rounded-md flex items-center justify-center shrink-0 group-hover:border-[#B8956A]/40 transition-colors">
                    <Icon className="w-4 h-4 text-[#1C150D]/60 group-hover:text-[#B8956A] transition-colors" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-[#1C150D] truncate group-hover:text-[#B8956A] transition-colors">
                        {activity.title}
                      </p>
                      <Badge variant="outline" className={`shrink-0 ${statusBadge.color} text-[10px] px-2`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.text}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-[#1C150D]/50">
                      <span className="capitalize">{activity.type.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                    </div>
                    
                    {/* Action hint */}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#B8956A] opacity-0 group-hover:opacity-100 transition-opacity">
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
              className="w-full py-2 text-xs text-[#B8956A] hover:text-[#A3865A] transition-colors border-t border-[#E0E0E0] mt-2 pt-4"
            >
              View All Activity →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
