import { useState, useRef, useEffect } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useScentNotes, type ScentNote, type NoteType } from "@/hooks/useProductHub";

interface ScentNoteInputProps {
  noteType: NoteType;
  selectedNotes: string[];
  onNotesChange: (notes: string[]) => void;
  label: string;
  description?: string;
  maxNotes?: number;
  disabled?: boolean;
}

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  top: "bg-amber-100 text-amber-800 border-amber-200",
  heart: "bg-rose-100 text-rose-800 border-rose-200",
  base: "bg-stone-100 text-stone-800 border-stone-200",
  modifier: "bg-blue-100 text-blue-800 border-blue-200",
};

export function ScentNoteInput({
  noteType,
  selectedNotes,
  onNotesChange,
  label,
  description,
  maxNotes = 10,
  disabled = false,
}: ScentNoteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [], isLoading } = useScentNotes({
    query: searchQuery,
    noteType,
    existingNotes: selectedNotes,
    enabled: isOpen,
  });

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAddNote = (noteName: string) => {
    if (selectedNotes.length >= maxNotes) return;
    if (selectedNotes.includes(noteName)) return;
    
    onNotesChange([...selectedNotes, noteName]);
    setSearchQuery("");
  };

  const handleRemoveNote = (noteName: string) => {
    onNotesChange(selectedNotes.filter((n) => n !== noteName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      // If there's a matching suggestion, add it
      const match = suggestions.find(
        (s) => s.name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (match) {
        handleAddNote(match.name);
      } else if (suggestions.length > 0) {
        // Add first suggestion
        handleAddNote(suggestions[0].name);
      } else {
        // Allow custom note entry
        handleAddNote(searchQuery.trim());
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {description && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              {description}
            </span>
          )}
        </label>
        <span className="text-xs text-muted-foreground">
          {selectedNotes.length}/{maxNotes}
        </span>
      </div>

      {/* Selected Notes */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedNotes.map((note) => (
          <Badge
            key={note}
            variant="outline"
            className={cn("gap-1 pr-1", NOTE_TYPE_COLORS[noteType])}
          >
            {note}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveNote(note)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Add Button */}
        {selectedNotes.length < maxNotes && !disabled && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Note
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b border-border">
                <Input
                  ref={inputRef}
                  placeholder={`Search ${noteType} notes...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8"
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No matching notes found" : "Start typing to search"}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAddNote(searchQuery.trim())}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add "{searchQuery}"
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {suggestions.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => handleAddNote(note.name)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{note.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {note.scent_family}
                          </span>
                        </div>
                        {note.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {note.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENT PROFILE EDITOR
// Complete editor for top, heart, and base notes
// ═══════════════════════════════════════════════════════════════════════════════

interface ScentProfileEditorProps {
  profile: { top: string[]; heart: string[]; base: string[] };
  onChange: (profile: { top: string[]; heart: string[]; base: string[] }) => void;
  disabled?: boolean;
}

export function ScentProfileEditor({
  profile,
  onChange,
  disabled = false,
}: ScentProfileEditorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>Build your fragrance pyramid from top to base</span>
      </div>

      {/* Top Notes */}
      <div className="relative pl-4 border-l-2 border-amber-300">
        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-amber-300 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amber-800">T</span>
        </div>
        <ScentNoteInput
          noteType="top"
          selectedNotes={profile.top}
          onNotesChange={(notes) => onChange({ ...profile, top: notes })}
          label="Top Notes"
          description="First impression (15-30 min)"
          maxNotes={5}
          disabled={disabled}
        />
      </div>

      {/* Heart Notes */}
      <div className="relative pl-4 border-l-2 border-rose-300">
        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-rose-300 flex items-center justify-center">
          <span className="text-[10px] font-bold text-rose-800">H</span>
        </div>
        <ScentNoteInput
          noteType="heart"
          selectedNotes={profile.heart}
          onNotesChange={(notes) => onChange({ ...profile, heart: notes })}
          label="Heart Notes"
          description="The soul (30 min - 4 hrs)"
          maxNotes={5}
          disabled={disabled}
        />
      </div>

      {/* Base Notes */}
      <div className="relative pl-4 border-l-2 border-stone-400">
        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-stone-400 flex items-center justify-center">
          <span className="text-[10px] font-bold text-stone-800">B</span>
        </div>
        <ScentNoteInput
          noteType="base"
          selectedNotes={profile.base}
          onNotesChange={(notes) => onChange({ ...profile, base: notes })}
          label="Base Notes"
          description="Foundation (4+ hrs)"
          maxNotes={5}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
