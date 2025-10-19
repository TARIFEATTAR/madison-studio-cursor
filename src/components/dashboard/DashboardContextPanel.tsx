import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";

interface ScheduledItem {
  id: string;
  title: string;
  content_type: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
}

export function DashboardContextPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayItems, setTodayItems] = useState<ScheduledItem[]>([]);
  const [tomorrowItems, setTomorrowItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchScheduledContent = async () => {
      try {
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!orgMember?.organization_id) {
          setLoading(false);
          return;
        }

        const today = format(new Date(), "yyyy-MM-dd");
        const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

        const { data: scheduled } = await supabase
          .from("scheduled_content")
          .select("id, title, content_type, scheduled_date, scheduled_time, platform")
          .eq("organization_id", orgMember.organization_id)
          .in("scheduled_date", [today, tomorrow])
          .order("scheduled_time", { ascending: true });

        if (scheduled) {
          const todayScheduled = scheduled.filter(
            (item) => item.scheduled_date === today
          );
          const tomorrowScheduled = scheduled.filter(
            (item) => item.scheduled_date === tomorrow
          );

          setTodayItems(todayScheduled.slice(0, 3));
          setTomorrowItems(tomorrowScheduled.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching scheduled content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledContent();
  }, [user]);

  const formatTime = (time: string | null) => {
    if (!time) return "No time set";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="hidden md:block w-[600px] h-[350px] bg-parchment-white/90 border-2 border-aged-brass/20 shadow-[0_4px_20px_rgba(184,149,106,0.12)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-charcoal/10 rounded w-1/2" />
          <div className="h-8 bg-charcoal/10 rounded" />
          <div className="h-8 bg-charcoal/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block w-[600px] h-[350px] self-start bg-parchment-white/90 border-2 border-aged-brass/20 shadow-[0_4px_20px_rgba(184,149,106,0.12)]">
      <div className="p-6 space-y-8">
        {/* Today's Slate */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-aged-brass" />
            <h3 className="text-xs uppercase tracking-[0.2em] text-charcoal/60 font-sans">
              Today's Slate
            </h3>
          </div>

          {todayItems.length > 0 ? (
            <div className="space-y-3">
              {todayItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate("/calendar")}
                  className="w-full text-left group hover:bg-vellum-cream/50 p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-ink-black truncate group-hover:text-aged-brass transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        {item.content_type}
                        {item.platform && ` · ${item.platform}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3 text-aged-brass" />
                      <span className="text-xs font-medium text-aged-brass">
                        {formatTime(item.scheduled_time)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-charcoal/50 italic font-serif">
                No scheduled content today
              </p>
              <button
                onClick={() => navigate("/calendar")}
                className="text-xs text-aged-brass hover:text-charcoal mt-2 transition-colors"
              >
                Schedule something
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        {tomorrowItems.length > 0 && (
          <div className="w-full h-[1px] bg-aged-brass/20" />
        )}

        {/* Next Up (Tomorrow Preview) */}
        {tomorrowItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-charcoal/60 font-sans">
                Next Up
              </h3>
              <span className="text-xs text-charcoal/40 italic">Tomorrow</span>
            </div>

            <div className="space-y-2">
              {tomorrowItems.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate("/calendar")}
                  className="w-full text-left group hover:bg-vellum-cream/50 p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-serif text-sm text-charcoal/70 truncate group-hover:text-aged-brass transition-colors flex-1">
                      {item.title}
                    </p>
                    <ChevronRight className="w-3 h-3 text-charcoal/30 group-hover:text-aged-brass transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View Full Calendar Link */}
        <div className="pt-2">
          <button
            onClick={() => navigate("/calendar")}
            className="w-full text-center text-xs text-aged-brass hover:text-charcoal transition-colors uppercase tracking-wider border-t border-charcoal/10 pt-4"
          >
            View Full Content Calendar →
          </button>
        </div>
      </div>
    </div>
  );
}
