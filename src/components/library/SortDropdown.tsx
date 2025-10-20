import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type SortOption = "recent" | "alphabetical" | "mostUsed";

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  recent: "Most Recent",
  alphabetical: "A-Z",
  mostUsed: "Most Used",
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Sort: {sortLabels[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("recent")}>
          Most Recent
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("alphabetical")}>
          A-Z
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("mostUsed")}>
          Most Used
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
