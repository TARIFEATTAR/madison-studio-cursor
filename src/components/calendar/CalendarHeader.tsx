import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "month" | "week";
  onViewModeChange: (mode: "month" | "week") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between fade-enter">
      <div>
        <h1 className="text-foreground mb-2">{format(currentDate, "MMMM yyyy")}</h1>
        <p className="text-muted-foreground text-lg">
          Content calendar with intelligence
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>

        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1">
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            className="gap-2"
          >
            <Grid3x3 className="w-4 h-4" />
            Month
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            Week
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
