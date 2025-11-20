import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

export const NotesPanel = () => {
  const [notes, setNotes] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debouncedNotes = useDebounce(notes, 1000);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("calendar_notes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setNotes(data.note_content || "");
        setNoteId(data.id);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (noteId) {
        // Update existing note
        const { error } = await supabase
          .from("calendar_notes")
          .update({ note_content: debouncedNotes })
          .eq("id", noteId);

        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from("calendar_notes")
          .insert({ user_id: user.id, note_content: debouncedNotes })
          .select()
          .single();

        if (error) throw error;
        setNoteId(data.id);
      }
    } catch (error: any) {
      toast({
        title: "Error saving notes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      saveNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNotes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  return (
    <div>
      <Textarea
        placeholder="Take notes here... (auto-saves)"
        value={notes}
        onChange={(e) => {
          const target = e.target;
          const cursorPosition = target.selectionStart;
          const value = target.value;
          setNotes(value);
          requestAnimationFrame(() => {
            if (target) {
              target.setSelectionRange(cursorPosition, cursorPosition);
            }
          });
        }}
        className="min-h-[300px] resize-none"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Notes auto-save as you type
      </p>
    </div>
  );
};
