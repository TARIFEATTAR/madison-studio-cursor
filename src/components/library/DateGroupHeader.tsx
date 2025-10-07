import { Calendar } from "lucide-react";
import { DateGroup, dateGroupLabels } from "@/utils/dateGrouping";

interface DateGroupHeaderProps {
  group: DateGroup;
  count: number;
}

export function DateGroupHeader({ group, count }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-primary/20">
      <Calendar className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-medium text-foreground">
        {dateGroupLabels[group]}
      </h3>
      <span className="text-sm text-muted-foreground">
        ({count} {count === 1 ? 'item' : 'items'})
      </span>
    </div>
  );
}
