import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SaveStatus = "unsaved" | "saving" | "saved";

interface UseAutoSaveProps {
  content: string;
  contentId?: string;
  contentName: string;
  delay?: number;
}

export function useAutoSave({ 
  content, 
  contentId, 
  contentName,
  delay = 3000 
}: UseAutoSaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef<string>(content);

  useEffect(() => {
    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If content hasn't changed, don't mark as unsaved
    if (content === lastSavedContent.current) {
      return;
    }

    // Mark as unsaved immediately
    setSaveStatus("unsaved");

    // Debounce the save
    timeoutRef.current = setTimeout(async () => {
      await save();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay]);

  const save = async () => {
    if (content === lastSavedContent.current) {
      return;
    }

    setSaveStatus("saving");

    try {
      // Save to localStorage first (fast)
      localStorage.setItem('scriptora-content-draft', JSON.stringify({
        id: contentId,
        title: contentName,
        content,
        savedAt: new Date().toISOString()
      }));

      // Save to database if we have a contentId
      if (contentId) {
        const { error } = await supabase
          .from('master_content')
          .update({ 
            full_content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', contentId);

        if (error) throw error;
      }

      lastSavedContent.current = content;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("unsaved");
    }
  };

  const forceSave = async () => {
    await save();
  };

  return { saveStatus, forceSave };
}
