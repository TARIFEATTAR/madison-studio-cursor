import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MasterContentCard } from "./MasterContentCard";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  word_count: number;
  collection: string | null;
  dip_week: number | null;
  pillar_focus: string | null;
  created_at: string;
}

interface MasterContentLibrarySectionProps {
  masterContents: MasterContent[];
  selectedMasterId: string | null;
  onSelectMaster: (master: MasterContent) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MasterContentLibrarySection({
  masterContents,
  selectedMasterId,
  onSelectMaster,
  onArchive,
  onDelete,
}: MasterContentLibrarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-t border-border/20 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/30 rounded-lg transition-colors mb-3"
      >
        <h3 className="text-sm font-medium text-foreground">Master Content Library</h3>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {masterContents.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No master content yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {masterContents.map((content) => (
                <div
                  key={content.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedMasterId === content.id && "ring-2 ring-primary/20 rounded-lg"
                  )}
                >
                  <MasterContentCard
                    content={content}
                    isSelected={selectedMasterId === content.id}
                    onClick={() => onSelectMaster(content)}
                    onArchive={() => onArchive(content.id)}
                    onDelete={() => onDelete(content.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
