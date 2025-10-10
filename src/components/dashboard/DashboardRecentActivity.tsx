import { FileText, Image, Video, Calendar, FileOutput, Boxes } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const getIconForType = (type: string) => {
  if (type.includes('blog') || type.includes('article')) return FileText;
  if (type.includes('image') || type.includes('visual')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('social') || type.includes('post')) return Calendar;
  if (type === 'output') return FileOutput;
  if (type === 'derivative') return Boxes;
  return FileText;
};

export function DashboardRecentActivity() {
  const { data: stats } = useDashboardStats();
  const recentActivity = stats?.recentActivity || [];

  if (recentActivity.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-warm-gray/20 p-6">
        <h3 className="text-xl font-serif text-ink-black mb-4">Recent Content</h3>
        <p className="text-sm text-warm-gray text-center py-8">
          No recent activity yet. Start creating content!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-warm-gray/20 p-6">
      <h3 className="text-xl font-serif text-ink-black mb-4">Recent Content</h3>
      
      <div className="space-y-3">
        {recentActivity.map((activity) => {
          const Icon = getIconForType(activity.type);
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-aged-brass/5 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-aged-brass/10 flex items-center justify-center shrink-0 group-hover:bg-aged-brass/20 transition-colors">
                <Icon className="w-4 h-4 text-aged-brass" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-black truncate group-hover:text-aged-brass transition-colors">
                  {activity.title}
                </p>
                <p className="text-xs text-warm-gray">
                  {activity.action} · {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
