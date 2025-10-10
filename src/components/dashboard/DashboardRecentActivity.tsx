import { FileText, Image, Video, Calendar } from "lucide-react";

const recentActivities = [
  {
    id: 1,
    type: "blog",
    title: "Spring Collection Launch Campaign",
    action: "Created",
    time: "3h ago",
    icon: FileText,
  },
  {
    id: 2,
    type: "visual",
    title: "Lumière Product Photography Series",
    action: "Edited",
    time: "5h ago",
    icon: Image,
  },
  {
    id: 3,
    type: "social",
    title: "Noir Campaign Social Posts",
    action: "Scheduled",
    time: "Yesterday",
    icon: Calendar,
  },
  {
    id: 4,
    type: "video",
    title: "Behind the Scenes: Craftsmanship",
    action: "Published",
    time: "2 days ago",
    icon: Video,
  },
];

export function DashboardRecentActivity() {
  return (
    <div className="bg-white rounded-lg border border-warm-gray/20 p-6">
      <h3 className="text-xl font-serif text-ink-black mb-4">Recent Content</h3>
      
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
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
