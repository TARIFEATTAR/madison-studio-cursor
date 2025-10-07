import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onSearchFocus?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({ onSearchFocus, onEscape }: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow ESC even in inputs
        if (e.key === "Escape" && onEscape) {
          onEscape();
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // "/" key focuses search
      if (e.key === "/" && onSearchFocus) {
        e.preventDefault();
        onSearchFocus();
      }

      // ESC key clears filters/search
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onSearchFocus, onEscape]);
}
