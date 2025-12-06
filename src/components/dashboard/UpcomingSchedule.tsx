import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

interface ScheduledItem {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
  content_type: string;
}

export function UpcomingSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcoming();
    }
  }, [user]);

  const fetchUpcoming = async () => {
    try {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!orgMember) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from("scheduled_content")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .eq("status", "scheduled")
        .gte("scheduled_date", today.toISOString().split('T')[0])
        .lte("scheduled_date", endOfWeek.toISOString().split('T')[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcoming(data || []);
    } catch (error) {
      console.error("Error fetching upcoming:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return { label: "Today", color: "text-emerald-600 bg-emerald-500/10 border-emerald-200" };
    if (isTomorrow(date)) return { label: "Tomorrow", color: "text-aged-brass bg-aged-brass/10 border-aged-brass/20" };
    if (isThisWeek(date, { weekStartsOn: 0 })) return { label: format(date, "EEEE"), color: "text-charcoal bg-charcoal/10 border-charcoal/20" };
    return { label: format(date, "MMM d"), color: "text-charcoal/70 bg-charcoal/5 border-charcoal/10" };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-charcoal/20 border-t-charcoal animate-spin mx-auto" />
      </div>
    );
  }

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-vellum-cream border border-charcoal/10 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-charcoal/30" />
        </div>
        <p className="text-sm font-medium text-ink-black mb-1">Nothing scheduled yet</p>
        <p className="text-xs text-charcoal/60 mb-4">
          Plan your content calendar for consistent publishing
        </p>
        <button
          onClick={() => navigate("/schedule")}
          className="text-xs px-4 py-2 bg-brand-brass text-brand-parchment hover:bg-brand-brass/90 shadow-md hover:shadow-brass-glow transition-all duration-300 rounded-md"
        >
          Schedule Content
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((item) => {
        const dateLabel = getDateLabel(item.scheduled_date);
        return (
          <div
            key={item.id}
            onClick={() => navigate("/schedule")}
            className="group p-4 border border-charcoal/10 hover:border-aged-brass/40 transition-all cursor-pointer bg-parchment-white hover:bg-vellum-cream/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-aged-brass/40 transition-colors">
                <Calendar className="w-5 h-5 text-charcoal group-hover:text-aged-brass transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-ink-black truncate group-hover:text-aged-brass transition-colors">
                    {item.title}
                  </p>
                  <span className={`shrink-0 text-[10px] px-2 py-1 border ${dateLabel.color} font-medium`}>
                    {dateLabel.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-charcoal/60">
                  <span className="capitalize">{item.content_type.replace(/_/g, ' ')}</span>
                  {item.scheduled_time && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.scheduled_time}
                      </span>
                    </>
                  )}
                  {item.platform && (
                    <>
                      <span>•</span>
                      <span>{item.platform}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {upcoming.length >= 5 && (
        <button
          onClick={() => navigate("/schedule")}
          className="w-full py-2 text-xs text-charcoal hover:text-aged-brass transition-colors border-t border-charcoal/10 mt-2 pt-4"
        >
          View Full Calendar →
        </button>
      )}
    </div>
  );
}
