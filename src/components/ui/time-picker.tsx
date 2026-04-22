import * as React from "react";
import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

interface TimeParts {
  hours: string;
  minutes: string;
  period: string;
}

const EMPTY_TIME_PARTS: TimeParts = {
  hours: "",
  minutes: "",
  period: "",
};

const HOUR_VALUES = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTE_VALUES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const PERIOD_VALUES = ["AM", "PM"];

const parseTime = (timeStr?: string): TimeParts => {
  if (!timeStr) return EMPTY_TIME_PARTS;

  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours24 = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr, 10);

  if (Number.isNaN(hours24) || Number.isNaN(minutes)) {
    return EMPTY_TIME_PARTS;
  }

  const period = hours24 >= 12 ? "PM" : "AM";
  const normalizedHours = hours24 % 12 || 12;

  return {
    hours: normalizedHours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    period,
  };
};

const serializeTime = ({ hours, minutes, period }: TimeParts) => {
  const parsedHours = Number.parseInt(hours, 10);
  const parsedMinutes = Number.parseInt(minutes, 10);

  if (!hours || !minutes || !period || Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
    return "";
  }

  let hours24 = parsedHours;
  if (period === "PM" && parsedHours !== 12) hours24 = parsedHours + 12;
  if (period === "AM" && parsedHours === 12) hours24 = 0;

  return `${hours24.toString().padStart(2, "0")}:${minutes}`;
};

function TimePicker({ value, onChange, className, placeholder = "Select time" }: TimePickerProps) {
  const [parts, setParts] = React.useState<TimeParts>(() => parseTime(value));

  React.useEffect(() => {
    setParts(parseTime(value));
  }, [value]);

  const hasAnySelection = Boolean(parts.hours || parts.minutes || parts.period);
  const hasCompleteValue = Boolean(parts.hours && parts.minutes && parts.period);

  const updatePart = (key: keyof TimeParts, nextValue: string) => {
    setParts((currentParts) => {
      const nextParts = { ...currentParts, [key]: nextValue };
      const serialized = serializeTime(nextParts);

      if (serialized) {
        onChange(serialized);
      } else if (!nextParts.hours && !nextParts.minutes && !nextParts.period) {
        onChange("");
      }

      return nextParts;
    });
  };

  const handleClear = () => {
    setParts(EMPTY_TIME_PARTS);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)_auto] gap-2">
        <Select value={parts.hours || undefined} onValueChange={(nextValue) => updatePart("hours", nextValue)}>
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent className="z-[1300] max-h-72">
            {HOUR_VALUES.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={parts.minutes || undefined} onValueChange={(nextValue) => updatePart("minutes", nextValue)}>
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent className="z-[1300] max-h-72">
            {MINUTE_VALUES.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={parts.period || undefined} onValueChange={(nextValue) => updatePart("period", nextValue)}>
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent className="z-[1300]">
            {PERIOD_VALUES.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClear}
          disabled={!hasAnySelection}
          className={cn("shrink-0", className)}
          aria-label="Clear selected time"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{hasCompleteValue ? `${parts.hours}:${parts.minutes} ${parts.period}` : placeholder}</span>
      </div>
    </div>
  );
}

TimePicker.displayName = "TimePicker";

export { TimePicker };
