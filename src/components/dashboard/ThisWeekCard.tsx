import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function ThisWeekCard() {
  const { isLoading } = useDashboardStats();

  const weekDays = [
    { day: "Mon", date: "18", dots: [{ color: "#F5C16C" }, { color: "#A3C98D" }] },
    { day: "Tue", date: "19", dots: [{ color: "#F5C16C" }] },
    { day: "Wed", date: "20", dots: [] },
    { day: "Thu", date: "21", dots: [{ color: "#F5C16C" }] },
    { day: "Fri", date: "22", dots: [{ color: "#F5C16C" }, { color: "#A3C98D" }] },
    { day: "Sat", date: "23", dots: [] },
    { day: "Sun", date: "24", dots: [] },
  ];

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-12">
        <Skeleton className="h-[180px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-12">
      <Card className="p-4 md:p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl min-h-[180px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4 md:mb-5">This Week</h3>
        
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max pb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer border border-transparent hover:border-[#E0E0E0] min-w-[70px]"
              >
                <span className="text-xs font-medium text-[#1C150D]/40 mb-1">{day.day}</span>
                <span className="text-2xl font-semibold text-[#1C150D] mb-3">{day.date}</span>
                <div className="flex gap-1.5 flex-wrap justify-center min-h-[16px]">
                  {day.dots.map((dot, dotIndex) => (
                    <div
                      key={dotIndex}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: dot.color }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-7 gap-3">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer border border-transparent hover:border-[#E0E0E0]"
            >
              <span className="text-xs font-medium text-[#1C150D]/40 mb-1">{day.day}</span>
              <span className="text-xl font-semibold text-[#1C150D] mb-3">{day.date}</span>
              <div className="flex gap-1 flex-wrap justify-center min-h-[16px]">
                {day.dots.map((dot, dotIndex) => (
                  <div
                    key={dotIndex}
                    className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: dot.color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

