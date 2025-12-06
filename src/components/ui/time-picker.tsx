import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function TimePicker({ value, onChange, className, placeholder = "Select time" }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse the value (HH:MM format) into hours, minutes, period
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hours: 12, minutes: 0, period: "PM" };
    const [hoursStr, minutesStr] = timeStr.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const period = hours >= 12 ? "PM" : "AM";
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return { hours, minutes, period };
  };

  const { hours, minutes, period } = parseTime(value || "");

  // Convert back to 24-hour format for storage
  const updateTime = (newHours: number, newMinutes: number, newPeriod: string) => {
    let hours24 = newHours;
    if (newPeriod === "PM" && newHours !== 12) hours24 = newHours + 12;
    else if (newPeriod === "AM" && newHours === 12) hours24 = 0;
    
    const timeString = `${hours24.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
    onChange(timeString);
  };

  const formatDisplayTime = () => {
    if (!value) return null;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const hourValues = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteValues = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime() || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0" 
        align="start"
        sideOffset={4}
      >
        <div className="flex bg-card rounded-md border border-border shadow-level-3">
          {/* Hours Column */}
          <div className="w-16 flex flex-col border-r border-border">
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground text-center border-b border-border bg-muted/30">
              Hour
            </div>
            <div 
              className="h-48 overflow-y-auto"
              style={{ scrollbarWidth: 'thin' }}
            >
              {hourValues.map((hour) => (
                <button
                  key={hour}
                  onClick={() => updateTime(hour, minutes, period)}
                  className={cn(
                    "w-full py-2 text-center text-sm transition-colors",
                    hour === hours
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {hour.toString().padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Column */}
          <div className="w-16 flex flex-col border-r border-border">
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground text-center border-b border-border bg-muted/30">
              Min
            </div>
            <div 
              className="h-48 overflow-y-auto"
              style={{ scrollbarWidth: 'thin' }}
            >
              {minuteValues.map((minute) => (
                <button
                  key={minute}
                  onClick={() => updateTime(hours, minute, period)}
                  className={cn(
                    "w-full py-2 text-center text-sm transition-colors",
                    minute === minutes
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {minute.toString().padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* AM/PM Column */}
          <div className="w-14 flex flex-col">
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground text-center border-b border-border bg-muted/30">
              &nbsp;
            </div>
            <div className="flex flex-col">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  onClick={() => updateTime(hours, minutes, p)}
                  className={cn(
                    "w-full py-2 text-center text-sm transition-colors",
                    p === period
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

TimePicker.displayName = "TimePicker";

export { TimePicker };
