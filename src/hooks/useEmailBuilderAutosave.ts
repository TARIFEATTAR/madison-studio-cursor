import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmailComposition } from "@/types/emailBlocks";
import { AUTOSAVE_CONFIG } from "@/config/autosaveConfig";

export type SaveStatus = "unsaved" | "saving" | "saved";

interface UseEmailBuilderAutosaveProps {
  composition: EmailComposition;
  emailSubject: string;
  organizationId: string;
  emailId?: string;
}

export function useEmailBuilderAutosave({
  composition,
  emailSubject,
  organizationId,
  emailId,
}: UseEmailBuilderAutosaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedComposition = useRef<string>(JSON.stringify(composition));
  const dbSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Local storage autosave (every 2 seconds)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentComposition = JSON.stringify(composition);
    if (currentComposition === lastSavedComposition.current) {
      return;
    }

    setSaveStatus("unsaved");

    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, AUTOSAVE_CONFIG.STANDARD_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [composition, emailSubject]);

  // Database autosave (every 30 seconds)
  useEffect(() => {
    if (dbSaveTimeoutRef.current) {
      clearTimeout(dbSaveTimeoutRef.current);
    }

    const currentComposition = JSON.stringify(composition);
    if (currentComposition === lastSavedComposition.current) {
      return;
    }

    dbSaveTimeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, 30000); // 30 seconds

    return () => {
      if (dbSaveTimeoutRef.current) {
        clearTimeout(dbSaveTimeoutRef.current);
      }
    };
  }, [composition, emailSubject, organizationId, emailId]);

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        `email-builder-draft-${organizationId}`,
        JSON.stringify({
          composition,
          subject: emailSubject,
          savedAt: new Date().toISOString(),
          emailId,
        })
      );
      lastSavedComposition.current = JSON.stringify(composition);
      const savedTime = new Date();
      setLastSavedAt(savedTime);
      setSaveStatus("saved");
      console.log("[EmailBuilder Autosave] Saved to localStorage at:", savedTime.toLocaleTimeString());
    } catch (error) {
      console.error("[EmailBuilder Autosave] Error saving to localStorage:", error);
      setSaveStatus("unsaved");
    }
  };

  const saveToDatabase = async () => {
    setSaveStatus("saving");
    try {
      const emailData = {
        title: emailSubject || "Untitled Email",
        content_type: "email",
        full_content: JSON.stringify({
          composition,
          subject: emailSubject,
          type: "email-builder-v2",
        }),
        organization_id: organizationId,
        status: "draft",
      };

      if (emailId) {
        // Update existing
        const { error } = await supabase
          .from("master_content")
          .update({
            full_content: emailData.full_content,
            title: emailData.title,
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from("master_content")
          .insert([emailData])
          .select()
          .single();

        if (error) throw error;
        // Store the new email ID for future saves
        if (data) {
          localStorage.setItem(
            `email-builder-draft-${organizationId}`,
            JSON.stringify({
              composition,
              subject: emailSubject,
              savedAt: new Date().toISOString(),
              emailId: data.id,
            })
          );
        }
      }

      lastSavedComposition.current = JSON.stringify(composition);
      const savedTime = new Date();
      setLastSavedAt(savedTime);
      setSaveStatus("saved");
      console.log("[EmailBuilder Autosave] Saved to database at:", savedTime.toLocaleTimeString());
    } catch (error) {
      console.error("[EmailBuilder Autosave] Error saving to database:", error);
      setSaveStatus("unsaved");
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(`email-builder-draft-${organizationId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("[EmailBuilder Autosave] Error loading draft:", error);
    }
    return null;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(`email-builder-draft-${organizationId}`);
      console.log("[EmailBuilder Autosave] Draft cleared");
    } catch (error) {
      console.error("[EmailBuilder Autosave] Error clearing draft:", error);
    }
  };

  return {
    saveStatus,
    lastSavedAt,
    loadDraft,
    clearDraft,
    forceSave: saveToDatabase,
  };
}
