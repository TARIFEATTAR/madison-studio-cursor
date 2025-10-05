import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3x3, List, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";

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
  const { isConnected, loading, connecting, handleConnect, handleDisconnect } = useGoogleCalendarConnection();

  return (
    <div className="flex items-center justify-between fade-enter">
      <div>
        <h1 className="text-foreground mb-2">{format(currentDate, "MMMM yyyy")}</h1>
        <p className="text-muted-foreground text-lg">
          Content calendar with intelligence
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <Badge variant="outline" className="gap-1 border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  <Badge variant="outline" className="gap-1">
                    Not Connected
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <h4 className="font-semibold">Google Calendar</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Your scheduled content syncs automatically to your Google Calendar"
                  : "Connect your Google Calendar to automatically sync scheduled content"}
              </p>
              {isConnected ? (
                <Button variant="outline" onClick={handleDisconnect} className="w-full">
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={connecting} className="w-full">
                  {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Connect Google Calendar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
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
