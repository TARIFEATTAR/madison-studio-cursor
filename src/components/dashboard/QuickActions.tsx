import { PenLine, Calendar, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useSmartDashboardInsights } from "@/hooks/useSmartDashboardInsights";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  route: string;
  priority?: boolean;
}

function ActionButton({ icon, label, route, priority }: ActionButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-md",
        "bg-parchment-white border border-charcoal/10",
        priority && "ring-2 ring-brass shadow-[0_0_16px_rgba(184,149,106,0.4)] animate-pulse"
      )}
    >
      <div className={cn(
        "w-8 h-8 flex items-center justify-center",
        priority ? "text-brass" : "text-charcoal"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-sm font-medium",
        priority ? "text-brass" : "text-charcoal"
      )}>
        {label}
      </span>
    </button>
  );
}

export function QuickActions() {
  const insight = useSmartDashboardInsights();
  const priorityRoute = insight?.priorityRoute;

  return (
    <Card className="p-6 bg-parchment-white border border-charcoal/10">
      <h3 className="font-serif text-xl font-light text-ink-black mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon={<PenLine className="w-8 h-8" />}
          label="Create"
          route="/create"
          priority={priorityRoute === "create"}
        />
        <ActionButton
          icon={<Calendar className="w-8 h-8" />}
          label="This Week"
          route="/schedule"
          priority={priorityRoute === "schedule"}
        />
        <ActionButton
          icon={<Library className="w-8 h-8" />}
          label="Library"
          route="/library"
          priority={priorityRoute === "library"}
        />
      </div>
    </Card>
  );
}
